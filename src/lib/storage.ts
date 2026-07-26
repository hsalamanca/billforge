"use client";

import { nanoid } from "nanoid";
import type { BillDocument, DocumentType, UsageState } from "./types";
import { FREE_DOCS_PER_MONTH } from "./types";

const DOCS_KEY = "billforge.documents";
const USAGE_KEY = "billforge.usage";
const PROFILE_KEY = "billforge.profile";

function monthKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getUsage(): UsageState {
  const usage = readJson<UsageState>(USAGE_KEY, {
    monthKey: monthKey(),
    createdCount: 0,
    isPro: false,
  });

  if (usage.monthKey !== monthKey()) {
    const reset: UsageState = {
      ...usage,
      monthKey: monthKey(),
      createdCount: 0,
    };
    writeJson(USAGE_KEY, reset);
    return reset;
  }

  if (usage.proUntil && new Date(usage.proUntil) < new Date()) {
    const expired: UsageState = { ...usage, isPro: false, proUntil: undefined };
    writeJson(USAGE_KEY, expired);
    return expired;
  }

  return usage;
}

export function setPro(isPro: boolean, opts?: { stripeCustomerId?: string; proUntil?: string }) {
  const usage = getUsage();
  const next: UsageState = {
    ...usage,
    isPro,
    stripeCustomerId: opts?.stripeCustomerId ?? usage.stripeCustomerId,
    proUntil: opts?.proUntil,
  };
  writeJson(USAGE_KEY, next);
  return next;
}

export function canCreateDocument(): { ok: boolean; remaining: number; isPro: boolean } {
  const usage = getUsage();
  if (usage.isPro) return { ok: true, remaining: Infinity, isPro: true };
  const remaining = Math.max(0, FREE_DOCS_PER_MONTH - usage.createdCount);
  return { ok: remaining > 0, remaining, isPro: false };
}

function emptyToNull(value: number | null | undefined): number | null {
  if (value == null || value === 0) return null;
  return value;
}

/** Normalize legacy docs that stored 0 / leftover defaults instead of blank. */
function normalizeDocument(doc: BillDocument): BillDocument {
  return {
    ...doc,
    taxRate: emptyToNull(doc.taxRate),
    items: (doc.items ?? []).map((item) => {
      const rate = emptyToNull(item.rate);
      const quantity = emptyToNull(item.quantity);
      const description = (item.description ?? "").trim();
      // Clear leftover starter "1" on unfinished lines from older builds
      const isBlankStarter =
        !description &&
        rate == null &&
        (quantity == null || quantity === 1);
      return {
        ...item,
        description,
        quantity: isBlankStarter ? null : quantity,
        rate,
      };
    }),
  };
}

export function listDocuments(): BillDocument[] {
  return readJson<BillDocument[]>(DOCS_KEY, [])
    .map(normalizeDocument)
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

export function getDocument(id: string): BillDocument | undefined {
  return listDocuments().find((d) => d.id === id);
}

export function saveDocument(doc: BillDocument): BillDocument {
  const docs = listDocuments();
  const idx = docs.findIndex((d) => d.id === doc.id);
  const next = { ...doc, updatedAt: new Date().toISOString() };
  if (idx >= 0) docs[idx] = next;
  else docs.unshift(next);
  writeJson(DOCS_KEY, docs);
  return next;
}

export function deleteDocument(id: string) {
  writeJson(
    DOCS_KEY,
    listDocuments().filter((d) => d.id !== id),
  );
}

export function createBlankDocument(type: DocumentType = "invoice"): BillDocument | null {
  const gate = canCreateDocument();
  if (!gate.ok) return null;

  const profile = readJson<Partial<BillDocument["from"]>>(PROFILE_KEY, {});
  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + 14);

  const prefix = type === "invoice" ? "INV" : "QTE";
  const doc: BillDocument = {
    id: nanoid(10),
    type,
    number: `${prefix}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${nanoid(4).toUpperCase()}`,
    status: "draft",
    issueDate: now.toISOString().slice(0, 10),
    dueDate: due.toISOString().slice(0, 10),
    from: {
      name: profile.name ?? "",
      email: profile.email ?? "",
      address: profile.address ?? "",
      phone: profile.phone,
    },
    to: { name: "", email: "", address: "" },
    items: [
      {
        id: nanoid(6),
        description: "",
        quantity: null,
        rate: null,
      },
    ],
    notes:
      type === "quote"
        ? "This quote is valid for 30 days. 50% deposit to begin."
        : "Payment due within 14 days. Thank you for your business.",
    taxRate: null,
    currency: "USD",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  saveDocument(doc);

  const usage = getUsage();
  writeJson(USAGE_KEY, { ...usage, createdCount: usage.createdCount + 1 });

  return doc;
}

export function saveProfile(from: BillDocument["from"]) {
  writeJson(PROFILE_KEY, from);
}

export function convertQuoteToInvoice(quoteId: string): BillDocument | null {
  const quote = getDocument(quoteId);
  if (!quote || quote.type !== "quote") return null;

  const gate = canCreateDocument();
  if (!gate.ok) return null;

  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + 14);

  const invoice: BillDocument = {
    ...structuredClone(quote),
    id: nanoid(10),
    type: "invoice",
    number: `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${nanoid(4).toUpperCase()}`,
    status: "draft",
    issueDate: now.toISOString().slice(0, 10),
    dueDate: due.toISOString().slice(0, 10),
    notes: "Payment due within 14 days. Thank you for your business.",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  saveDocument(invoice);
  const usage = getUsage();
  writeJson(USAGE_KEY, { ...usage, createdCount: usage.createdCount + 1 });
  return invoice;
}
