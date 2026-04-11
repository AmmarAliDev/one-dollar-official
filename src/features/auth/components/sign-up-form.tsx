"use client";

/**
 * Sign-up form — credentials (email + password) account creation.
 *
 * Uses React 19's `useActionState` for inline validation errors.
 */

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpAction, type SignUpActionState } from "@/features/auth/actions/sign-up";

export function SignUpForm() {
  const [state, dispatch, isPending] = useActionState<SignUpActionState | null, FormData>(
    signUpAction,
    null,
  );

  const errors = state?.errors ?? [];

  return (
    <form action={dispatch} className="space-y-4" noValidate>
      {/* Error summary */}
      {errors.length > 0 && (
        <div
          role="alert"
          className="rounded-[calc(var(--radius)-2px)] border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {errors.map((error, index) => (
            <p key={`${error}-${index}`}>{error}</p>
          ))}        </div>
      )}

      {/* Name (optional) */}
      <div className="space-y-1.5">
        <Label htmlFor="sign-up-name">
          Full name <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="sign-up-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="sign-up-email">Email address</Label>
        <Input
          id="sign-up-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="sign-up-password">Password</Label>
        <Input
          id="sign-up-password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
        />
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        <Label htmlFor="sign-up-confirm">Confirm password</Label>
        <Input
          id="sign-up-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat password"
          required
        />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <InlineSpinner />}
        {isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
