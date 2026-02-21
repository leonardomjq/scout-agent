import { NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { getLoggedInUser, createSessionClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { getUserTier } from "@/lib/appwrite/helpers";

export async function GET() {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { databases } = await createSessionClient();
    const tier = await getUserTier(user.$id, databases);

    if (tier !== "pro") {
      return NextResponse.json({ error: "Pro required" }, { status: 403 });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Fetch active cards (fresh + warm)
    const activeResult = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ALPHA_CARDS,
      [
        Query.equal("status", ["fresh", "warm"]),
        Query.orderDesc("signal_strength"),
        Query.limit(200),
      ]
    );

    // Fetch this week's cards for week-over-week
    const thisWeekResult = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ALPHA_CARDS,
      [
        Query.greaterThanEqual("$createdAt", sevenDaysAgo.toISOString()),
        Query.limit(200),
      ]
    );

    // Fetch last week's cards for week-over-week
    const lastWeekResult = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ALPHA_CARDS,
      [
        Query.greaterThanEqual("$createdAt", fourteenDaysAgo.toISOString()),
        Query.lessThan("$createdAt", sevenDaysAgo.toISOString()),
        Query.limit(200),
      ]
    );

    // Aggregate categories
    const categories: Record<string, { count: number; total_strength: number; directions: Record<string, number> }> = {};

    for (const doc of activeResult.documents) {
      const cat = doc.category as string;
      if (!categories[cat]) {
        categories[cat] = { count: 0, total_strength: 0, directions: {} };
      }
      categories[cat].count++;
      categories[cat].total_strength += doc.signal_strength as number;
      const dir = doc.direction as string;
      categories[cat].directions[dir] = (categories[cat].directions[dir] ?? 0) + 1;
    }

    const categoryStats: Record<string, { count: number; avg_strength: number; dominant_direction: string }> = {};
    for (const [cat, data] of Object.entries(categories)) {
      const dominantDir = Object.entries(data.directions).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] ?? "new";
      categoryStats[cat] = {
        count: data.count,
        avg_strength: data.count > 0 ? data.total_strength / data.count : 0,
        dominant_direction: dominantDir,
      };
    }

    // Trending entities
    const entityCounts: Record<string, number> = {};
    for (const doc of activeResult.documents) {
      const entities = doc.entities as string[];
      for (const entity of entities) {
        entityCounts[entity] = (entityCounts[entity] ?? 0) + 1;
      }
    }
    const trendingEntities = Object.entries(entityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, count]) => ({ name, count }));

    // Week-over-week
    const thisWeekCount = thisWeekResult.total;
    const lastWeekCount = lastWeekResult.total;
    const changePct =
      lastWeekCount > 0
        ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
        : thisWeekCount > 0
          ? 100
          : 0;

    // Top cards
    const topCards = activeResult.documents.slice(0, 5).map((doc) => ({
      id: doc.$id,
      title: doc.title as string,
      signal_strength: doc.signal_strength as number,
      category: doc.category as string,
      direction: doc.direction as string,
    }));

    return NextResponse.json({
      categories: categoryStats,
      trending_entities: trendingEntities,
      week_over_week: {
        this_week: thisWeekCount,
        last_week: lastWeekCount,
        change_pct: changePct,
      },
      top_cards: topCards,
    });
  } catch (err) {
    console.error("Pulse error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
