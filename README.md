# Billforge

**Professional invoices & quotes for freelancers — built to produce revenue.**

Billforge is a freemium micro-SaaS: create branded invoices/quotes in under a minute, export PDFs, and collect payment via Stripe Checkout links. Free plan is watermarked (3 docs/month). Pro is $29/mo or $240/yr.

## Live

| | |
| --- | --- |
| Production | https://billforge-eta.vercel.app |
| GitHub | https://github.com/hsalamanca/billforge |
| Vercel project | https://vercel.com/huguinho/billforge |

GitHub ↔ Vercel are connected: pushes to `main` auto-deploy to production.

## Quick start

```bash
cd billforge
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Landing: `/`
- Pricing / Stripe checkout: `/pricing`
- Studio editor: `/app`

Without Stripe keys, use **Unlock Pro (demo)** on the pricing page to exercise the paid path locally.

## Take real payments (profit path)

1. Create a [Stripe](https://dashboard.stripe.com) account
2. Create product **Billforge Pro** with monthly ($29) and yearly ($240) prices
3. Copy keys into `.env.local` (see `.env.example`)
4. Deploy to Vercel (or any Node host)
5. Add webhook endpoint `https://your-domain/api/webhook` for `checkout.session.completed`
6. Ship traffic using `GO_TO_MARKET.md`

## Project docs

- `BUSINESS_PLAN.md` — market, pricing, unit economics
- `GO_TO_MARKET.md` — launch channels and conversion funnel

## Stack

- Next.js App Router + TypeScript + Tailwind
- jsPDF for client-side PDF export
- Stripe Checkout for Pro subscriptions and invoice pay links
- Browser localStorage for MVP persistence (swap for a DB when you need multi-device sync)

## Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
```
