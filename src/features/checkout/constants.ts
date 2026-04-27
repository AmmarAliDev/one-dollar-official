export const CHECKOUT_SHIPPING_FEE = 150;
export const CHECKOUT_SUPPORTED_CITY = "Karachi";
export const CHECKOUT_FIXED_PROVINCE = "Sindh";

/**
 * Active payment method codes accepted by the checkout API.
 *
 * Adding a new code here requires:
 *   1. A matching provider object registered in `payment.ts`.
 *   2. The provider's `method.enabled` set to `true`.
 *   3. The Zod schema in `validation.ts` updated to include the new code.
 *   4. A DB migration if a `PaymentTransaction` table is added.
 *
 * Do NOT add a code here for a gateway that has no working implementation —
 * use `FUTURE_PAYMENT_GATEWAY_CODES` below for forward-declaration only.
 */
export const CHECKOUT_PAYMENT_METHODS = {
  COD: "COD",
} as const;

export type CheckoutPaymentMethodCode =
  (typeof CHECKOUT_PAYMENT_METHODS)[keyof typeof CHECKOUT_PAYMENT_METHODS];

/**
 * Reserved codes for Pakistan payment gateways that are planned but not yet
 * integrated. These are intentionally NOT in `CHECKOUT_PAYMENT_METHODS` so
 * the validation schema and provider registry never accept them until a real
 * implementation is wired up.
 *
 * When integrating a gateway:
 *   1. Move its code from here into `CHECKOUT_PAYMENT_METHODS`.
 *   2. Implement `CheckoutPaymentProvider` in a dedicated file under
 *      `src/features/checkout/providers/`.
 *   3. Register the provider in the `providerRegistry` inside `payment.ts`.
 *   4. Update `validation.ts` to include the new code in the Zod enum.
 *   5. Add environment variables (API keys, webhook secrets) to `.env.example`.
 *   6. Add a `PaymentTransaction` Prisma migration (see `PaymentTransactionRecord`
 *      in `types.ts` for the suggested schema).
 *
 * Provider notes (Pakistan gateways):
 *   - JAZZCASH:  Uses redirect + server-to-server callback (POST to webhook URL).
 *                Docs: https://sandbox.jazzcash.com.pk/
 *   - EASYPAISA: Similar redirect model; HMAC-SHA256 signed callbacks.
 *                Docs: https://easypaisa.com.pk/developer/
 *   - HBL_OMNI:  Bank-hosted page redirect, callback via POST.
 */
export const FUTURE_PAYMENT_GATEWAY_CODES = {
  JAZZCASH: "JAZZCASH",
  EASYPAISA: "EASYPAISA",
  HBL_OMNI: "HBL_OMNI",
} as const;

export type FuturePaymentGatewayCode =
  (typeof FUTURE_PAYMENT_GATEWAY_CODES)[keyof typeof FUTURE_PAYMENT_GATEWAY_CODES];
