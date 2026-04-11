/**
 * Server-side session utilities.
 *
 * All functions in this file are server-only (they import from `@/auth` which
 * uses server APIs). Do not import this file from Client Components.
 *
 * Usage pattern:
 *   const session = await getSession();           // nullable
 *   const session = await requireSession();       // throws/redirects
 *   const userId  = await getCurrentUserId();     // nullable string
 */

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { routes } from "@/config/routes";

/** Return the current session, or `null` if the user is not authenticated. */
export async function getSession() {
  return auth();
}

/**
 * Require an authenticated session.
 * Redirects to the sign-in page if the user is not logged in.
 * Use in Server Components and Server Actions that need a logged-in user.
 */
export async function requireSession(redirectTo = routes.auth.signIn) {
  const session = await auth();
  if (!session?.user) {
    redirect(redirectTo);
  }
  return session;
}

/**
 * Return the current user's database ID, or `null` if not authenticated.
 * Safe to call in any Server Component — no redirect side-effect.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/**
 * Return the current user's role key (e.g. "CUSTOMER", "SUPER_ADMIN"),
 * or `null` if not authenticated.
 */
export async function getCurrentUserRole(): Promise<string | null> {
  const session = await auth();
  return session?.user?.role ?? null;
}

/**
 * Check whether the current user has one of the given roles.
 * Returns `false` for unauthenticated users.
 */
export async function hasRole(...roleKeys: string[]): Promise<boolean> {
  const role = await getCurrentUserRole();
  if (!role) return false;
  return roleKeys.includes(role);
}
