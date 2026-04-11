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
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";

export interface SignInActionState {
  errors?: string[];
}

/**
 * Sign-in server action — compatible with React 19 `useActionState`.
 */
export async function signInAction(
  _prev: SignInActionState | null,
  formData: FormData,
): Promise<SignInActionState> {
  // ── 1. Validate ───────────────────────────────────────────────────────────
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = signInValidator.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.issues.map((i) => i.message) };
  }

  const { email } = parsed.data;

  // ── 2. Rate limit ─────────────────────────────────────────────────────────
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") ?? "unknown";
  const rlResult = await checkRateLimit({
    identifier: `${ip}:${email}`,
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
      redirectTo: routes.storefront.home,
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
