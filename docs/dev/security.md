# Security Conventions — Developer Guide

## Goal

Provide a baseline, production-minded security layer that future features can reuse without rewriting the auth or routing foundations.

## What is now in place

### 1. Global security headers

`next.config.ts` now applies a shared header strategy sourced from `src/config/security.ts`.

Included headers:

- `Content-Security-Policy`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`
- `Strict-Transport-Security` in production only

> The CSP is intentionally a **baseline-compatible** policy for the current Next.js App Router setup. It allows the app to function cleanly today while leaving room for a stricter nonce-based CSP later.

### 2. CSRF strategy

There are **two layers**:

1. **Auth.js built-in CSRF protection** continues to protect `/api/auth/*` endpoints.
2. **Custom sensitive mutations** should use request-origin validation through:
   - `assertTrustedOrigin()` for Server Actions
   - `assertTrustedRouteHandlerRequest()` for Route Handlers

These helpers live in `src/lib/security/csrf.ts` and validate that mutating requests come from a trusted first-party origin.

### 3. Rate limiting

`src/lib/rate-limit/index.ts` now supports a **Redis-first** foundation with a safe in-memory fallback:

- **Preferred production backend:** Upstash Redis via `@upstash/redis` + `@upstash/ratelimit`
- **Fallback:** in-memory store for local development, tests, and unconfigured environments

Required env vars for Redis mode:

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Optional extra trusted origins for reverse proxies or custom domains:

```env
APP_ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
```

### 4. Validation conventions

Use shared helpers from `src/lib/security/validation.ts`:

- `emailAddressSchema`
- `optionalDisplayNameSchema`
- `createPasswordSchema()`
- `validateWithSchema()`
- `getZodIssueMessages()`

These keep validation rules and error messages consistent across Server Actions, forms, and future APIs.

### 5. Safe error handling

For new mutation code:

- Normalize unknown exceptions with `toAppError()`
- Log server-side failures with `captureServerError()`
- Return user-safe Server Action feedback with `toActionErrorState()`
- Return typed API errors with `createRouteHandlerErrorResponse()`

## Recommended conventions for future mutations

### Server Actions

```ts
await assertTrustedOrigin({ action: "cart:update" });

const parsed = validateWithSchema(cartItemSchema, rawInput);
if (!parsed.success) {
  return { errors: parsed.errors };
}
```

### Route Handlers

```ts
assertTrustedRouteHandlerRequest(request, { action: "order:create" });
```

Wrap unexpected failures with:

```ts
return createRouteHandlerErrorResponse(error, "order:create");
```

## Deferred on purpose

- **Nonce-based CSP** for even stricter script execution controls
- **Dedicated double-submit CSRF tokens** for any future embedded/cross-origin client integrations
- **WAF / bot mitigation / abuse analytics** above the application layer
- **Per-feature audit persistence** for high-risk admin mutations

These are intentionally deferred so the current baseline stays lightweight, compatible, and easy to extend.
