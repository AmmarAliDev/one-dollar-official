import { z } from "zod";

import { validateWithSchema } from "@/lib/security/validation";

function parseNumberish(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim().replaceAll(",", "");
  if (normalized.length === 0) {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : value;
}

function parseDateish(value: unknown) {
  if (value instanceof Date) {
    return value;
  }

  const normalized = `${value ?? ""}`.trim();
  if (normalized.length === 0) {
    return undefined;
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? value : parsed;
}

export const adminInventoryAdjustmentModes = ["set", "increase", "decrease"] as const;

export const adminInventoryAdjustmentSchema = z
  .object({
    inventoryId: z.string({ error: "Inventory ID is required." }).trim().min(1, "Inventory ID is required."),
    expectedUpdatedAt: z.preprocess(
      parseDateish,
      z.date({ error: "Inventory version timestamp is required." }),
    ),
    adjustmentMode: z.enum(adminInventoryAdjustmentModes, {
      error: "Please choose a valid adjustment mode.",
    }),
    amount: z.preprocess(
      parseNumberish,
      z
        .number({ error: "Quantity amount is required." })
        .int("Quantity amount must be a whole number.")
        .min(0, "Quantity amount cannot be negative."),
    ),
    reason: z
      .string({ error: "Adjustment reason is required." })
      .trim()
      .min(3, "Adjustment reason must be at least 3 characters.")
      .max(240, "Adjustment reason must be 240 characters or fewer."),
  })
  .superRefine((input, ctx) => {
    if ((input.adjustmentMode === "increase" || input.adjustmentMode === "decrease") && input.amount < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Increase/decrease adjustments must be at least 1 unit.",
      });
    }
  });

export type AdminInventoryAdjustmentInput = z.infer<typeof adminInventoryAdjustmentSchema>;

export function validateAdminInventoryAdjustmentInput(input: unknown) {
  return validateWithSchema(adminInventoryAdjustmentSchema, input);
}
