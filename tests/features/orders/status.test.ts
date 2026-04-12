import { describe, expect, it } from "vitest";

import {
  assertOrderStatusTransition,
  canTransitionOrderStatus,
  formatOrderStatusLabel,
  getNextOrderStatuses,
} from "@/features/orders";

describe("order status helpers", () => {
  it("formats status labels for customer-facing UI", () => {
    expect(formatOrderStatusLabel("PENDING")).toBe("Pending");
    expect(formatOrderStatusLabel("DELIVERED")).toBe("Delivered");
  });

  it("allows only the expected next statuses", () => {
    expect(getNextOrderStatuses("CONFIRMED")).toEqual(["PACKED", "CANCELLED"]);
    expect(canTransitionOrderStatus("SHIPPED", "DELIVERED")).toBe(true);
    expect(canTransitionOrderStatus("DELIVERED", "CANCELLED")).toBe(false);
  });

  it("throws on invalid lifecycle jumps", () => {
    expect(() => assertOrderStatusTransition("PENDING", "SHIPPED")).toThrow(/Invalid order status transition/);
    expect(() => assertOrderStatusTransition("CANCELLED", "DELIVERED")).toThrow(/Invalid order status transition/);
  });
});