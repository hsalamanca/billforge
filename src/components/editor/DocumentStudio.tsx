"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/Button";
import { documentTotals, formatMoney } from "@/lib/currency";
import { downloadDocumentPdf } from "@/lib/pdf";
import { emitStudioChange, useStudioSnapshot } from "@/lib/store";
import {
  convertQuoteToInvoice,
  createBlankDocument,
  deleteDocument,
  saveDocument,
  saveProfile,
} from "@/lib/storage";
import type { BillDocument, DocumentType } from "@/lib/types";

function initialToast(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("upgraded") === "1"
    ? "Pro unlocked. Watermark removed."
    : null;
}

export function DocumentStudio() {
  const { docs, usage, gate } = useStudioSnapshot();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(initialToast);

  const resolvedActiveId = activeId && docs.some((d) => d.id === activeId) ? activeId : docs[0]?.id ?? null;

  const active = useMemo(
    () => docs.find((d) => d.id === resolvedActiveId) ?? null,
    [docs, resolvedActiveId],
  );

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  }

  function createDoc(type: DocumentType) {
    const doc = createBlankDocument(type);
    if (!doc) {
      showToast("Free limit reached — upgrade to Pro for unlimited documents.");
      return;
    }
    emitStudioChange();
    setActiveId(doc.id);
    showToast(`${type === "invoice" ? "Invoice" : "Quote"} created`);
  }

  function updateActive(patch: Partial<BillDocument>) {
    if (!active) return;
    const next = saveDocument({ ...active, ...patch });
    if (patch.from) saveProfile(patch.from);
    emitStudioChange();
    setActiveId(next.id);
  }

  function updateItem(id: string, patch: Partial<BillDocument["items"][number]>) {
    if (!active) return;
    updateActive({
      items: active.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    });
  }

  function addItem() {
    if (!active) return;
    updateActive({
      items: [...active.items, { id: nanoid(6), description: "", quantity: 1, rate: 0 }],
    });
  }

  function removeItem(id: string) {
    if (!active || active.items.length <= 1) return;
    updateActive({ items: active.items.filter((item) => item.id !== id) });
  }

  async function exportPdf() {
    if (!active) return;
    setBusy("pdf");
    try {
      downloadDocumentPdf(active, { watermark: !gate.isPro });
      showToast(gate.isPro ? "PDF downloaded" : "PDF downloaded with watermark");
    } finally {
      setBusy(null);
    }
  }

  async function createPayLink() {
    if (!active || active.type !== "invoice") return;
    const { total } = documentTotals(active.items, active.taxRate);
    if (total <= 0) {
      showToast("Add a positive total before creating a pay link.");
      return;
    }
    if (!gate.isPro) {
      showToast("Pay links are a Pro feature.");
      return;
    }
    setBusy("pay");
    try {
      const res = await fetch("/api/pay-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentNumber: active.number,
          clientEmail: active.to.email,
          description: `${active.from.name || "Invoice"} for ${active.to.name || "client"}`,
          amountCents: Math.round(total * 100),
          currency: active.currency.toLowerCase(),
        }),
      });
      const data = await res.json();
      if (data.url) {
        await navigator.clipboard.writeText(data.url);
        showToast("Pay link copied to clipboard");
        return;
      }
      showToast(data.error || "Could not create pay link");
    } finally {
      setBusy(null);
    }
  }

  function onConvert() {
    if (!active || active.type !== "quote") return;
    const invoice = convertQuoteToInvoice(active.id);
    if (!invoice) {
      showToast("Free limit reached — upgrade to convert more quotes.");
      return;
    }
    emitStudioChange();
    setActiveId(invoice.id);
    showToast("Quote converted to invoice");
  }

  const totals = active ? documentTotals(active.items, active.taxRate) : null;

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-7xl gap-0 lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-line bg-white/50 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between border-b border-line px-4 py-4">
          <Link href="/" className="font-display text-xl font-semibold">
            Billforge
          </Link>
          <Link href="/pricing" className="text-xs font-semibold text-brass-deep">
            {gate.isPro ? "Pro" : "Upgrade"}
          </Link>
        </div>
        <div className="space-y-2 p-4">
          <Button className="w-full" onClick={() => createDoc("invoice")}>
            New invoice
          </Button>
          <Button className="w-full" variant="ghost" onClick={() => createDoc("quote")}>
            New quote
          </Button>
          <p className="pt-2 text-xs text-muted">
            {gate.isPro
              ? "Unlimited documents this month"
              : `${gate.remaining} free document${gate.remaining === 1 ? "" : "s"} left this month`}
          </p>
        </div>
        <ul className="max-h-[50vh] space-y-1 overflow-auto px-2 pb-4 lg:max-h-none">
          {docs.length === 0 ? (
            <li className="px-3 py-6 text-sm text-muted">No documents yet. Create your first one.</li>
          ) : (
            docs.map((doc) => (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(doc.id)}
                  className={`w-full rounded-[2px] px-3 py-2.5 text-left transition ${
                    doc.id === resolvedActiveId ? "bg-ink text-paper" : "hover:bg-paper-deep/70"
                  }`}
                >
                  <p className="truncate text-sm font-semibold">
                    {doc.to.name || "Untitled client"}
                  </p>
                  <p
                    className={`truncate font-mono text-[11px] ${
                      doc.id === resolvedActiveId ? "text-brass-glow" : "text-muted"
                    }`}
                  >
                    {doc.type.toUpperCase()} · {doc.number}
                  </p>
                </button>
              </li>
            ))
          )}
        </ul>
      </aside>

      <section className="p-4 md:p-8">
        {toast ? (
          <div className="mb-4 rounded-[2px] border border-brass/40 bg-brass/10 px-4 py-3 text-sm">
            {toast}
          </div>
        ) : null}

        {!active ? (
          <div className="flex min-h-[50vh] flex-col items-start justify-center">
            <h1 className="font-display text-4xl font-semibold">Your billing studio</h1>
            <p className="mt-3 max-w-lg text-muted">
              Create a quote or invoice. Everything saves in this browser until you connect a
              backend later.
            </p>
            <div className="mt-8 flex gap-3">
              <Button onClick={() => createDoc("invoice")}>New invoice</Button>
              <Button variant="secondary" onClick={() => createDoc("quote")}>
                New quote
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-brass">
                    {active.type}
                  </p>
                  <h1 className="font-display text-3xl font-semibold">{active.number}</h1>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" onClick={exportPdf} disabled={busy === "pdf"}>
                    Export PDF
                  </Button>
                  {active.type === "invoice" ? (
                    <Button onClick={createPayLink} disabled={busy === "pay"}>
                      Copy pay link
                    </Button>
                  ) : (
                    <Button onClick={onConvert}>Convert to invoice</Button>
                  )}
                  <Button
                    variant="danger"
                    onClick={() => {
                      deleteDocument(active.id);
                      emitStudioChange();
                      setActiveId(null);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <fieldset className="space-y-3 border border-line bg-white/55 p-4">
                  <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted">
                    From
                  </legend>
                  <label>
                    <span className="label">Business name</span>
                    <input
                      className="field"
                      value={active.from.name}
                      onChange={(e) =>
                        updateActive({ from: { ...active.from, name: e.target.value } })
                      }
                    />
                  </label>
                  <label>
                    <span className="label">Email</span>
                    <input
                      className="field"
                      value={active.from.email}
                      onChange={(e) =>
                        updateActive({ from: { ...active.from, email: e.target.value } })
                      }
                    />
                  </label>
                  <label>
                    <span className="label">Address</span>
                    <textarea
                      className="field min-h-20"
                      value={active.from.address}
                      onChange={(e) =>
                        updateActive({ from: { ...active.from, address: e.target.value } })
                      }
                    />
                  </label>
                </fieldset>

                <fieldset className="space-y-3 border border-line bg-white/55 p-4">
                  <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted">
                    Bill to
                  </legend>
                  <label>
                    <span className="label">Client name</span>
                    <input
                      className="field"
                      value={active.to.name}
                      onChange={(e) =>
                        updateActive({ to: { ...active.to, name: e.target.value } })
                      }
                    />
                  </label>
                  <label>
                    <span className="label">Email</span>
                    <input
                      className="field"
                      value={active.to.email}
                      onChange={(e) =>
                        updateActive({ to: { ...active.to, email: e.target.value } })
                      }
                    />
                  </label>
                  <label>
                    <span className="label">Address</span>
                    <textarea
                      className="field min-h-20"
                      value={active.to.address}
                      onChange={(e) =>
                        updateActive({ to: { ...active.to, address: e.target.value } })
                      }
                    />
                  </label>
                </fieldset>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label>
                  <span className="label">Issue date</span>
                  <input
                    type="date"
                    className="field"
                    value={active.issueDate}
                    onChange={(e) => updateActive({ issueDate: e.target.value })}
                  />
                </label>
                <label>
                  <span className="label">
                    {active.type === "invoice" ? "Due date" : "Valid until"}
                  </span>
                  <input
                    type="date"
                    className="field"
                    value={active.dueDate}
                    onChange={(e) => updateActive({ dueDate: e.target.value })}
                  />
                </label>
                <label>
                  <span className="label">Tax %</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className="field"
                    value={active.taxRate}
                    onChange={(e) => updateActive({ taxRate: Number(e.target.value) || 0 })}
                  />
                </label>
              </div>

              <div className="border border-line bg-white/55">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                    Line items
                  </h2>
                  <Button variant="ghost" className="!py-1.5" onClick={addItem}>
                    Add line
                  </Button>
                </div>
                <div className="divide-y divide-line">
                  {active.items.map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-2 p-4 md:grid-cols-[1fr_90px_120px_auto]"
                    >
                      <input
                        className="field"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, { description: e.target.value })}
                      />
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        className="field"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, { quantity: Number(e.target.value) || 0 })
                        }
                      />
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        className="field"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) =>
                          updateItem(item.id, { rate: Number(e.target.value) || 0 })
                        }
                      />
                      <Button variant="ghost" className="!py-2" onClick={() => removeItem(item.id)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <label>
                <span className="label">Notes</span>
                <textarea
                  className="field min-h-24"
                  value={active.notes}
                  onChange={(e) => updateActive({ notes: e.target.value })}
                />
              </label>
            </div>

            <aside className="h-fit border border-line bg-ink p-6 text-paper xl:sticky xl:top-6">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-brass-glow">
                Live preview
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold">
                {active.from.name || "Your business"}
              </h2>
              <p className="mt-1 text-sm text-paper/60">{active.number}</p>
              <div className="mt-6 border-t border-paper/15 pt-5">
                <p className="text-xs uppercase tracking-wider text-brass-glow">Bill to</p>
                <p className="mt-2 font-semibold">{active.to.name || "Client name"}</p>
                <p className="text-sm text-paper/65">{active.to.email || "client@email.com"}</p>
              </div>
              <ul className="mt-6 space-y-3 border-t border-paper/15 pt-5 text-sm">
                {active.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4">
                    <span className="text-paper/80">{item.description || "Line item"}</span>
                    <span className="font-mono">
                      {formatMoney(item.quantity * item.rate, active.currency)}
                    </span>
                  </li>
                ))}
              </ul>
              {totals ? (
                <div className="mt-6 space-y-2 border-t border-paper/15 pt-5 text-sm">
                  <div className="flex justify-between text-paper/70">
                    <span>Subtotal</span>
                    <span>{formatMoney(totals.subtotal, active.currency)}</span>
                  </div>
                  {active.taxRate > 0 ? (
                    <div className="flex justify-between text-paper/70">
                      <span>Tax</span>
                      <span>{formatMoney(totals.tax, active.currency)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-brass-glow">
                      {formatMoney(totals.total, active.currency)}
                    </span>
                  </div>
                </div>
              ) : null}
              {!gate.isPro ? (
                <p className="mt-6 text-xs text-paper/55">
                  Free exports include a Billforge watermark.{" "}
                  <Link href="/pricing" className="text-brass-glow underline">
                    Remove it with Pro
                  </Link>
                  .
                </p>
              ) : (
                <p className="mt-6 text-xs text-paper/55">
                  Pro active{usage.proUntil ? ` until ${usage.proUntil.slice(0, 10)}` : ""}.
                </p>
              )}
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
