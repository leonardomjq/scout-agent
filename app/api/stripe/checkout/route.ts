import { NextRequest, NextResponse } from "next/server";
import { getLoggedInUser } from "@/lib/appwrite/server";
import { getStripe } from "@/lib/stripe/client";
import { createOrGetCustomer } from "@/lib/stripe/helpers";

export async function POST(request: NextRequest) {
  try {
    const user = await getLoggedInUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interval = request.nextUrl.searchParams.get("interval");
    const priceId =
      interval === "annual"
        ? (process.env.STRIPE_PRO_PRICE_ID_ANNUAL ??
          process.env.STRIPE_PRO_PRICE_ID!)
        : (process.env.STRIPE_PRO_PRICE_ID_MONTHLY ??
          process.env.STRIPE_PRO_PRICE_ID!);

    const customerId = await createOrGetCustomer(user.$id, user.email);
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
      metadata: {
        user_id: user.$id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
