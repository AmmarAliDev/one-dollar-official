import { describe, expect, it } from "vitest";

import { formatPrice } from "@/lib/currency";

describe("formatPrice", () => {
  it("formats a whole number with Rs. by default", () => {
    expect(formatPrice(1500)).toBe("Rs. 1,500");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("Rs. 0");
  });

  it("formats a numeric string", () => {
    expect(formatPrice("2500")).toBe("Rs. 2,500");
  });

  it("returns -- for NaN", () => {
    expect(formatPrice(NaN)).toBe("--");
  });

  it("returns -- for Infinity", () => {
    expect(formatPrice(Infinity)).toBe("--");
  });

  it("returns -- for a non-numeric string", () => {
    expect(formatPrice("not-a-number")).toBe("--");
  });

  it("respects a custom currency symbol", () => {
    expect(formatPrice(100, { currency: "USD" })).toBe("USD 100");
  });

  it("respects minimumFractionDigits", () => {
    const result = formatPrice(1500, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    expect(result).toBe("Rs. 1,500.00");
  });

  it("clamps negative minimumFractionDigits to 0", () => {
    expect(formatPrice(100, { minimumFractionDigits: -1 })).toBe("Rs. 100");
  });

  it("ensures maximumFractionDigits >= minimumFractionDigits", () => {
    // max(0, min=2) → normalizedMin=2, normalizedMax=max(0,2)=2 → 2 decimal places
    const result = formatPrice(99, { minimumFractionDigits: 2, maximumFractionDigits: 0 });
    expect(result).toBe("Rs. 99.00");
  });
});
