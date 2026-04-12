import { describe, expect, it } from "vitest";

import { CHECKOUT_PAYMENT_METHODS, checkoutPayloadSchema } from "@/features/checkout";

describe("checkout payload validation", () => {
  it("accepts a valid Karachi checkout payload", () => {
    const parsed = checkoutPayloadSchema.safeParse({
      cartId: "cart-123",
      customer: {
        fullName: "Ammar Ali",
        email: "ammar@example.com",
        phone: "+923001112233",
      },
      shippingAddress: {
        addressLine1: "House 12, Street 5, Gulshan",
        city: "Karachi",
        country: "Pakistan",
        postcode: "75400",
      },
      paymentMethod: CHECKOUT_PAYMENT_METHODS.COD,
      notes: "Call before delivery",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.shippingAddress.city).toBe("Karachi");
    }
  });

  it("rejects non-Karachi city values", () => {
    const parsed = checkoutPayloadSchema.safeParse({
      cartId: "cart-123",
      customer: {
        fullName: "Ammar Ali",
        email: "ammar@example.com",
        phone: "+923001112233",
      },
      shippingAddress: {
        addressLine1: "House 12, Street 5, Gulshan",
        city: "Lahore",
        country: "Pakistan",
        postcode: "54000",
      },
      paymentMethod: CHECKOUT_PAYMENT_METHODS.COD,
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toContain("ship only to Karachi");
    }
  });

  it("rejects unsupported payment methods", () => {
    const parsed = checkoutPayloadSchema.safeParse({
      cartId: "cart-123",
      customer: {
        fullName: "Ammar Ali",
        email: "ammar@example.com",
        phone: "+923001112233",
      },
      shippingAddress: {
        addressLine1: "House 12, Street 5, Gulshan",
        city: "Karachi",
        country: "Pakistan",
        postcode: "75400",
      },
      paymentMethod: "CARD",
    });

    expect(parsed.success).toBe(false);
  });
});
