# One Dollar

Production-ready foundation for a **single-vendor e-commerce app** built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui-compatible patterns**.

## Current Status

This repository now covers **Phase 0 / Prompt 0.2**:

- shared storefront, admin, and auth placeholders
- centralized routing, metadata, and feature config
- strict TypeScript and shared path aliases
- ESLint + Prettier engineering quality gates
- typed environment validation with readable config errors
- smoke tests covering config loading and env validation

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

## Next Recommended Step

Proceed with the next product-focused prompt on top of the now-validated engineering foundation.
