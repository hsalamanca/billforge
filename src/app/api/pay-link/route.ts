import { NextResponse } from "next/server";
import { z } from "zod";
import { appUrl, getStripe, stripeConfigured } from "@/lib/stripe";

const schema = z.object({
  documentNumber: z.string().min(1),
  clientEmail: z.string().email().optional().or(z.literal("")),
  description: z.string().min(1),
  amountCents: z.number().int().positive(),
  currency: z.string().default("usd"),
});

export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json(
      {
        error: "Connect Stripe to generate live Pay links.",
        demoUrl: `${appUrl()}/pricing`,
      },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe unavailable" }, { status: 503 });
  }

  try {
    const parsed = schema.parse(await request.json());

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: parsed.clientEmail || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: parsed.currency.toLowerCase(),
            unit_amount: parsed.amountCents,
            product_data: {
              name: `${parsed.documentNumber} — ${parsed.description}`,
            },
          },
        },
      ],
      success_url: `${appUrl()}/success?paid=1&doc=${encodeURIComponent(parsed.documentNumber)}`,
      cancel_url: `${appUrl()}/app`,
      metadata: {
        documentNumber: parsed.documentNumber,
        kind: "invoice_payment",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to create pay link" }, { status: 400 });
  }
}
