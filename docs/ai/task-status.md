# Task Status

## Current Milestone

**Phase 0 / Prompt 0.2 — Engineering quality standards**

## Completed

- [x] Next.js App Router project initialized with `pnpm`
- [x] Core folder structure established under `src/`, `docs/`, and `tests/`
- [x] Global layout wired with a theme provider placeholder
- [x] Central config modules added for env, metadata, routes, and feature flags
- [x] Placeholder pages added for storefront preview, admin, and auth
- [x] Error, loading, and not-found boundaries added
- [x] ESLint, Prettier, strict TypeScript settings, and shared scripts configured
- [x] Shared path aliases added for app, config, lib, server, and tests
- [x] Typed env validation and safe app config loading layer added
- [x] Readable config errors added for invalid or missing required env values
- [x] Smoke tests extended for config loading and env validation
- [x] AI and developer documentation updated for the engineering workflow

## Deferred by design

- [ ] Real auth implementation
- [ ] Prisma/data layer
- [ ] Storefront business features
- [ ] Admin business workflows
- [ ] Sensitive server integrations that actively consume `APP_SECRET`

## Recommended Next Prompt

Proceed with the next product-oriented step (catalog, data layer, or auth) on top of this validated engineering baseline.
