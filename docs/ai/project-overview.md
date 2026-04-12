# Project Overview

## Scope

`One Dollar` is a production-minded single-vendor e-commerce application for Pakistan, starting with **Karachi only**. The same Next.js codebase will power:

- the storefront
- the admin panel
- future authentication flows

## Current Phase

This repository currently implements **Prompt 4.2 — one-page checkout foundation** on top of the previously completed storefront shell, homepage foundation, auth, RBAC, security baseline, category listing, PDP, search, wishlist/account, and cart flows.

### Included now

> This list highlights recent and core additions and is not exhaustive; previously completed features include auth, RBAC, and the security baseline.

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
- product detail routes at `/categories/[slug]/[productSlug]` with static params, metadata generation, and seeded fallback product detail contracts
- PDP feature components for image gallery, variant selection UX, product info panel, specifications, review summary/list, related products, and structured skeleton loading state
- catalog product cards now link to PDP routes and related-product cards reuse the same route contracts
- wishlist mutations via `POST/DELETE /api/wishlist/items` with authenticated user checks and safe request validation
- wishlist UI support on PDP (`Save to wishlist`) plus a real `/wishlist` page with guest sign-in prompt, empty state, and remove actions
- protected account area with reusable account shell and section routes for profile, addresses, order history, and reviews placeholders
- sign-in return-path support (`/auth/sign-in?from=...`) for smoother guest-to-authenticated wishlist/account flows
- one-page checkout route at `/checkout` with customer info, shipping address, order summary, and payment method selection
- Karachi-only checkout restriction enforced on both client and server with clear user-facing copy
- fixed shipping fee checkout totals (`subtotal + 250`) shared through checkout service helpers
- `POST /api/checkout` validation endpoint for checkout payload, cart integrity checks, and stock-aware submission gating
- payment abstraction registry in `src/features/checkout/payment.ts` with COD implementation and extension seam for future online gateways
- retry-safe checkout UX with user-friendly validation and submit error handling
- helper tests covering pagination, query results, transaction helpers, safe Prisma singleton reuse, and storefront catalog filtering
- helper tests now also cover PDP service retrieval and related-product behavior
- helper tests now include wishlist seed-selection behavior and updated storefront route assertions
- helper tests now include checkout validation, totals, and payment provider selection contracts
- updated AI and developer docs for UI conventions and future continuity

### Intentionally deferred

- order placement lifecycle and invoice generation
- online payment gateway integrations
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
