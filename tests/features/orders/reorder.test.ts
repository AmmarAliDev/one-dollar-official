import { describe, expect, it } from "vitest";

import { resolveReorderLineDecision } from "@/features/orders";

describe("order reorder helpers", () => {
  it("adds full requested quantity when stock and cart capacity allow", () => {
    const decision = resolveReorderLineDecision({
      requestedQuantity: 3,
      existingQuantity: 1,
      availableQuantity: 10,
    });

    expect(decision).toEqual({
      quantityToAdd: 3,
      availableToAdd: 9,
      reason: "FULL",
    });
  });

  it("adjusts quantity when requested amount exceeds available stock", () => {
    const decision = resolveReorderLineDecision({
      requestedQuantity: 4,
      existingQuantity: 2,
      availableQuantity: 5,
    });

    expect(decision).toEqual({
      quantityToAdd: 3,
      availableToAdd: 3,
      reason: "ADJUSTED",
    });
  });

  it("returns out-of-stock when no additional units can be added", () => {
    const decision = resolveReorderLineDecision({
      requestedQuantity: 2,
      existingQuantity: 5,
      availableQuantity: 5,
    });

    expect(decision).toEqual({
      quantityToAdd: 0,
      availableToAdd: 0,
      reason: "OUT_OF_STOCK",
    });
  });

  it("respects max cart item quantity cap", () => {
    const decision = resolveReorderLineDecision({
      requestedQuantity: 10,
      existingQuantity: 95,
      availableQuantity: 200,
      maxCartItemQuantity: 99,
    });

    expect(decision).toEqual({
      quantityToAdd: 4,
      availableToAdd: 4,
      reason: "ADJUSTED",
    });
  });
});
