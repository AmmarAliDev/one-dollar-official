import { z } from "zod";

import { orderStatuses } from "@/features/orders";
import { validateWithSchema } from "@/lib/security/validation";

export const adminOrderStatusUpdateSchema = z.object({
  orderId: z.string().trim().min(1, "Order ID is required."),
  nextStatus: z.enum(orderStatuses, {
    error: "Choose a valid order status.",
  }),
});

export const adminOrderInternalNoteSchema = z.object({
  orderId: z.string().trim().min(1, "Order ID is required."),
  note: z
    .string()
    .trim()
    .max(1000, "Internal notes must be 1000 characters or fewer.")
    .optional()
    .default("")
    .transform((value) => (value.length > 0 ? value : undefined)),
});

export type AdminOrderStatusUpdateInput = z.infer<typeof adminOrderStatusUpdateSchema>;
export type AdminOrderInternalNoteInput = z.infer<typeof adminOrderInternalNoteSchema>;

export function validateAdminOrderStatusUpdateInput(input: unknown) {
  return validateWithSchema(adminOrderStatusUpdateSchema, input);
}

export function validateAdminOrderInternalNoteInput(input: unknown) {
  return validateWithSchema(adminOrderInternalNoteSchema, input);
}
