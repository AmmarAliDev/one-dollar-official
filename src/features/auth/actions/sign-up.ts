"use server";

/**
 * Sign-up server action.
 *
 * Creates a new credentials-based account, then immediately signs the user in
 * using the Credentials provider so they land in an authenticated session.
 *
 * Flow:
 *  1. Validate input with Zod.
 *  2. Rate-limit by email (prevents enumeration bursts).
 *  3. Check whether the email is already registered.
 *  4. Hash the password with bcrypt.
 *  5. Resolve or create the CUSTOMER role.
 *  6. Insert the User record.
 *  7. Call signIn("credentials") → Auth.js creates the JWT session + redirects.
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { routes } from "@/config/routes";
import { signUpValidator } from "@/features/auth/validators";
import { hashPassword } from "@/lib/auth/password";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { getPrismaClient } from "@/server/db";

export interface SignUpActionState {
  errors?: string[];
  success?: boolean;
}

/**
 * Sign-up server action — compatible with React 19 `useActionState`.
 */
export async function signUpAction(
  _prev: SignUpActionState | null,
  formData: FormData,
): Promise<SignUpActionState> {
  const db = getPrismaClient();

  // ── 1. Parse & validate ───────────────────────────────────────────────────
  const raw = {
    name: formData.get("name") ?? undefined,
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = signUpValidator.safeParse(raw);
  if (!parsed.success) {
    return {
      errors: parsed.error.issues.map((i) => i.message),
    };
  }

  const { name, email, password } = parsed.data;

  // ── 2. Rate limit (in-memory; upgrade to Redis in Prompt 2.5) ─────────────
  const headerList = await headers();
  // Prefer x-real-ip (set by the reverse proxy, not client-controllable) over
  // x-forwarded-for whose leftmost value is supplied by the client. When only
  // x-forwarded-for is present, take the *last* entry (appended by the
  // outermost trusted proxy). Cap length to prevent oversized store keys.
  const rawIp =
    headerList.get("x-real-ip")?.trim() ??
    headerList.get("x-forwarded-for")?.split(",").at(-1)?.trim() ??
    "unknown";
  const ip = rawIp.slice(0, 45);

  // IP-only bucket — primary enumeration guard. An attacker cycling through
  // different email addresses cannot create fresh buckets to evade this limit.
  const ipRlResult = await checkRateLimit({
    identifier: ip,
    action: "auth:sign-up",
    limit: 10,
    windowMs: 60_000,
  });

  if (!ipRlResult.success) {
    return {
      errors: ["Too many sign-up attempts. Please wait a minute and try again."],
    };
  }

  // Per-email bucket — secondary limit to slow concentrated attempts against a
  // single address (e.g. credential-stuffing a known email).
  const emailRlResult = await checkRateLimit({
    identifier: email,
    action: "auth:sign-up:email",
    limit: 3,
    windowMs: 60_000,
  });

  if (!emailRlResult.success) {
    return {
      errors: ["Too many sign-up attempts. Please wait a minute and try again."],
    };
  }

  // ── 3. Check for duplicate email ──────────────────────────────────────────
  // Return a generic success-like response for existing emails so an attacker
  // cannot distinguish a registered address from an unregistered one (i.e. no
  // email enumeration via differing error vs. success responses).
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { success: true };
  }

  // ── 4. Hash password ──────────────────────────────────────────────────────
  const passwordHash = await hashPassword(password);

  // ── 5. Resolve CUSTOMER role ──────────────────────────────────────────────
  // Upsert is idempotent: creates the role when missing and avoids unique-
  // constraint races when multiple sign-up requests run concurrently.
  const customerRole = await db.role.upsert({
    where: { key: "CUSTOMER" },
    create: { key: "CUSTOMER", name: "Customer" },
    update: {},
  });

  // ── 6. Create user ────────────────────────────────────────────────────────
  try {
    await db.user.create({
      data: {
        email,
        name: name || null,
        password: passwordHash,
        roleId: customerRole.id,
      },
    });
  } catch (err) {
    logger.error("sign-up: user creation failed", { err });
    return {
      errors: ["Could not create your account. Please try again."],
    };
  }

  // ── 7. Sign in immediately (throws redirect on success) ────────────────────
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: routes.storefront.home,
    });
  } catch (err) {
    // Auth.js throws a NEXT_REDIRECT for the redirect — re-throw it.
    if (err instanceof AuthError) {
      logger.error("sign-up: auto sign-in failed", { err });
      // User was created; send them to sign-in page to log in manually.
      redirect(routes.auth.signIn);
    }
    throw err; // Re-throw redirect or unexpected errors
  }

  return { success: true };
}
