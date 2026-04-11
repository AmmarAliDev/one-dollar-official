"use client";

/**
 * Client-side auth re-exports.
 *
 * Use these in Client Components instead of importing directly from
 * `next-auth/react` — keeps the auth boundary in one place and makes
 * future migrations simpler.
 *
 * For Server Components and Server Actions, use `@/lib/auth/session`
 * or import `{ auth, signIn, signOut }` from `@/auth` directly.
 */

export { signIn, signOut, useSession } from "next-auth/react";
