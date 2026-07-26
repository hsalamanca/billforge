import { NextResponse } from "next/server";
import { appUrl, getStripe, stripeConfigured } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      plan?: "monthly" | "yearly";
      email?: string;
    };
    const plan = body.plan === "yearly" ? "yearly" : "monthly";

    if (!stripeConfigured()) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Add keys from .env.example, or use demo unlock in development.",
          demoAvailable: process.env.NODE_ENV !== "production",
        },
        { status: 503 },
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe unavailable" }, { status: 503 });
    }

    const priceId =
      plan === "yearly" ? process.env.STRIPE_PRICE_YEARLY : process.env.STRIPE_PRICE_MONTHLY;

    if (!priceId) {
      return NextResponse.json({ error: `Missing Stripe price for ${plan}` }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl()}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl()}/pricing?cancelled=1`,
      customer_email: body.email || undefined,
      allow_promotion_codes: true,
      metadata: { product: "billforge_pro", plan },
      subscription_data: {
        metadata: { product: "billforge_pro", plan },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to start checkout" }, { status: 500 });
  }
}
