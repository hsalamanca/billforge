"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/Button";
import { PRICING } from "@/lib/types";

export default function PricingPage() {
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.demoAvailable) {
        setMessage(
          "Stripe keys not set yet. Use “Unlock Pro (demo)” below to test the paid experience locally, then add keys from .env.example to take real payments.",
        );
      } else {
        setMessage(data.error || "Checkout unavailable");
      }
    } catch {
      setMessage("Network error starting checkout");
    } finally {
      setLoading(false);
    }
  }

  async function demoUnlock() {
    setLoading(true);
    try {
      const res = await fetch("/api/verify-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: "demo_pro_unlock" }),
      });
      const data = await res.json();
      if (data.ok) {
        const { setPro } = await import("@/lib/storage");
        setPro(true, { proUntil: data.proUntil });
        window.location.href = "/app?upgraded=1";
        return;
      }
      setMessage(data.error || "Demo unlock failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1">
      <SiteNav solid />
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass-deep">Pricing</p>
        <h1 className="mt-3 font-display text-4xl font-semibold md:text-6xl">
          Simple plans. Clear path to profit.
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Start free. Upgrade when the watermark costs you more credibility than $29.
        </p>

        <div className="mt-8 inline-flex rounded-[2px] border border-line bg-white/60 p-1">
          <button
            type="button"
            onClick={() => setPlan("monthly")}
            className={`px-4 py-2 text-sm font-semibold ${plan === "monthly" ? "bg-ink text-paper" : "text-muted"}`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setPlan("yearly")}
            className={`px-4 py-2 text-sm font-semibold ${plan === "yearly" ? "bg-ink text-paper" : "text-muted"}`}
          >
            Yearly · save $108
          </button>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <article className="border border-line bg-white/55 p-7">
            <h2 className="font-display text-3xl font-semibold">Free</h2>
            <p className="mt-2 text-4xl font-semibold">$0</p>
            <ul className="mt-6 space-y-3 text-sm text-ink-soft">
              <li>3 invoices or quotes per month</li>
              <li>PDF export with Billforge watermark</li>
              <li>Local document history in your browser</li>
            </ul>
            <Link
              href="/app"
              className="mt-8 inline-flex rounded-[2px] border border-line px-4 py-2.5 text-sm font-semibold"
            >
              Start free
            </Link>
          </article>

          <article className="border border-brass bg-ink p-7 text-paper">
            <h2 className="font-display text-3xl font-semibold text-brass-glow">Pro</h2>
            <p className="mt-2 text-4xl font-semibold">
              {plan === "monthly" ? PRICING.monthly.label : PRICING.yearly.label}
              <span className="ml-2 text-base font-normal text-paper/60">
                /{plan === "monthly" ? "mo" : "yr"}
              </span>
            </p>
            <ul className="mt-6 space-y-3 text-sm text-paper/80">
              <li>Unlimited documents</li>
              <li>No watermark + custom logo</li>
              <li>Stripe pay links on invoices</li>
              <li>Quote → invoice conversion</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={startCheckout} disabled={loading} className="bg-brass text-ink">
                {loading ? "Starting…" : "Upgrade with Stripe"}
              </Button>
              <Button variant="ghost" onClick={demoUnlock} disabled={loading} className="border-paper/30 text-paper">
                Unlock Pro (demo)
              </Button>
            </div>
          </article>
        </div>

        {message ? <p className="mt-6 max-w-2xl text-sm text-sea">{message}</p> : null}

        <p className="mt-10 max-w-2xl text-sm text-muted">
          To take real payments: create a Stripe product, paste keys into{" "}
          <code className="font-mono text-ink">.env.local</code>, deploy, and point a webhook to{" "}
          <code className="font-mono text-ink">/api/webhook</code>. Details in{" "}
          <code className="font-mono text-ink">BUSINESS_PLAN.md</code>.
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}
