"use server";

import { cookies } from "next/headers";
import { Query } from "node-appwrite";
import { createAdminClient } from "./admin";
import { SESSION_COOKIE, DATABASE_ID, COLLECTIONS } from "./collections";
import { getLoggedInUser } from "./server";
import { getStripe } from "@/lib/stripe/client";

export async function deleteAccount(): Promise<{ error?: string }> {
  const user = await getLoggedInUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const userId = user.$id;

  try {
    const { users, databases } = createAdminClient();

    // Cancel active Stripe subscriptions
    const profile = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.USER_PROFILES,
      userId
    );

    if (profile.stripe_customer_id) {
      try {
        const stripe = getStripe();
        const subscriptions = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id as string,
          status: "active",
        });
        for (const sub of subscriptions.data) {
          await stripe.subscriptions.cancel(sub.id);
        }
      } catch (err) {
        console.error(`[deleteAccount] Stripe cleanup failed for user ${userId}:`, err);
        // Best-effort Stripe cleanup — don't block account deletion
      }
    }

    // Delete subscriptions documents
    try {
      const subs = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SUBSCRIPTIONS,
        [Query.equal("user_id", [userId])]
      );
      for (const doc of subs.documents) {
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.SUBSCRIPTIONS, doc.$id);
      }
    } catch (err) {
      console.error(`[deleteAccount] Subscription doc cleanup failed for user ${userId}:`, err);
    }

    // Delete user profile
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.USER_PROFILES, userId);
    } catch (err) {
      console.error(`[deleteAccount] Profile deletion failed for user ${userId}:`, err);
    }

    // Delete Appwrite user account
    await users.delete(userId);

    // Clear session cookie
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);

    return {};
  } catch (err) {
    console.error(`[deleteAccount] Account deletion failed for user ${userId}:`, err);
    return { error: "Failed to delete account. Please contact support." };
  }
}
