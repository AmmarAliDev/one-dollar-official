import { describe, expect, it } from "vitest";

import { validateCustomerReviewInput } from "@/features/reviews/validation";

describe("customer review validation", () => {
  it("accepts a valid review payload", () => {
    const result = validateCustomerReviewInput({
      productId: "product-1",
      rating: "5",
      title: "Great quality",
      body: "This product worked well and arrived exactly as expected.",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rating).toBe(5);
    }
  });

  it("rejects out-of-range ratings", () => {
    const result = validateCustomerReviewInput({
      productId: "product-1",
      rating: 6,
      body: "This review body has enough length to pass text requirements.",
    });

    expect(result.success).toBe(false);
  });

  it("rejects short review comments", () => {
    const result = validateCustomerReviewInput({
      productId: "product-1",
      rating: 4,
      body: "Too short",
    });

    expect(result.success).toBe(false);
  });
});
