# Project Overview

## Scope

`One Dollar` is a production-minded single-vendor e-commerce application for Pakistan, starting with **Karachi only**. The same Next.js codebase will power:

- the storefront
- the admin panel
- future authentication flows

## Current Phase

This repository currently implements **Prompt 3.3 — category listing and product grid** on top of the previously completed storefront shell, homepage foundation, auth, RBAC, and security baseline.

### Included now

- Next.js App Router + TypeScript + Tailwind CSS foundation
- shadcn/ui-compatible setup (`components.json`, `cn()` utility, reusable primitives)
- theme provider wiring plus a three-way `system` / `light` / `dark` toggle
- global design tokens in `src/app/globals.css` for semantic colors, spacing, radii, and shadows
- polished storefront header/footer and a responsive admin shell placeholder with sidebar + topbar
- reusable UI wrappers for page containers, section headers, empty/loading/error states, badges, price formatting, and skeletons
- shared frontend toast support through `sonner`, `AppToaster`, and `notify.*()`
- lazy Prisma singleton access through `src/server/db/client.ts`
- shared server-side database conventions for repositories, services, transaction orchestration, pagination, and query result typing in `src/server/db`
- homepage rendering through `src/features/homepage` with CMS-ready fallback sections
- catalog listing routes at `/categories` and `/categories/[slug]` backed by `src/features/catalog`
- typed filter parsing, basic sorting, and pagination contracts ready to swap from fallback data to Prisma-backed catalog queries later
- helper tests covering pagination, query results, transaction helpers, safe Prisma singleton reuse, and storefront catalog filtering
- updated AI and developer docs for UI conventions and future continuity

### Intentionally deferred

- product detail pages, cart, checkout, and payments
- live Prisma-backed catalog persistence and admin catalog CRUD
- analytics and notifications beyond shared frontend toasts
- CMS persistence beyond the current homepage fallback scaffolds

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
- Use `src/features/catalog` as the seam for listing filters, seeded fallback data, and future product/category service logic.
- Put new Prisma queries behind repository factories in `src/server` and let services own transactions.
- Reuse `loadAppConfig()` / `getRequiredServerEnv()` for new config-dependent server features.
- Update both `docs/ai` and `docs/dev` whenever a new capability is added.
