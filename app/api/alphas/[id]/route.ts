import { NextRequest, NextResponse } from "next/server";
import { getLoggedInUser, createSessionClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { documentToAlphaCard, getUserTier } from "@/lib/appwrite/helpers";
import { gateAlphaCard } from "@/lib/refinery/gate";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getLoggedInUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { databases } = await createSessionClient();
    const tier = await getUserTier(user.$id, databases);

    // Fetch card
    try {
      const doc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.ALPHA_CARDS,
        id
      );

      const card = documentToAlphaCard(doc);
      const gatedCard = gateAlphaCard(card, tier);

      return NextResponse.json({ data: gatedCard });
    } catch {
      return NextResponse.json(
        { error: "Alpha card not found" },
        { status: 404 }
      );
    }
  } catch (err) {
    console.error("Alpha detail error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
