import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";

export default function HomePage() {
  return (
    <main className="flex-1">
      <section className="grain relative min-h-[100svh] overflow-hidden text-paper">
        <div className="hero-plane absolute inset-0" />
        <SiteNav />
        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-20">
          <p className="animate-rise font-display text-6xl font-semibold tracking-tight md:text-8xl lg:text-9xl">
            Billforge
          </p>
          <div className="mt-6 h-px w-40 origin-left bg-brass draw-underline" />
          <h1 className="animate-rise-delay-1 mt-8 max-w-2xl font-display text-3xl font-medium leading-tight md:text-5xl">
            Invoices & quotes that get paid.
          </h1>
          <p className="animate-rise-delay-2 mt-5 max-w-xl text-base text-paper/75 md:text-lg">
            Skip the accounting suite. Forge a branded document in under a minute, export a clean
            PDF, and send a Stripe pay link when you&apos;re ready to collect.
          </p>
          <div className="animate-rise-delay-3 mt-10 flex flex-wrap gap-3">
            <Link
              href="/app"
              className="cta-pulse rounded-[2px] bg-brass px-5 py-3 text-sm font-semibold text-ink"
            >
              Forge your first invoice free
            </Link>
            <Link
              href="/pricing"
              className="rounded-[2px] border border-paper/30 px-5 py-3 text-sm font-semibold text-paper hover:bg-paper/10"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass-deep">
          One job
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold md:text-5xl">
          From blank page to paid invoice without the QuickBooks tax.
        </h2>
        <p className="mt-4 max-w-2xl text-muted">
          Built for freelancers, consultants, and contractors who bill clients weekly — not for
          bookkeepers running a full ledger.
        </p>
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Draft once",
              copy: "Fill your details, line items, tax, and notes on a single screen.",
            },
            {
              step: "02",
              title: "Export PDF",
              copy: "Download a brass-and-ink document clients actually open and trust.",
            },
            {
              step: "03",
              title: "Collect",
              copy: "Generate a Stripe Checkout pay link for the invoice total in one click.",
            },
          ].map((item) => (
            <li key={item.step} className="border-t border-line pt-5">
              <p className="font-mono text-xs text-brass">{item.step}</p>
              <h3 className="mt-3 font-display text-2xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-line bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
          <h2 className="max-w-xl font-display text-3xl font-semibold md:text-5xl">
            Free to start. Pro when you outgrow the watermark.
          </h2>
          <p className="mt-4 max-w-xl text-paper/70">
            Three documents every month on us. Upgrade for unlimited exports, custom branding, and
            no Billforge mark on the PDF.
          </p>
          <div className="mt-10 flex flex-wrap items-end gap-8">
            <div>
              <p className="font-display text-5xl font-semibold text-brass-glow">$29</p>
              <p className="mt-1 text-sm text-paper/60">per month · or $240/year</p>
            </div>
            <Link
              href="/pricing"
              className="rounded-[2px] bg-brass px-5 py-3 text-sm font-semibold text-ink"
            >
              Compare plans
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
