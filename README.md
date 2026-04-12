# One Dollar

Production-ready foundation for a **single-vendor e-commerce app** built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui-compatible patterns**.

## Current Status

This repository now covers **Phase 3 / Prompt 3.1** foundation work:

- polished storefront and admin shell placeholders
- system-aware theme switching with light and dark support
- global design tokens for spacing, radii, shadows, and semantic colors
- reusable UI primitives for page sections, empty/loading/error states, badges, price display, and skeletons
- shared frontend toast/notification support via `sonner`
- storefront primary navigation with responsive header and mobile nav
- footer sections for company links, policies, and newsletter placeholder
- static placeholder pages for company and policy routes
- Prisma schema and migration foundation for the initial commerce domain
- server-side database access conventions in `src/server/db` for repositories, services, transactions, and pagination
- smoke and unit tests covering UI, config, schema validation, and new data-layer helpers

> Business features remain intentionally deferred to later prompts.

## Tech Stack

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- Vitest
- `pnpm`

## Quick Start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

## Environment Strategy

- Public values are validated in `src/config/env.ts`.
- Safe aggregated config is available from `src/config/app-config.ts`.
- `APP_SECRET` is only required when a future server-side integration explicitly enables it.
- `DATABASE_URL` is required for Prisma-backed development flows and server features that query the database.

## Available Commands

```bash
pnpm dev
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm test:watch
pnpm build
```

## Important Paths

```text
src/app         App Router entrypoints, layouts, and boundaries
src/components  Shared UI primitives, providers, and layout parts
src/config      Env validation, routes, metadata, feature flags, and app config
src/features    Future domain modules (catalog, cart, checkout, admin)
src/server      Future server-side services and repositories
docs/ai         AI-facing continuity docs for future Copilot prompts
docs/dev        Developer-facing setup and architecture notes
tests           Smoke tests for scaffold and config behavior
```

## Documentation

- `docs/ai/project-overview.md`
- `docs/ai/coding-conventions.md`
- `docs/ai/task-status.md`
- `docs/dev/setup.md`
- `docs/dev/architecture.md`
- `docs/dev/database-access.md`
- `docs/dev/ui-conventions.md`

## Next Recommended Step

Proceed with auth, RBAC, or the first feature module on top of the shared `src/server/db` conventions.
