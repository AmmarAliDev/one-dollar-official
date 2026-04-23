# Deployment Assumptions

This document records the deployment architecture assumptions baked into the codebase. Future AI-assisted prompts should be aware of these decisions and not contradict them without explicit instruction.

---

## Target Platform

- **Hosting:** Vercel (App Router, serverless functions)
- **Runtime:** Node.js 20.x (Vercel default)
- **Region:** Single-region at launch (closest to Karachi — Singapore `sin1` or Mumbai `bom1`)
- **Deployment model:** GitHub push to `main` triggers a Vercel production deployment

## Database

- **Provider:** Supabase PostgreSQL (Pro plan recommended) or Vercel Postgres
- **Connection model:** Pooled URL (`DATABASE_URL` with `pgbouncer=true&connection_limit=1`) for hot-path Prisma queries; direct URL (`POSTGRES_URL_NON_POOLING`) for migrations only
- **Migration strategy:** `prisma migrate deploy` runs as part of `build:deploy` (never `migrate dev` in production)
- **Prisma Client** is instantiated once per process via a lazy singleton in `src/server/db/prisma.ts`

## Caching

- **No Redis caching** in the current release — Upstash Redis is used exclusively for distributed rate limiting
- **ISR** is used for catalog routes (`revalidate = 900`)
- **No CDN-level page caching** beyond Vercel's default Edge caching for static assets

## Rate Limiting

- **Upstash Redis** (`@upstash/redis` + `@upstash/ratelimit`) with automatic fallback to an in-memory store
- Rate limits are applied at the API route / Server Action level via `checkRateLimit()` in `src/lib/rate-limit/`
- The in-memory fallback is NOT shared across Vercel function instances — it is only suitable for low traffic. Configure Redis for any meaningful production load.

## Auth

- **Auth.js v5** (`next-auth@beta`) with JWT sessions (stateless, no DB hit per request)
- **Providers:** Credentials (email + bcrypt) and Google OAuth
- **Role refresh:** JWT roles are refreshed from the database every 5 minutes (`ROLE_REFRESH_WINDOW_MS`)
- **Password reset** is deferred — no email reset flow exists yet
- `AUTH_URL` must be explicitly set in production to avoid redirect issues behind Vercel's edge proxy

## Email

- **Nodemailer** with SMTP — no hosted email SDK (no Resend, no SendGrid)
- All transactional emails (order confirmations, admin alerts) go through the same SMTP credentials
- Email marketing uses a **stub provider** — no live Mailchimp/Brevo/Klaviyo integration yet
- Email failures are non-blocking — they are logged but never surface to the end user

## Analytics

- **Google Analytics 4** via `next/script` with `strategy="afterInteractive"`
- **Meta Pixel** via `next/script`
- No Vercel Analytics, PostHog, or Plausible in the current release
- Analytics failures are fully isolated — a script load error never breaks the app

## Payment

- **COD only** — no online gateway is integrated
- The payment provider abstraction (`src/features/checkout/payment.ts`) is a seam for future Stripe/JazzCash/EasyPaisa integration
- COD is enforced at the server action level — no payment intent or webhook infra exists

## Background Jobs

- **None** in the current release — everything is synchronous and request-driven
- The abandoned cart recovery job (cron), double opt-in confirmation email, and campaign delivery are all deferred
- Future background work should use Vercel Cron Jobs (for time-based triggers) or a queue like Upstash QStash

## File Storage

- **No file upload** capability exists yet — product images use external URLs
- Future image upload should use Vercel Blob, Cloudflare R2, or Supabase Storage

## Environment Validation

- All environment variables are validated at runtime by `src/config/env.ts` (Zod schema)
- Invalid or missing required variables throw a `CONFIG_ERROR` with a clear message
- Optional variables (Redis, SMTP, Telegram, analytics) use all-or-nothing pair validation

## Health Check

- `GET /api/health` is a public endpoint that checks `env` and `db`
- It must not expose internal error details — only a pass/fail signal per check
- It is intended for Vercel health checks, uptime monitors, and deployment pipelines

## Security Headers

- Applied globally via `next.config.ts` + `src/config/security.ts`
- Includes CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- `poweredByHeader: false` removes the `X-Powered-By: Next.js` header

## Deployment Files

| File | Purpose |
|---|---|
| `.env.example` | Template for all environment variables with inline documentation |
| `docs/dev/deployment.md` | Full deployment guide for all services |
| `docs/dev/operations.md` | Backup, monitoring, maintenance, and incident response |
| `docs/dev/release-checklist.md` | Pre-launch, per-release, and post-launch checklists |
| `src/app/api/health/route.ts` | Health/readiness endpoint |
