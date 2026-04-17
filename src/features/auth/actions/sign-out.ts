"use server";

/**
 * Standard sign-out server action.
 *
 * Use this through a form submission anywhere the UI needs a logout control.
 * That keeps CSRF checks intact and makes the post-logout redirect consistent
 * across storefront, account, and admin surfaces.
 */

import { signOut } from "@/auth";
import { routes } from "@/config/routes";
import { assertTrustedOrigin } from "@/lib/security/csrf";

export async function signOutAction() {
  await assertTrustedOrigin({ action: "auth:sign-out" });
  await signOut({ redirectTo: routes.storefront.home });
}
