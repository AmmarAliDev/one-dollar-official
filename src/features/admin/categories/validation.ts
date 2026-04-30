import { z } from "zod";

import { adminSeoFieldsSchema, adminSlugSchema } from "@/features/admin/seo/schema";
import { validateWithSchema } from "@/lib/security/validation";

const optionalText = z
  .string()
  .trim()
  .max(500, "Description must be 500 characters or fewer.")
  .optional()
  .transform((value) => {
    if (!value) {
      return undefined;
    }

    return value.length === 0 ? undefined : value;
  });

const categoryCardImageUrlSchema = z
  .string()
  .trim()
  .optional()
  .refine((value) => {
    if (!value) {
      return true;
    }

    if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") && !/[\r\n]/.test(value)) {
      return true;
    }

    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "Category card image must be a valid full URL or start with /.")
  .transform((value) => {
    if (!value) {
      return undefined;
    }

    return value.length === 0 ? undefined : value;
  });


export const categoryStatusValues = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export const categoryMutationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Category name must be at least 2 characters.")
      .max(80, "Category name must be 80 characters or fewer."),
    slug: adminSlugSchema,
    description: optionalText,
    categoryCardImageUrl: categoryCardImageUrlSchema,
    status: z.enum(categoryStatusValues, {
      error: "Status must be one of DRAFT, PUBLISHED, or ARCHIVED.",
    }),
  })
  .extend(adminSeoFieldsSchema.shape);

export const categoryCreateSchema = categoryMutationSchema;

export const categoryUpdateSchema = categoryMutationSchema.extend({
  id: z
    .string({ error: "Category ID is required." })
    .trim()
    .min(1, "Category ID is required."),
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;

export function validateCategoryCreateInput(input: unknown) {
  return validateWithSchema(categoryCreateSchema, input);
}

export function validateCategoryUpdateInput(input: unknown) {
  return validateWithSchema(categoryUpdateSchema, input);
}
