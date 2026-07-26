# Billforge — Business Plan

## One-liner

Billforge is a freemium SaaS that lets freelancers and contractors create branded invoices and quotes in under 60 seconds — without QuickBooks bloat — and get paid via Stripe.

## Why this business

| Signal | Evidence |
| --- | --- |
| Market size | Freelancer invoicing software ~$2.6B (2025), ~9.6% CAGR |
| Buyer willingness | Solo freelancers routinely pay $9–$29/mo for focused tools |
| Pain | FreshBooks/QuickBooks feel heavy; Wave is free but weak on payments UX |
| Buildability | Core loop is CRUD + PDF + Stripe — shippable as a solo MVP |
| Retention | Billing is weekly/recurring; switching cost rises as client history grows |

## Ideal customer

- Independent freelancers and 1–3 person agencies (design, dev, consulting, trades)
- Billing $3k–$20k/month
- Hate accounting suites; need professional docs + a Pay Now link
- Buy alone — no procurement cycle

## Offer & pricing

| Plan | Price | Limits |
| --- | --- | --- |
| Free | $0 | 3 documents/month, Billforge watermark on PDFs |
| Pro | **$29/month** or **$240/year** | Unlimited docs, custom logo, no watermark, saved clients, Stripe Pay links |

Unit economics (target):

- Gross margin: ~85–90% (SaaS + Stripe fees)
- CAC target via organic: <$40 (Product Hunt, Reddit, SEO)
- LTV at 8-month average retention × $29 ≈ $232
- Path to $5k MRR ≈ 173 Pro subscribers

## Competitive wedge

1. **Speed** — blank-to-PDF in one screen, not an accounting product tour
2. **Payment-first** — every invoice can carry a Stripe Checkout “Pay now” link
3. **Quotes + invoices** — same editor, convert quote → invoice in one click
4. **Price clarity** — cheaper and simpler than FreshBooks; more professional than Wave

## Go-to-market (first 90 days)

1. **Week 1–2:** Soft launch on Indie Hackers + r/freelance + r/webdev with free plan
2. **Week 2–3:** Product Hunt launch; collect emails for annual founding discount ($149/yr)
3. **Week 3–8:** SEO landing pages: “freelance invoice template”, “contractor quote generator”
4. **Ongoing:** Partner with freelancing newsletters; affiliate 30% for 12 months

## Revenue activation checklist

1. Create Stripe account → Product “Billforge Pro” → monthly + yearly prices
2. Set env vars from `.env.example`
3. Deploy to Vercel (or similar)
4. Point Stripe webhook to `/api/webhook`
5. Publish landing URL and start outreach from `GO_TO_MARKET.md`

## Honest constraints

Software alone does not print money. Profit requires deployment, Stripe live keys, and consistent distribution. This repo is the complete sellable product + playbook; revenue starts when you ship and sell it.
