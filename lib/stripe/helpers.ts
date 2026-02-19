import { ID, Query } from "node-appwrite";
import { getStripe } from "./client";
import { createAdminClient } from "@/lib/appwrite/admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";

export async function createOrGetCustomer(
  userId: string,
  email: string
): Promise<string> {
  const { databases } = createAdminClient();

  const profile = await databases.getDocument(
    DATABASE_ID,
    COLLECTIONS.USER_PROFILES,
    userId
  );

  if (profile.stripe_customer_id) {
    return profile.stripe_customer_id as string;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email,
    metadata: { user_id: userId },
  });

  await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.USER_PROFILES,
    userId,
    { stripe_customer_id: customer.id }
  );

  return customer.id;
}

export async function handleSubscriptionChange(
  subscriptionId: string,
  customerId: string,
  status: string,
  priceId: string,
  currentPeriodStart: number,
  currentPeriodEnd: number,
  cancelAtPeriodEnd: boolean
): Promise<void> {
  const { databases } = createAdminClient();

  // Find user by stripe_customer_id
  const profiles = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.USER_PROFILES,
    [Query.equal("stripe_customer_id", [customerId]), Query.limit(1)]
  );

  if (profiles.total === 0) {
    throw new Error(`No user found for Stripe customer ${customerId}`);
  }

  const profile = profiles.documents[0];
  const userId = profile.$id;

  // Map Stripe status to our status
  const mappedStatus = mapStripeStatus(status);

  // Try update existing subscription, catch 404 → create
  const existingSubs = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.SUBSCRIPTIONS,
    [Query.equal("stripe_subscription_id", [subscriptionId]), Query.limit(1)]
  );

  const subData = {
    user_id: userId,
    stripe_subscription_id: subscriptionId,
    stripe_price_id: priceId,
    status: mappedStatus,
    current_period_start: new Date(currentPeriodStart * 1000).toISOString(),
    current_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
    cancel_at_period_end: cancelAtPeriodEnd,
  };

  if (existingSubs.total > 0) {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      existingSubs.documents[0].$id,
      subData
    );
  } else {
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      ID.unique(),
      subData
    );
  }

  // Update user tier
  const newTier = mappedStatus === "active" || mappedStatus === "trialing" ? "pro" : "free";
  await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.USER_PROFILES,
    userId,
    { tier: newTier }
  );
}

function mapStripeStatus(stripeStatus: string): string {
  const statusMap: Record<string, string> = {
    active: "active",
    canceled: "canceled",
    past_due: "past_due",
    trialing: "trialing",
    incomplete: "incomplete",
    incomplete_expired: "canceled",
    unpaid: "past_due",
  };
  return statusMap[stripeStatus] ?? "canceled";
}
