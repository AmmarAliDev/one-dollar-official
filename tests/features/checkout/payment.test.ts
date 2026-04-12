import { describe, expect, it } from "vitest";

import {
  CHECKOUT_PAYMENT_METHODS,
  getCheckoutPaymentProvider,
  listCheckoutPaymentMethods,
} from "@/features/checkout";

describe("checkout payment providers", () => {
  it("exposes COD as the enabled checkout method", () => {
    const methods = listCheckoutPaymentMethods();

    expect(methods).toHaveLength(1);
    expect(methods[0]?.code).toBe(CHECKOUT_PAYMENT_METHODS.COD);
    expect(methods[0]?.enabled).toBe(true);
  });

  it("returns COD payment authorization response", () => {
    const provider = getCheckoutPaymentProvider(CHECKOUT_PAYMENT_METHODS.COD);

    const result = provider.authorize({
      payload: {
        cartId: "cart-1",
        customer: {
          fullName: "Ammar Ali",
          email: "ammar@example.com",
          phone: "+923001112233",
        },
        shippingAddress: {
          addressLine1: "House 1",
          city: "Karachi",
        },
        paymentMethod: CHECKOUT_PAYMENT_METHODS.COD,
      },
      totals: {
        subtotal: 1000,
        shipping: 250,
        total: 1250,
      },
    });

    expect(result.provider).toBe(CHECKOUT_PAYMENT_METHODS.COD);
    expect(result.status).toBe("pending");
  });
});
