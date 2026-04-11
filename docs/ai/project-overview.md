# Project Overview

## Scope

`One Dollar` is a production-minded single-vendor e-commerce application for Pakistan, starting with **Karachi only**. The same Next.js codebase will power:

- the storefront
- the admin panel
- future authentication flows

## Current Phase

This repository currently implements **Prompt 0.2 — engineering quality standards on top of the initial scaffold**.

### Included now

- Next.js App Router + TypeScript + Tailwind CSS foundation
- shadcn/ui-compatible setup (`components.json`, `cn()` utility, base UI primitives)
- route placeholders for storefront, admin, and auth
- theme provider wiring for dark/light mode
- centralized config for env, routes, metadata, feature flags, and safe app config loading
- strict TypeScript, shared aliases, ESLint, Prettier, and project scripts
- readable runtime errors for invalid or missing environment variables
- smoke tests covering config behavior and env validation
- AI and developer documentation structure

### Intentionally deferred

- catalog, cart, checkout, payments
- database and Prisma
- authentication providers
- RBAC and admin workflows
- analytics, notifications, and CMS logic

## Folder Structure Snapshot

```text
src/
  app/            App Router entrypoints and route groups
  components/     shared UI, layout, and providers
  config/         env validation, metadata, routes, feature flags, app config
  features/       future domain modules
  hooks/          reusable React hooks
  lib/            cross-cutting helpers and errors
  server/         future server-only services and repositories
  types/          shared TypeScript contracts
```

## Guidance for Future Prompts

- Continue from the current repository state.
- Extend existing layers instead of creating duplicate patterns.
- Keep business logic inside `src/features` or `src/server`, not directly in pages.
- Reuse `loadAppConfig()` / `getRequiredServerEnv()` for new config-dependent server features.
- Update both `docs/ai` and `docs/dev` whenever a new capability is added.
