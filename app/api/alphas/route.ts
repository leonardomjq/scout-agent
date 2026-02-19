import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { getLoggedInUser, createSessionClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { documentToAlphaCard, getUserTier } from "@/lib/appwrite/helpers";
import { gateAlphaCard } from "@/lib/refinery/gate";

export async function GET(request: NextRequest) {
  try {
    const user = await getLoggedInUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { databases } = await createSessionClient();
    const tier = await getUserTier(user.$id, databases);

    // Parse query params
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
    const category = searchParams.get("category");
    const direction = searchParams.get("direction");
    const status = searchParams.get("status");

    // Build query — default to showing fresh + warm cards
    const statusFilter = status
      ? [status]
      : ["fresh", "warm"];

    const queries = [
      Query.equal("status", statusFilter),
      Query.orderDesc("freshness_score"),
      Query.limit(limit + 1), // +1 to detect next page
    ];

    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }
    if (category) {
      queries.push(Query.equal("category", [category]));
    }
    if (direction) {
      queries.push(Query.equal("direction", [direction]));
    }

    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ALPHA_CARDS,
      queries
    );

    const hasMore = result.documents.length > limit;
    const items = result.documents.slice(0, limit);

    // Map & apply tier gating
    const gatedCards = items.map((doc) =>
      gateAlphaCard(documentToAlphaCard(doc), tier)
    );

    const nextCursor = hasMore ? items[items.length - 1]?.$id : null;

    return NextResponse.json({
      data: gatedCards,
      cursor: nextCursor,
      has_more: hasMore,
    });
  } catch (err) {
    console.error("Alphas error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
