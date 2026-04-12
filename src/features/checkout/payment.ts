import { AppError } from "@/lib/errors/app-error";

import { CHECKOUT_PAYMENT_METHODS, type CheckoutPaymentMethodCode } from "./constants";
import type {
  CheckoutPayload,
  CheckoutPaymentMethodDefinition,
  CheckoutPaymentResult,
  CheckoutTotals,
} from "./types";

type AuthorizePaymentContext = {
  payload: CheckoutPayload;
  totals: CheckoutTotals;
};

type CheckoutPaymentProvider = {
  method: CheckoutPaymentMethodDefinition;
  authorize: (context: AuthorizePaymentContext) => CheckoutPaymentResult;
};

const codPaymentProvider: CheckoutPaymentProvider = {
  method: {
    code: CHECKOUT_PAYMENT_METHODS.COD,
    label: "Cash on Delivery",
    description: "Pay cash when your order is delivered in Karachi.",
    type: "offline",
    enabled: true,
  },
  authorize: ({ totals }) => ({
    provider: CHECKOUT_PAYMENT_METHODS.COD,
    status: "pending",
    message: "Cash on Delivery selected. Please keep exact change ready on delivery.",
    metadata: {
      payableAmount: `${totals.total}`,
    },
  }),
};

const providerRegistry: Record<CheckoutPaymentMethodCode, CheckoutPaymentProvider> = {
  [CHECKOUT_PAYMENT_METHODS.COD]: codPaymentProvider,
};

export function listCheckoutPaymentMethods() {
  return Object.values(providerRegistry)
    .map((provider) => provider.method)
    .filter((method) => method.enabled);
}

export function getCheckoutPaymentProvider(code: CheckoutPaymentMethodCode): CheckoutPaymentProvider {
  const provider = providerRegistry[code];

  if (!provider || !provider.method.enabled) {
    throw new AppError(`Payment method is unavailable: ${code}`, "CHECKOUT_PAYMENT_METHOD_UNAVAILABLE", {
      statusCode: 400,
      userMessage: "The selected payment method is not available right now.",
    });
  }

  return provider;
}
