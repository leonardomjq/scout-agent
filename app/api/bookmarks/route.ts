import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { getLoggedInUser, createSessionClient } from "@/lib/appwrite/server";
import { createAdminClient } from "@/lib/appwrite/admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { documentToAlphaCard, getUserTier } from "@/lib/appwrite/helpers";
import { gateAlphaCard } from "@/lib/refinery/gate";
import { ID } from "node-appwrite";

export async function GET() {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { databases } = await createSessionClient();
    const tier = await getUserTier(user.$id, databases);

    const { databases: adminDb } = createAdminClient();

    const bookmarks = await adminDb.listDocuments(
      DATABASE_ID,
      COLLECTIONS.BOOKMARKS,
      [
        Query.equal("user_id", [user.$id]),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ]
    );

    const cards = [];
    for (const bm of bookmarks.documents) {
      try {
        const doc = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.ALPHA_CARDS,
          bm.card_id
        );
        cards.push(gateAlphaCard(documentToAlphaCard(doc), tier));
      } catch {
        // Card may have been archived/deleted — skip silently
      }
    }

    return NextResponse.json({ data: cards });
  } catch (err) {
    console.error("Bookmarks GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const cardId = body.card_id;
    if (!cardId || typeof cardId !== "string") {
      return NextResponse.json({ error: "card_id required" }, { status: 400 });
    }

    const { databases: adminDb } = createAdminClient();
    const { databases } = await createSessionClient();
    const tier = await getUserTier(user.$id, databases);

    // Enforce free tier limit
    if (tier === "free") {
      const existing = await adminDb.listDocuments(
        DATABASE_ID,
        COLLECTIONS.BOOKMARKS,
        [
          Query.equal("user_id", [user.$id]),
          Query.limit(4),
        ]
      );
      if (existing.total >= 3) {
        return NextResponse.json(
          { error: "Free tier limited to 3 bookmarks. Upgrade for unlimited." },
          { status: 403 }
        );
      }
    }

    try {
      await adminDb.createDocument(
        DATABASE_ID,
        COLLECTIONS.BOOKMARKS,
        ID.unique(),
        { user_id: user.$id, card_id: cardId }
      );
    } catch (err: unknown) {
      const e = err as { code?: number };
      if (e.code === 409) {
        // Already bookmarked — return success
        return NextResponse.json({ bookmarked: true });
      }
      throw err;
    }

    return NextResponse.json({ bookmarked: true });
  } catch (err) {
    console.error("Bookmarks POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("card_id");
    if (!cardId) {
      return NextResponse.json({ error: "card_id required" }, { status: 400 });
    }

    const { databases: adminDb } = createAdminClient();

    const results = await adminDb.listDocuments(
      DATABASE_ID,
      COLLECTIONS.BOOKMARKS,
      [
        Query.equal("user_id", [user.$id]),
        Query.equal("card_id", [cardId]),
        Query.limit(1),
      ]
    );

    if (results.documents.length > 0) {
      await adminDb.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.BOOKMARKS,
        results.documents[0].$id
      );
    }

    return NextResponse.json({ bookmarked: false });
  } catch (err) {
    console.error("Bookmarks DELETE error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
