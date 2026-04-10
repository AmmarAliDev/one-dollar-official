# One Dollar

Production-ready architecture scaffold for a **single-vendor e-commerce app** built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui-compatible patterns**.

## Current Status
This repository currently covers **Phase 0 / Prompt 0.1**:
- foundational folder structure
- shared storefront, admin, and auth placeholders
- dark/light theme wiring
- centralized config modules
- starter error boundaries and docs
- basic smoke tests for the scaffold

> Business features are intentionally deferred to later prompts.

## Tech Stack
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- `pnpm`

## Quick Start
```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

## Available Commands
```bash
pnpm dev
pnpm lint
pnpm test
pnpm build
```

## Important Paths
```text
src/app         App Router entrypoints, layouts, and boundaries
src/components  Shared UI primitives, providers, and layout parts
src/config      Routes, metadata, env defaults, and feature flags
src/features    Future domain modules (catalog, cart, checkout, admin)
src/server      Future server-side services and repositories
docs/ai         AI-facing continuity docs for future Copilot prompts
docs/dev        Developer-facing setup and architecture notes
tests           Smoke tests for the current scaffold
```

## Documentation
- `docs/ai/project-overview.md`
- `docs/ai/coding-conventions.md`
- `docs/ai/task-status.md`
- `docs/dev/setup.md`
- `docs/dev/architecture.md`

## Next Recommended Step
Proceed with **Prompt 0.2** to tighten code quality, environment validation, and engineering standards.

