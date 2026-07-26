export type DocumentType = "invoice" | "quote";

export type DocumentStatus = "draft" | "sent" | "paid" | "accepted" | "void";

export interface LineItem {
  id: string;
  description: string;
  /** null = blank field (do not show 0) */
  quantity: number | null;
  /** null = blank field (do not show 0) */
  rate: number | null;
}

export interface Party {
  name: string;
  email: string;
  address: string;
  phone?: string;
}

export interface BillDocument {
  id: string;
  type: DocumentType;
  number: string;
  status: DocumentStatus;
  issueDate: string;
  dueDate: string;
  from: Party;
  to: Party;
  items: LineItem[];
  notes: string;
  /** null = blank tax field */
  taxRate: number | null;
  currency: string;
  logoDataUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsageState {
  monthKey: string;
  createdCount: number;
  isPro: boolean;
  stripeCustomerId?: string;
  proUntil?: string;
}

export const FREE_DOCS_PER_MONTH = 3;

export const PRICING = {
  monthly: { label: "$29", amount: 29, period: "month" as const },
  yearly: { label: "$240", amount: 240, period: "year" as const },
};
