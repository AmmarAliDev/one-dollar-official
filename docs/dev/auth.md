# Auth Setup — Developer Guide

## Overview

Authentication is implemented with [Auth.js v5 (next-auth)](https://authjs.dev/) using:

- **Email/password** via the Credentials provider
- **Google SSO** via the Google OAuth provider
- **JWT sessions** (no DB round-trip per request; OAuth accounts stored in DB)
- **Prisma adapter** to persist OAuth accounts and user records
- **Typed RBAC guards** for admin-only route protection and permission-aware server utilities

## Environment Variables

Add these to `.env.local` for local development and to your deployment secrets for production.

```env
# ── Auth.js ────────────────────────────────────────────────────────────────
# Required. Generate with: openssl rand -base64 32
AUTH_SECRET=

# Optional. Defaults to NEXT_PUBLIC_APP_URL if omitted.
AUTH_URL=http://localhost:3000

# ── Google OAuth ────────────────────────────────────────────────────────────
# Required for Google SSO. Create at: https://console.cloud.google.com/
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# ── Database (already used by Prisma) ───────────────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/one_dollar
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
4. Copy the Client ID and Secret into your env vars.

## Auth Flow

### Sign-up (credentials)

1. User fills the sign-up form at `/auth/sign-up`.
2. `signUpAction` verifies trusted request origin, validates input with Zod, rate-limits the attempt, hashes the password, and creates the `User` with the `CUSTOMER` role.
3. Immediately calls `signIn("credentials")` → creates JWT session → redirects to home.

### Sign-in (credentials)

1. User fills the sign-in form at `/auth/sign-in`.
2. `signInAction` verifies trusted request origin, validates input, rate-limits the attempt, and calls Auth.js `signIn("credentials")`.
3. Auth.js `authorize()` in `src/auth.ts` fetches the user, verifies bcrypt hash.
4. On success → JWT cookie set → redirected to home.

### Sign-in (Google)

1. User clicks "Continue with Google" at `/auth/sign-in` or `/auth/sign-up`.
2. Browser redirects to Google OAuth consent screen.
3. Auth.js callback at `/api/auth/callback/google` processes the token.
4. If the email matches an existing `User`, the `Account` is linked.
5. If new user → `User` created via the Prisma adapter.
6. JWT session created → redirected to home.

### Sign-out

The app now uses one primary sign-out convention across storefront, account, and admin UI:

- Prefer the shared `SignOutButton` or a plain `<form action={signOutAction}>` submission for logout controls.
- `signOutAction` performs the trusted-origin check and then redirects to `routes.storefront.home` after the Auth.js session cookie is cleared.
- This pattern is used in the storefront header dropdown, the mobile drawer, the account profile page, and the admin shell menu.
- Use client-side `signOut()` from `next-auth/react` only for an explicitly client-driven flow that genuinely cannot use a form submission.

This keeps logout behavior progressively enhanced, CSRF-aware, and consistent across desktop and mobile surfaces.

## RBAC and Route Protection

### Admin role matrix

| Role              | Admin access | Primary permissions                                 |
| ----------------- | ------------ | --------------------------------------------------- |
| `SUPER_ADMIN`     | ✅           | Full admin access, catalog, orders, users, settings |
| `PRODUCT_MANAGER` | ✅           | Catalog read/write, order read                      |
| `ORDER_MANAGER`   | ✅           | Order read/write, customer read                     |
| `CUSTOMER`        | ❌           | Storefront-only for now                             |
| `GUEST`           | ❌           | Anonymous browsing only                             |

### Guard flow

- `src/proxy.ts` performs a lightweight, best-effort pre-render redirect for `/admin` requests before the full page loads.
- `src/app/(admin)/layout.tsx` uses `requireAdminAccess()` as the authoritative server-side guard.
- `src/lib/auth/guards.ts` exposes a route-handler-safe `guardRouteHandlerAccess()` helper that returns a typed `NextResponse` for `401`/`403` API responses.
- `src/lib/auth/rbac.ts` owns the typed role/permission matrix and reusable permission helpers.
- `src/app/unauthorized/page.tsx` and `src/app/forbidden/page.tsx` provide the user-facing recovery screens.

## Session Access

### Server Components / Server Actions

```typescript
import { auth } from "@/auth";
// or use helpers:
import { getSession, requireSession, getCurrentUserId, hasPermission } from "@/lib/auth/session";
import { requireAdminAccess } from "@/lib/auth/guards";
import { rbacPermissions } from "@/lib/auth/rbac";

const session = await auth(); // nullable (raw Auth.js call)
const session = await getSession(); // nullable (helper wrapper around auth())
const session = await requireSession(); // redirects if not logged in
const userId = await getCurrentUserId(); // nullable string
const canEdit = await hasPermission(rbacPermissions.catalogWrite); // boolean

await requireAdminAccess({ from: "/admin" });
```

### Client Components

```typescript
import { useSession } from "@/lib/auth/client";

const { data: session, status } = useSession();
// status: "loading" | "authenticated" | "unauthenticated"
```

## File Structure

```
src/
  auth.ts                              # Auth.js config (providers, callbacks, pages)
  proxy.ts                             # Lightweight /admin pre-render redirects using auth/session hints
  config/
    routes.ts                          # Site route definitions (exports `routes` with `routes.storefront.home`)
  types/next-auth.d.ts                 # Session/JWT type augmentation
  features/auth/
    validators.ts                      # Zod schemas: signIn, signUp, forgotPassword
    actions/
      sign-in.ts                       # Credentials sign-in server action
      sign-up.ts                       # New user creation server action
      sign-out.ts                      # Sign-out server action
    components/
      sign-in-form.tsx                 # Email/password form (client component)
      sign-up-form.tsx                 # Registration form (client component)
      sign-out-button.tsx               # Shared `SignOutButton` form submit control (exports `SignOutButton`)
      google-sign-in-button.tsx        # Google SSO button (client component)
  lib/auth/
    session.ts                         # Server-side session helpers
    client.ts                          # Client-side auth re-exports
    guards.ts                          # Route guards for RSCs and route handlers
    rbac.ts                            # Typed role + permission model
    password.ts                        # bcrypt hash/compare utilities
  lib/audit/
    admin-actions.ts                   # Audit-log-ready helper for admin mutations
  lib/rate-limit/
    index.ts                           # Redis-first rate limiting with safe in-memory fallback
  lib/security/
    csrf.ts                            # Trusted-origin CSRF checks for sensitive mutations
    validation.ts                      # Shared Zod validation primitives and helpers
  components/providers/
    auth-provider.tsx                  # SessionProvider wrapper for root layout
  app/(auth)/auth/
    sign-in/page.tsx                   # /auth/sign-in
    sign-up/page.tsx                   # /auth/sign-up
    error/page.tsx                     # /auth/error (Auth.js error page)
    forgot-password/page.tsx           # /auth/forgot-password (placeholder)
  app/unauthorized/page.tsx            # Friendly 401-style recovery page
  app/forbidden/page.tsx               # Friendly 403-style recovery page
  app/api/auth/[...nextauth]/route.ts  # Auth.js catch-all API route
```

## CSRF and Mutation Safety

The current baseline uses a **Next.js-compatible same-origin strategy**:

- **Auth.js** continues to protect `/api/auth/*` with its built-in CSRF handling.
- **Custom Server Actions** such as `signInAction`, `signUpAction`, and `signOutAction` call `assertTrustedOrigin()` from `src/lib/security/csrf.ts` before doing sensitive work.
- **Future Route Handlers** should use `assertTrustedRouteHandlerRequest()` together with `createRouteHandlerErrorResponse()` for consistent blocking and safe error payloads.
- `next.config.ts` now also sets `experimental.serverActions.allowedOrigins` so the app stays compatible behind trusted reverse proxies without weakening the default CSRF model.

### Allowed Origins Configuration

When the app runs behind a reverse proxy (e.g. Nginx, Cloudflare, Vercel Edge Network), the `Host` header seen by Next.js may differ from the browser's `Origin` header. Next.js rejects server-action requests when these don't match, so `experimental.serverActions.allowedOrigins` tells the framework which extra `host:port` values are legitimate.

The configuration key is:

```
experimental.serverActions.allowedOrigins
```

In this project the list is built at startup by `getServerActionAllowedOrigins()` in `src/config/security.ts`, which derives host values from:

| Source | Example entries |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `onedollar.com`, `www.onedollar.com` |
| `AUTH_URL` | `onedollar.com` |
| `APP_ALLOWED_ORIGINS` | Comma-separated extra origins you control (e.g. a staging proxy) |
| Hard-coded dev origins | `localhost:3000`, `127.0.0.1:3000` |

Each value is normalised to `host` (or `host:port`) via `new URL(origin).host`.

> **Security warning:** Only add origins that you own and control. Never use wildcards, IP ranges, or untrusted third-party domains. A misconfigured list effectively tells Next.js to skip its built-in same-origin check for those hosts, which **weakens CSRF protection**. When configured correctly — listing only your production domain, its `www` variant, the local dev address, and any trusted proxy origin — the default same-origin CSRF model remains fully intact.

## Rate Limiting

Sensitive auth flows now use a **Redis-first** rate-limit helper:

- Sign-in: 10 attempts / minute / IP+email bucket
- Sign-up: 10 attempts / minute / IP (+ 3 attempts / minute / email)

Implementation notes:

- `src/lib/rate-limit/index.ts` uses **Upstash Redis** when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are configured.
- Local development and CI fall back to the in-memory store automatically so the same helper still compiles and works without infrastructure.
- Call sites continue to use the stable `checkRateLimit()` API.

> For production, Redis credentials should still be configured so all instances share one central rate-limit state.

## Password Security

Passwords are hashed with **bcrypt** (12 salt rounds, ~300ms on modern hardware). The hash is stored in `User.password`. OAuth-only accounts have `null` in this field.

```typescript
import { hashPassword, comparePassword } from "@/lib/auth/password";

const hash = await hashPassword("mysecretpassword");
const valid = await comparePassword("mysecretpassword", hash); // true
```

## Deferred

- **Email-based password reset** — requires transactional email provider (Resend/Postmark). Placeholder page at `/auth/forgot-password`. Will be implemented in Prompt 4.4.
- **Audit log persistence** — `src/lib/audit/admin-actions.ts` currently logs structured admin events and prepares `AuditLog`-ready payloads; DB writes will be added alongside real admin mutations.
- **Email verification flow** — `User.emailVerified` is set by Auth.js for OAuth accounts. Credential-based email verification is deferred.
- **Nonce-based CSP hardening** — the current CSP is intentionally baseline-compatible; tighten it later if inline/script needs are fully mapped.
- **Dedicated double-submit CSRF tokens for embedded clients** — current same-origin protection is correct for the app today, but future cross-origin embeds or native clients may need an explicit token layer.
