"use server";

/**
 * Standard sign-out server action.
 *
 * Use this through a form submission anywhere the UI needs a logout control.
 * That keeps CSRF checks intact and makes the post-logout redirect consistent
 * across storefront, account, and admin surfaces.
 */

import { cookies } from "next/headers";

import { signOut } from "@/auth";
import { routes } from "@/config/routes";
import { getOrCreateGuestCartToken, setCartTokenCookie } from "@/features/cart";
import { assertTrustedOrigin } from "@/lib/security/csrf";

export async function signOutAction() {
  await assertTrustedOrigin({ action: "auth:sign-out" });

  const cookieStore = await cookies();
  try {
    const nextGuestToken = await getOrCreateGuestCartToken();
    await setCartTokenCookie(cookieStore, nextGuestToken);
  } catch (error) {
    console.error("Unable to prepare guest cart token during sign-out", error);
  }

  await signOut({ redirectTo: routes.storefront.home });
}
