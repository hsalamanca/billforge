"use client";

import { Suspense, useEffect, useState, startTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { setPro } from "@/lib/storage";

function SuccessInner() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const paid = params.get("paid");
  const doc = params.get("doc");

  const initialStatus = paid ? "ok" : sessionId ? "loading" : "error";
  const [status, setStatus] = useState<"loading" | "ok" | "error">(initialStatus);
  const [error, setError] = useState<string | null>(
    !paid && !sessionId ? "Missing checkout session." : null,
  );

  useEffect(() => {
    if (paid || !sessionId) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok || !data.ok) {
          startTransition(() => {
            setStatus("error");
            setError(data.error || "Could not verify payment");
          });
          return;
        }

        setPro(true, {
          proUntil: data.proUntil,
          stripeCustomerId: data.customerId,
        });
        startTransition(() => setStatus("ok"));
      } catch {
        if (cancelled) return;
        startTransition(() => {
          setStatus("error");
          setError("Verification failed");
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, paid]);

  return (
    <section className="mx-auto max-w-2xl px-5 py-24 md:px-8">
      {status === "loading" ? (
        <p className="text-muted">Confirming your checkout…</p>
      ) : null}
      {status === "ok" ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass-deep">
            {paid ? "Payment received" : "Welcome to Pro"}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
            {paid
              ? `Thanks — ${doc || "invoice"} is marked for collection.`
              : "Pro is unlocked on this device."}
          </h1>
          <p className="mt-4 text-muted">
            {paid
              ? "Your client completed Stripe Checkout. Update the document status to Paid in the studio."
              : "Unlimited documents, watermark-free PDFs, and pay links are ready."}
          </p>
          <Link
            href="/app"
            className="mt-8 inline-flex rounded-[2px] bg-brass px-5 py-3 text-sm font-semibold text-ink"
          >
            Back to studio
          </Link>
        </>
      ) : null}
      {status === "error" ? (
        <>
          <h1 className="font-display text-4xl font-semibold">Something went wrong</h1>
          <p className="mt-4 text-danger">{error}</p>
          <Link href="/pricing" className="mt-8 inline-block text-sm font-semibold underline">
            Return to pricing
          </Link>
        </>
      ) : null}
    </section>
  );
}

export default function SuccessPage() {
  return (
    <main className="flex-1">
      <SiteNav solid />
      <Suspense fallback={<p className="px-8 py-24 text-muted">Loading…</p>}>
        <SuccessInner />
      </Suspense>
    </main>
  );
}
