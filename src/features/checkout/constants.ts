export const CHECKOUT_SHIPPING_FEE = 250;
export const CHECKOUT_SUPPORTED_CITY = "Karachi";

export const CHECKOUT_PAYMENT_METHODS = {
  COD: "COD",
} as const;

export type CheckoutPaymentMethodCode =
  (typeof CHECKOUT_PAYMENT_METHODS)[keyof typeof CHECKOUT_PAYMENT_METHODS];
