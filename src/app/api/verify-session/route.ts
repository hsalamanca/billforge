import { NextResponse } from "next/server";
import { getStripe, stripeConfigured } from "@/lib/stripe";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { sessionId?: string };

  if (!body.sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  // Local demo unlock when Stripe is not wired
  if (body.sessionId === "demo_pro_unlock") {
    if (process.env.NODE_ENV === "production" && stripeConfigured()) {
      return NextResponse.json({ error: "Demo unlock disabled" }, { status: 403 });
    }
    const proUntil = new Date();
    proUntil.setFullYear(proUntil.getFullYear() + 1);
    return NextResponse.json({
      ok: true,
      isPro: true,
      proUntil: proUntil.toISOString(),
      demo: true,
    });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(body.sessionId, {
      expand: ["subscription"],
    });

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json({ error: "Checkout not complete" }, { status: 402 });
    }

    let proUntil: string | undefined;
    const sub = session.subscription;
    if (sub && typeof sub !== "string") {
      const periodEnd = sub.items?.data?.[0]?.current_period_end;
      if (periodEnd) {
        proUntil = new Date(periodEnd * 1000).toISOString();
      }
    }
    if (!proUntil) {
      const fallback = new Date();
      fallback.setMonth(fallback.getMonth() + 1);
      proUntil = fallback.toISOString();
    }

    return NextResponse.json({
      ok: true,
      isPro: true,
      proUntil,
      customerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to verify session" }, { status: 500 });
  }
}
