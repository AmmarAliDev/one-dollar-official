/**
 * Next.js middleware — auth session foundation.
 *
 * Currently: exposes the Auth.js session on every matched request so that
 * Server Components can call `auth()` without an extra cold start.
 *
 * Route protection (blocking /admin for unauthorized users) is intentionally
 * deferred to Prompt 2.4 (RBAC). Add role-check logic inside the callback
 * when that step is implemented.
 *
 * The matcher excludes:
 *  - /api/auth  — Auth.js internal endpoints (handled by [...nextauth]/route.ts)
 *  - /_next     — Next.js static assets
 *  - /favicon   — browser default asset request
 */

import { auth } from "@/auth";

// Exporting `auth` as middleware enables Auth.js session parsing on every
// matched request. The session is then available via `auth()` in RSCs.
export default auth;

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon\\.ico).*)"],
};
