# Architecture Notes

## Goal

Create a scalable foundation for a single-vendor e-commerce app using one shared codebase for storefront, admin, and auth experiences.

## Layering Pattern

1. **`src/app`** — routing, layouts, metadata, boundaries
2. **`src/components`** — shared UI and layout primitives
3. **`src/features`** — future business modules (catalog, cart, checkout, admin tools)
4. **`src/server`** — future repositories, services, auth, and integrations
5. **`src/config`** — app-wide constants, env validation, and safe config loading
6. **`src/lib`** — low-level helpers and shared error utilities

## Database Access Strategy

- `src/server/db/client.ts` owns the lazy Prisma singleton for Next.js server execution.
- `src/server/db/repository.ts` standardizes how repositories and services receive a `db` executor.
- `src/server/db/transaction.ts` provides shared transaction helpers so nested services can reuse an open transaction instead of opening another one.
- `src/server/db/pagination.ts` and `src/server/db/query-result.ts` keep list and result contracts consistent across feature modules.
- `src/lib/prisma.ts` remains only as a compatibility re-export and should not grow new logic.

## Route Groups

- `(storefront)` now uses a polished shared shell via `AppHeader` + `AppFooter`
- `(admin)` now uses `AdminShell` with a responsive sidebar and topbar placeholder
- `(auth)` reserves sign-in and account entry points

## UI Foundation Strategy

- Global design tokens live in `src/app/globals.css` and define semantic colors, spacing rhythm, radii, and shadow presets.
- `src/components/ui` now contains reusable UI-state and presentation primitives like `Badge`, `PriceDisplay`, `SectionHeader`, `EmptyState`, `LoadingState`, `ErrorState`, and `Skeleton`.
- `PageContainer` and `PageShell` should be reused for page spacing instead of duplicating wrapper classes.
- Shared frontend feedback uses `sonner` through `src/components/providers/app-toaster.tsx` and `src/lib/notify.ts`.

## Config and Environment Strategy

- `src/config/env.ts` validates public env input with a typed schema and throws readable `CONFIG_ERROR` messages.
- `src/config/app-config.ts` builds a safe application config snapshot for future server and feature modules.
- `src/config/feature-flags.ts` derives preview flags from validated env values instead of raw `process.env` access.
- `getRequiredServerEnv()` should be used when a future integration needs a non-public secret at runtime.
- `DATABASE_URL` must be available anywhere Prisma queries or CLI workflows run.

## Error Handling Strategy

- `src/app/error.tsx` and `src/app/global-error.tsx` now share `PageErrorFallback` so boundary copy stays consistent and user-safe.
- `SectionErrorState` and `FormErrorSummary` handle localized module failures and future form validation without leaking raw internals.
- `src/app/not-found.tsx` provides a safe placeholder for unbuilt routes.
- `src/lib/errors` centralizes reusable error abstractions and user-facing messaging through `toUserMessage()` and `getFormErrorMessages()`.
- `src/lib/logger.ts` offers a client/server-safe logger with sensitive field redaction for operational diagnostics.

## Engineering Quality Gates

- ESLint enforces consistent import ordering and type-only import style.
- Prettier formats code and keeps Tailwind utility order consistent.
- TypeScript runs in strict mode with stronger safety checks and shared path aliases.
- Vitest smoke tests now cover config loading and invalid env handling.

## Deferred on Purpose

This phase does **not** implement feature-specific repositories, auth logic, or admin workflows. Those should be added in later prompts on top of the shared `src/server/db` structure.
