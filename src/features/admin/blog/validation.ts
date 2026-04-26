import { z } from "zod";

import { adminSeoFieldsSchema, adminSlugSchema } from "@/features/admin/seo/schema";
import { validateWithSchema } from "@/lib/security/validation";

function normalizeOptionalText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  return trimmed.slice(0, maxLength);
}

function parseNumberish(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : value;
}

function isAbsoluteUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isRelativePath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") && !/[\r\n]/.test(value);
}

function isValidUrlOrPath(value: string) {
  return isAbsoluteUrl(value) || isRelativePath(value);
}

const optionalUrlOrPath = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || isValidUrlOrPath(value), {
    message: "Use a valid absolute URL or a relative path starting with /.",
  })
  .transform((value) => normalizeOptionalText(value, 1000));

const blogContentBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("paragraph"),
    text: z.string().trim().min(1, "Paragraph text is required."),
  }),
  z.object({
    type: z.literal("heading"),
    level: z.number().int().min(1).max(6),
    text: z.string().trim().min(1, "Heading text is required."),
  }),
  z.object({
    type: z.literal("list"),
    items: z.array(z.string().trim().min(1, "List items cannot be blank.")).min(1, "Add at least one list item."),
  }),
  z.object({
    type: z.literal("quote"),
    text: z.string().trim().min(1, "Quote text is required."),
  }),
]);

const optionalIsoDate = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined))
  .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
    message: "Publish date must be a valid ISO date/time.",
  });

const blogContentJsonSchema = z
  .string()
  .trim()
  .min(2, "Content JSON is required.")
  .max(50000, "Content JSON is too large.")
  .superRefine((value, ctx) => {
    try {
      const parsed = JSON.parse(value) as unknown;
      const validation = z.array(blogContentBlockSchema).safeParse(parsed);

      if (!validation.success) {
        ctx.addIssue({
          code: "custom",
          message: "Content JSON must be an array of supported content blocks.",
        });
      }
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "Content must be valid JSON.",
      });
    }
  });

export const adminBlogStatusValues = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

const optionalDimension = z.preprocess(
  parseNumberish,
  z.number().int().min(1, "Dimension must be at least 1.").max(4000, "Dimension is too large.").optional(),
);

const adminBlogMutationBaseSchema = z
  .object({
    locale: z
      .string()
      .trim()
      .toLowerCase()
      .min(2, "Locale is required.")
      .max(10, "Locale is too long.")
      .default("en"),
    title: z.string().trim().min(2, "Title must be at least 2 characters.").max(180, "Title must be 180 characters or fewer."),
    slug: adminSlugSchema,
    excerpt: z.string().trim().min(10, "Excerpt must be at least 10 characters.").max(320, "Excerpt must be 320 characters or fewer."),
    contentJson: blogContentJsonSchema,
    coverImageUrl: optionalUrlOrPath,
    coverImageAlt: z
      .string()
      .trim()
      .max(180, "Cover image alt text must be 180 characters or fewer.")
      .optional()
      .transform((value) => normalizeOptionalText(value, 180)),
    coverImageWidth: optionalDimension,
    coverImageHeight: optionalDimension,
    status: z.enum(adminBlogStatusValues, {
      error: "Status must be one of DRAFT, PUBLISHED, or ARCHIVED.",
    }),
    publishedAt: optionalIsoDate,
  })
  .extend(adminSeoFieldsSchema.shape);

export const adminBlogMutationSchema = adminBlogMutationBaseSchema;

export const adminBlogCreateSchema = adminBlogMutationSchema;

export const adminBlogUpdateSchema = adminBlogMutationSchema.extend({
  id: z.string({ error: "Blog post ID is required." }).trim().min(1, "Blog post ID is required."),
});

export type AdminBlogCreateInput = z.infer<typeof adminBlogCreateSchema>;
export type AdminBlogUpdateInput = z.infer<typeof adminBlogUpdateSchema>;

export function validateAdminBlogCreateInput(input: unknown) {
  return validateWithSchema(adminBlogCreateSchema, input);
}

export function validateAdminBlogUpdateInput(input: unknown) {
  return validateWithSchema(adminBlogUpdateSchema, input);
}
