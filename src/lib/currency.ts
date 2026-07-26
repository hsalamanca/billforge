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

export function lineTotal(quantity: number, rate: number): number {
  return Math.round(quantity * rate * 100) / 100;
}

export function documentTotals(items: { quantity: number; rate: number }[], taxRate: number) {
  const subtotal = items.reduce((sum, item) => sum + lineTotal(item.quantity, item.rate), 0);
  const tax = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  return { subtotal, tax, total };
}
