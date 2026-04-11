# Auth Setup — Developer Guide

## Overview

Authentication is implemented with [Auth.js v5 (next-auth)](https://authjs.dev/) using:
- **Email/password** via the Credentials provider
- **Google SSO** via the Google OAuth provider
- **JWT sessions** (no DB round-trip per request; OAuth accounts stored in DB)
- **Prisma adapter** to persist OAuth accounts and user records

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
2. `signUpAction` server action validates, rate-limits, hashes password, creates `User` with `CUSTOMER` role.
3. Immediately calls `signIn("credentials")` → creates JWT session → redirects to home.

### Sign-in (credentials)
1. User fills the sign-in form at `/auth/sign-in`.
2. `signInAction` server action validates, rate-limits, calls Auth.js `signIn("credentials")`.
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
- Client: call `signOut()` from `next-auth/react` or use a form action pointing to `signOutAction`.
- The JWT cookie is cleared and the user is redirected to home.

## Session Access

### Server Components / Server Actions
```typescript
import { auth } from "@/auth";
// or use helpers:
import { getSession, requireSession, getCurrentUserId } from "@/lib/auth/session";

const session = await auth();             // nullable (raw Auth.js call)
const session = await getSession();       // nullable (helper wrapper around auth())
const session = await requireSession();   // throws redirect if not logged in
const userId  = await getCurrentUserId(); // nullable string
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
  middleware.ts                        # Auth session middleware (route protection in 2.4)
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
      google-sign-in-button.tsx        # Google SSO button (client component)
  lib/auth/
    session.ts                         # Server-side session helpers
    client.ts                          # Client-side auth re-exports
    password.ts                        # bcrypt hash/compare utilities
  lib/rate-limit/
    index.ts                           # In-memory rate limit (Redis-ready abstraction)
  components/providers/
    auth-provider.tsx                  # SessionProvider wrapper for root layout
  app/(auth)/auth/
    sign-in/page.tsx                   # /auth/sign-in
    sign-up/page.tsx                   # /auth/sign-up
    error/page.tsx                     # /auth/error (Auth.js error page)
    forgot-password/page.tsx           # /auth/forgot-password (placeholder)
  app/api/auth/[...nextauth]/route.ts  # Auth.js catch-all API route
```

## Rate Limiting

Auth routes use an in-memory sliding-window rate limiter:
- Sign-in: 10 attempts / minute / IP
- Sign-up: 10 attempts / minute / IP (+ 3 attempts / minute / email)

> **WARNING — not suitable for multi-instance or serverless deployments.**
> The current implementation (`src/lib/rate-limit/index.ts`) keeps counters
> in process memory. Every instance (Vercel serverless function, AWS Lambda
> invocation, load-balancer node) maintains its own independent counter, so
> an attacker who distributes requests across instances effectively multiplies
> the allowed attempts by the number of running instances and can bypass the
> limit entirely. **Do not rely on this implementation in any horizontally
> scaled or serverless production environment.**
>
> Migrate to a centralized store before going to production. The recommended
> path is to swap the store inside `src/lib/rate-limit/index.ts` for a
> Redis-backed implementation (e.g. [`@upstash/ratelimit`](https://github.com/upstash/ratelimit-js)).
> All callers use the stable `checkRateLimit` function — no call-site changes
> are required. See the **Production upgrade** note below for the planned
> migration checkpoint.

**Production upgrade (Prompt 2.5):** Swap `src/lib/rate-limit/index.ts` implementation with a Redis-backed store (e.g. `@upstash/ratelimit`). The `checkRateLimit` function signature is stable — callers don't change.

## Password Security

Passwords are hashed with **bcrypt** (12 salt rounds, ~300ms on modern hardware). The hash is stored in `User.password`. OAuth-only accounts have `null` in this field.

```typescript
import { hashPassword, comparePassword } from "@/lib/auth/password";

const hash = await hashPassword("mysecretpassword");
const valid = await comparePassword("mysecretpassword", hash); // true
```

## Deferred

- **Email-based password reset** — requires transactional email provider (Resend/Postmark). Placeholder page at `/auth/forgot-password`. Will be implemented in Prompt 4.4.
- **Admin route protection** — middleware exposes the session but does not block routes yet. Role-based blocking is implemented in Prompt 2.4 (RBAC).
- **Email verification flow** — `User.emailVerified` is set by Auth.js for OAuth accounts. Credential-based email verification is deferred.
- **Redis rate limiting** — current in-memory implementation is single-instance only. Redis upgrade is in Prompt 2.5.
