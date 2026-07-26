# Billforge — Go-to-Market Playbook

## Positioning

> Accounting software is for accountants. Billforge is for getting paid.

Primary CTA: **Forge your first invoice free**

## Channel scripts

### Indie Hackers / X launch

> I got tired of opening QuickBooks to send a $800 invoice.
>
> So I built Billforge — invoices & quotes in under 60 seconds, with a Stripe Pay link baked in.
>
> Free for 3 docs/month. Pro is $29/mo.
> [link]

### Reddit (r/freelance, r/forhire, r/smallbusiness) — value-first

Lead with a free template PDF or Loom walkthrough. Soft mention of the tool in a comment, not the title. Follow subreddit self-promo rules.

### Product Hunt

- Tagline: Professional invoices & quotes in 60 seconds
- First comment: founder story + roadmap (recurring invoices, reminders)
- Offer founding annual price $149 for first 100 hunters

### SEO pages to add next

1. `/templates/freelance-invoice`
2. `/templates/contractor-quote`
3. `/blog/how-to-invoice-as-a-freelancer`

## Conversion funnel

1. Landing → open editor (no signup friction)
2. Create first invoice → export PDF (watermark on free)
3. Soft paywall on 4th doc or “Remove watermark”
4. Stripe Checkout → Pro unlocked

## Metrics to watch weekly

- Visitors → editor opens
- Documents created
- Free → Pro conversion rate (target ≥3%)
- Churn (target <6%/mo)
- MRR

## First dollar path (same day)

1. `npm run build && npm start` or deploy to Vercel
2. Add Stripe test keys → complete a test checkout
3. Flip to live keys
4. Post in 3 communities with the live URL
