import { NextResponse } from "next/server";
import { getLoggedInUser } from "@/lib/appwrite/server";
import { getStripe } from "@/lib/stripe/client";
import { createOrGetCustomer } from "@/lib/stripe/helpers";

export async function POST() {
  try {
    const user = await getLoggedInUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerId = await createOrGetCustomer(user.$id, user.email);
    const stripe = getStripe();

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Portal error:", err);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
