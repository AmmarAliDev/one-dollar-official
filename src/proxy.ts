/**
 * Next.js Proxy — lightweight optimistic RBAC check.
 *
 * This file performs a fast request-time redirect for `/admin` routes while the
 * server-side layout guard remains the authoritative access check.
 */

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { routes } from "@/config/routes";
import { evaluateRouteAccess, rbacPermissions } from "@/lib/auth/rbac";

export default auth((request) => {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith(routes.admin.dashboard)) {
    const result = evaluateRouteAccess({
      isAuthenticated: Boolean(request.auth?.user),
      role: request.auth?.user?.role,
      permissions: [rbacPermissions.adminAccess],
    });

    if (!result.isAllowed) {
      const redirectUrl = new URL(
        result.reason === "unauthorized" ? routes.system.unauthorized : routes.system.forbidden,
        request.url,
      );
      redirectUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon\\.ico).*)"],
};
