import { z } from "zod";

const checkoutSubmitOrderSchema = z.object({
  orderNumber: z.string().trim().min(1),
  confirmationUrl: z.string().trim().min(1),
  payment: z.object({
    message: z.string().trim().min(1),
  }),
  totals: z.object({
    total: z.number().finite().nonnegative(),
  }),
});

export const checkoutSubmitSuccessResponseSchema = z.object({
  ok: z.literal(true),
  order: checkoutSubmitOrderSchema,
});

const checkoutSubmitErrorResponseSchema = z.object({
  error: z.string().trim().min(1).optional(),
});

export type CheckoutSubmitOrder = z.infer<typeof checkoutSubmitOrderSchema>;
export type CheckoutSubmitSuccessResponse = z.infer<typeof checkoutSubmitSuccessResponseSchema>;

export function parseCheckoutSubmitSuccessResponse(payload: unknown) {
  return checkoutSubmitSuccessResponseSchema.safeParse(payload);
}

export function extractCheckoutSubmitErrorMessage(payload: unknown) {
  const parsed = checkoutSubmitErrorResponseSchema.safeParse(payload);
  if (!parsed.success) {
    return null;
  }

  return parsed.data.error ?? null;
}
