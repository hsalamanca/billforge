import assert from "node:assert/strict";
import { documentTotals, formatMoney, lineTotal } from "./currency";

assert.equal(lineTotal(2, 50), 100);
assert.equal(lineTotal(1.5, 33.33), 50);
assert.equal(lineTotal(null, null), 0);
assert.equal(lineTotal(null, 50), 0);

const totals = documentTotals(
  [
    { quantity: 2, rate: 100 },
    { quantity: 1, rate: 50 },
  ],
  10,
);
assert.equal(totals.subtotal, 250);
assert.equal(totals.tax, 25);
assert.equal(totals.total, 275);

const emptyTotals = documentTotals([{ quantity: null, rate: null }], null);
assert.equal(emptyTotals.total, 0);

assert.match(formatMoney(1234.5, "USD"), /\$1,234\.50/);

console.log("currency.test.ts passed");
