import type { CartSummary } from "@/features/cart";

import type { CheckoutPaymentMethodCode } from "./constants";

export type CheckoutCustomerInfo = {
  fullName: string;
  email: string;
  phone: string;
};

export type CheckoutShippingAddress = {
  addressLine1: string;
  addressLine2?: string | undefined;
  city: string;
};

export type CheckoutPayload = {
  cartId: string;
  customer: CheckoutCustomerInfo;
  shippingAddress: CheckoutShippingAddress;
  paymentMethod: CheckoutPaymentMethodCode;
  notes?: string | undefined;
};

export type CheckoutTotals = {
  subtotal: number;
  shipping: number;
  total: number;
};

export type CheckoutPaymentResult = {
  provider: CheckoutPaymentMethodCode;
  status: "pending" | "authorized";
  message: string;
  metadata?: Record<string, string>;
};

export type CheckoutPaymentMethodDefinition = {
  code: CheckoutPaymentMethodCode;
  label: string;
  description: string;
  type: "offline" | "online";
  enabled: boolean;
};

export type CheckoutAttemptResult = {
  cart: Pick<CartSummary, "id" | "itemCount" | "subtotal">;
  totals: CheckoutTotals;
  payment: CheckoutPaymentResult;
};
