"use server";

/**
 * Sign-in server action (credentials).
 *
 * Wraps Auth.js's `signIn("credentials", ...)` so forms can use it with
 * React 19's `useActionState` and get typed error messages back.
 *
 * On success Auth.js throws a NEXT_REDIRECT — the caller must re-throw it
 * (server actions transparently handle redirects when re-thrown).
 *
 * Rate-limit: 10 attempts per email per minute (more permissive than sign-up).
 */

import { headers } from "next/headers";
import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { routes } from "@/config/routes";
import { signInValidator } from "@/features/auth/validators";
import { toActionErrorState } from "@/lib/errors/handling";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertTrustedOrigin, getClientIp } from "@/lib/security/csrf";
import { validateWithSchema } from "@/lib/security/validation";

export interface SignInActionState {
  errors?: string[];
}

function isSafeRelativePath(value: string) {
  const candidate = value.trim();

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

/**
 * Sign-in server action — compatible with React 19 `useActionState`.
 */
export async function signInAction(
  _prev: SignInActionState | null,
  formData: FormData,
): Promise<SignInActionState> {
  try {
    await assertTrustedOrigin({ action: "auth:sign-in" });
  } catch (error) {
    return toActionErrorState(error, "sign-in");
  }

  // ── 1. Validate ───────────────────────────────────────────────────────────
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = validateWithSchema(signInValidator, raw);
  if (!parsed.success) {
    return { errors: parsed.errors };
  }

  const { email } = parsed.data;
  const redirectCandidate = `${formData.get("redirectTo") ?? ""}`;
  const redirectTo = isSafeRelativePath(redirectCandidate)
    ? redirectCandidate.trim()
    : routes.storefront.home;

  // ── 2. Rate limit ─────────────────────────────────────────────────────────
  const headerList = await headers();
  const ip = getClientIp(headerList);
  const rlResult = await checkRateLimit({
    identifier: `${ip}:${email.toLowerCase()}`,
    action: "auth:sign-in",
    limit: 10,
    windowMs: 60_000,
  });

  if (!rlResult.success) {
    return {
      errors: ["Too many sign-in attempts. Please wait a minute and try again."],
    };
  }

  // ── 3. Authenticate ───────────────────────────────────────────────────────
  try {
    await signIn("credentials", {
      ...Object.fromEntries(formData),
      redirectTo,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      logger.warn("sign-in: auth failed", { type: err.type });

      switch (err.type) {
        case "CredentialsSignin":
          return { errors: ["Invalid email or password. Please try again."] };
        default:
          return { errors: ["Sign in failed. Please try again."] };
      }
    }
    // Re-throw redirect (NEXT_REDIRECT) so Next.js handles it.
    throw err;
  }

  return {};
}
