export function formatMoney(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

/** Format money, or an em dash when there is no amount yet. */
export function formatMoneyOrDash(amount: number, currency = "USD"): string {
  if (!amount) return "—";
  return formatMoney(amount, currency);
}

export function asAmount(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function lineTotal(quantity: number | null | undefined, rate: number | null | undefined): number {
  return Math.round(asAmount(quantity) * asAmount(rate) * 100) / 100;
}

export function documentTotals(
  items: { quantity: number | null; rate: number | null }[],
  taxRate: number | null | undefined,
) {
  const subtotal = items.reduce((sum, item) => sum + lineTotal(item.quantity, item.rate), 0);
  const tax = Math.round(subtotal * (asAmount(taxRate) / 100) * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  return { subtotal, tax, total };
}
