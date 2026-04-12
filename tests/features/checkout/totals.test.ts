import { describe, expect, it } from "vitest";

import { calculateCheckoutTotals,CHECKOUT_SHIPPING_FEE } from "@/features/checkout";

describe("checkout totals", () => {
  it("applies fixed shipping and computes total", () => {
    const totals = calculateCheckoutTotals(2150);

    expect(totals.subtotal).toBe(2150);
    expect(totals.shipping).toBe(CHECKOUT_SHIPPING_FEE);
    expect(totals.total).toBe(2150 + CHECKOUT_SHIPPING_FEE);
  });

  it("normalizes invalid subtotal values", () => {
    const totals = calculateCheckoutTotals(Number.NaN);

    expect(totals.subtotal).toBe(0);
    expect(totals.shipping).toBe(CHECKOUT_SHIPPING_FEE);
    expect(totals.total).toBe(CHECKOUT_SHIPPING_FEE);
  });
});
