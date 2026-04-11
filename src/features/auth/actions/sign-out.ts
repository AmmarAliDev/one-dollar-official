"use server";

/**
 * Sign-out server action.
 *
 * Wraps Auth.js's `signOut` so it can be called from a form action
 * or directly from server context. Auth.js clears the session cookie
 * and redirects to the home page.
 */

import { signOut } from "@/auth";
import { routes } from "@/config/routes";

export async function signOutAction() {
  await signOut({ redirectTo: routes.storefront.home });
}
