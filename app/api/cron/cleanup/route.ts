import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { computeFreshness } from "@/lib/refinery/freshness";

export async function POST(request: NextRequest) {
  try {
    // Bearer token auth
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const expectedToken = process.env.PIPELINE_BEARER_TOKEN;

    if (!expectedToken || token !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { databases } = createAdminClient();
    let noncesDeleted = 0;
    let cardsUpdated = 0;

    // 1. Delete expired nonces (>5min old) — paginate through all
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    let nonceCursor: string | undefined;
    while (true) {
      const nonceQueries = [
        Query.lessThan("$createdAt", fiveMinAgo),
        Query.limit(500),
      ];
      if (nonceCursor) nonceQueries.push(Query.cursorAfter(nonceCursor));

      const oldNonces = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.INGEST_NONCES,
        nonceQueries
      );

      for (const nonce of oldNonces.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTIONS.INGEST_NONCES,
          nonce.$id
        );
        noncesDeleted++;
      }

      if (oldNonces.documents.length < 500) break;
      nonceCursor = oldNonces.documents[oldNonces.documents.length - 1].$id;
    }

    // 2. Update freshness scores for non-archived cards — paginate through all
    let cardCursor: string | undefined;
    while (true) {
      const cardQueries = [
        Query.notEqual("status", ["archived"]),
        Query.limit(500),
      ];
      if (cardCursor) cardQueries.push(Query.cursorAfter(cardCursor));

      const activeCards = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ALPHA_CARDS,
        cardQueries
      );

      for (const card of activeCards.documents) {
        const { status: newStatus, score: newScore } = computeFreshness(
          card.$createdAt
        );

        // Only update if status or score changed meaningfully
        if (card.status !== newStatus || Math.abs(Number(card.freshness_score) - newScore) > 0.01) {
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.ALPHA_CARDS,
            card.$id,
            {
              status: newStatus,
              freshness_score: newScore,
            }
          );
          cardsUpdated++;
        }
      }

      if (activeCards.documents.length < 500) break;
      cardCursor = activeCards.documents[activeCards.documents.length - 1].$id;
    }

    return NextResponse.json({
      message: "Cleanup completed",
      nonces_deleted: noncesDeleted,
      cards_updated: cardsUpdated,
    });
  } catch (err) {
    console.error("Cleanup error:", err);
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
