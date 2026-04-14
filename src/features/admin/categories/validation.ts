import { z } from "zod";

import { validateWithSchema } from "@/lib/security/validation";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

const optionalSeoTitle = z
  .string()
  .trim()
  .max(70, "SEO title must be 70 characters or fewer.")
  .optional()
  .transform((value) => {
    if (!value) {
      return undefined;
    }

    return value.length === 0 ? undefined : value;
  });

const optionalSeoDescription = z
  .string()
  .trim()
  .max(160, "SEO description must be 160 characters or fewer.")
  .optional()
  .transform((value) => {
    if (!value) {
      return undefined;
    }

    return value.length === 0 ? undefined : value;
  });

export const categoryStatusValues = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export const categoryMutationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters.")
    .max(80, "Category name must be 80 characters or fewer."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters.")
    .max(100, "Slug must be 100 characters or fewer.")
    .regex(slugRegex, "Slug must use lowercase letters, numbers, and single hyphens."),
  description: optionalText,
  status: z.enum(categoryStatusValues, {
    error: "Status must be one of DRAFT, PUBLISHED, or ARCHIVED.",
  }),
  seoTitle: optionalSeoTitle,
  seoDescription: optionalSeoDescription,
});

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
