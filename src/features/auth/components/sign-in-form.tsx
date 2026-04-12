"use client";

/**
 * Sign-in form — credentials (email + password) provider.
 *
 * Uses React 19's `useActionState` to handle the server action response
 * and display inline validation errors without a full page reload.
 */

import { useActionState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/config/routes";
import { signInAction, type SignInActionState } from "@/features/auth/actions/sign-in";

type SignInFormProps = {
  redirectTo?: string;
};

function isSafeRelativePath(value: string) {
  let candidate = value.trim();

  try {
    for (let index = 0; index < 3; index += 1) {
      const decodedCandidate = decodeURIComponent(candidate);

      if (decodedCandidate === candidate) {
        break;
      }

      candidate = decodedCandidate;
    }
  } catch {
    return false;
  }

  if (!candidate.startsWith("/")) {
    return false;
  }

  if (candidate.startsWith("//") || candidate.includes("://") || candidate.includes("\\")) {
    return false;
  }

  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(candidate.slice(1)) || /[\r\n]/.test(candidate)) {
    return false;
  }

  return true;
}

export function SignInForm({ redirectTo = routes.storefront.home }: SignInFormProps) {
  const [state, dispatch, isPending] = useActionState<SignInActionState | null, FormData>(
    signInAction,
    null,
  );

  const errors = state?.errors ?? [];
  const safeRedirectTo = isSafeRelativePath(redirectTo) ? redirectTo.trim() : routes.storefront.home;

  return (
    <form action={dispatch} className="space-y-4" noValidate>
      <input type="hidden" name="redirectTo" value={safeRedirectTo} />

      {/* Error summary */}
      {errors.length > 0 && (
        <div
          id="sign-in-errors"
          role="alert"
          className="rounded-[calc(var(--radius)-2px)] border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="sign-in-email">Email address</Label>
        <Input
          id="sign-in-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          aria-describedby={errors.length > 0 ? "sign-in-errors" : undefined}
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="sign-in-password">Password</Label>
          <Link
            href={routes.auth.forgotPassword}
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="sign-in-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <InlineSpinner />}
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
