import { z } from "zod";

import { emailAddressSchema } from "@/lib/security/validation";

/**
 * Validated input schema for the subscriber capture endpoint.
 * `email` uses the shared emailAddressSchema so validation messages are consistent.
 */
export const subscribeInputSchema = z.object({
  email: emailAddressSchema,
  firstName: z.string().trim().max(100, "First name must be at most 100 characters.").optional(),
  /**
   * Where the subscriber signed up. Accepts any non-empty string up to 64 chars.
   * Callers should use a stable, lowercase slug, e.g. "checkout" or "newsletter_popup".
   */
  source: z
    .string()
    .trim()
    .min(1, "Source is required.")
    .max(64, "Source must be at most 64 characters."),
  /** Segmentation tags. Ignored if empty or omitted. */
  tags: z.array(z.string().trim().min(1).max(64)).max(20).optional().default([]),
});

export type SubscribeInputValues = z.infer<typeof subscribeInputSchema>;

/**
 * Schema for the unsubscribe-by-token operation (used in API routes and action handlers).
 */
export const unsubscribeTokenSchema = z.object({
  token: z
    .string()
    .trim()
    .min(1, "Unsubscribe token is required.")
    .max(256, "Invalid unsubscribe token."),
});

export type UnsubscribeTokenValues = z.infer<typeof unsubscribeTokenSchema>;
