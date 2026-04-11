/**
 * Auth validation schemas.
 *
 * Zod schemas are the single source of truth for all auth input shapes.
 * They are shared between server actions and client-side pre-validation
 * so error messages stay consistent.
 *
 * Each schema has:
 *  - Input type  (what the form/action receives)
 *  - Schema      (the Zod validator)
 *  - Inferred type (what passes validation)
 */

import { z } from "zod";

// ── Constants ────────────────────────────────────────────────────────────────

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72; // bcrypt truncates at 72 bytes

// ── Sign-in ──────────────────────────────────────────────────────────────────

export const signInValidator = z.object({
  email: z
    .email("Please enter a valid email address.")
    .trim()
    .min(1, "Email address is required."),

  password: z
    .string()
    .min(1, "Password is required.")
    .max(MAX_PASSWORD_LENGTH, "Password is too long."),
});

export type SignInInput = z.infer<typeof signInValidator>;

// ── Sign-up ──────────────────────────────────────────────────────────────────

export const signUpValidator = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(100, "Name must be at most 100 characters.")
      .optional()
      .or(z.literal("")),

    email: z
      .email("Please enter a valid email address.")
      .trim()
      .min(1, "Email address is required."),
      
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      .max(MAX_PASSWORD_LENGTH, "Password is too long."),

    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpValidator>;

// ── Forgot-password placeholder ───────────────────────────────────────────────

export const forgotPasswordValidator = z.object({
  email: z
    .email("Please enter a valid email address.")
    .trim()
    .min(1, "Email address is required."),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordValidator>;
