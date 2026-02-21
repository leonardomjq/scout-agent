import { NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { getLoggedInUser, createSessionClient } from "@/lib/appwrite/server";
import { createAdminClient } from "@/lib/appwrite/admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { getUserTier } from "@/lib/appwrite/helpers";

export async function GET() {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { databases: adminDb } = createAdminClient();
    const { databases } = await createSessionClient();
    const tier = await getUserTier(user.$id, databases);

    const bookmarks = await adminDb.listDocuments(
      DATABASE_ID,
      COLLECTIONS.BOOKMARKS,
      [
        Query.equal("user_id", [user.$id]),
        Query.limit(100),
      ]
    );

    const ids = bookmarks.documents.map((doc) => doc.card_id as string);

    return NextResponse.json({
      ids,
      count: ids.length,
      limit: tier === "free" ? 3 : null,
    });
  } catch (err) {
    console.error("Bookmarks IDs error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
