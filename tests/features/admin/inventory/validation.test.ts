import { describe, expect, it } from "vitest";

import { validateAdminInventoryAdjustmentInput } from "@/features/admin/inventory/validation";

describe("admin inventory validation", () => {
  it("accepts a valid set adjustment payload", () => {
    const parsed = validateAdminInventoryAdjustmentInput({
      inventoryId: "inventory-1",
      expectedUpdatedAt: "2026-04-24T12:00:00.000Z",
      adjustmentMode: "set",
      amount: "16",
      reason: "Cycle count correction",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects increase/decrease adjustments with zero amount", () => {
    const parsed = validateAdminInventoryAdjustmentInput({
      inventoryId: "inventory-1",
      expectedUpdatedAt: "2026-04-24T12:00:00.000Z",
      adjustmentMode: "decrease",
      amount: "0",
      reason: "Damaged stock",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.errors.join(" ")).toMatch(/at least 1 unit/i);
    }
  });

  it("rejects malformed timestamps and missing reasons", () => {
    const parsed = validateAdminInventoryAdjustmentInput({
      inventoryId: "inventory-1",
      expectedUpdatedAt: "invalid-date",
      adjustmentMode: "increase",
      amount: "2",
      reason: "",
    });

    expect(parsed.success).toBe(false);
  });
});
