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

import {
  createPasswordSchema,
  emailAddressSchema,
  optionalDisplayNameSchema,
} from "@/lib/security/validation";

// ── Constants ────────────────────────────────────────────────────────────────

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72; // bcrypt truncates at 72 bytes

// ── Sign-in ──────────────────────────────────────────────────────────────────

export const signInValidator = z.object({
  email: emailAddressSchema,
  password: z
    .string()
    .min(1, "Password is required.")
    .max(MAX_PASSWORD_LENGTH, "Password is too long."),
});

export type SignInInput = z.infer<typeof signInValidator>;

// ── Sign-up ──────────────────────────────────────────────────────────────────

export const signUpValidator = z
  .object({
    name: optionalDisplayNameSchema.optional(),
    email: emailAddressSchema,
    password: createPasswordSchema(MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpValidator>;

// ── Forgot-password placeholder ─────────────────────────────────────────────

export const forgotPasswordValidator = z.object({
  email: emailAddressSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordValidator>;

export const resetPasswordValidator = z
  .object({
    token: z
      .string()
      .trim()
      .min(20, "Reset token is invalid.")
      .max(512, "Reset token is invalid."),
    password: createPasswordSchema(MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordValidator>;
