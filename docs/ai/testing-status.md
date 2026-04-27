# Testing Status

## Purpose

Provide a compact testing map for AI prompts so changes can target the right test layer quickly.

## Quality Gates

- Required for implementation prompts when relevant: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`
- For this docs-only step, required checks requested by task: `pnpm test` and `pnpm build`

## Test Layers in Repository

- `tests/smoke`: contract-level checks and cross-cutting behavior
- `tests/server/db`: db utility and transaction/pagination/query-result contracts
- `tests/lib`: shared utility behavior (auth, security, errors, seo, forms)
- `tests/features`: feature module behavior (admin, auth, cart, catalog, checkout, orders, reviews, etc.)
- `tests/e2e`: Playwright critical path flows
- `tests/prisma`: schema/workflow validation (live-db dependent)

## Current Strengths

- Broad feature-level unit/integration coverage across storefront and admin domains
- Focused tests on high-risk seams: checkout transport parsing, order placement, inventory adjustment safety, moderation behavior
- Shared foundation coverage for forms, tables, error handling, and security helpers

## Known Gaps (from current docs and coverage posture)

- Auth session/guard helper depth can be expanded
- Some admin action routes can use deeper action-level tests
- UI-heavy feature interactions still rely more on integration/E2E than component-level unit tests

## Test Update Rule for Future Prompts

1. Add or update tests in the closest existing layer to the changed logic.
2. Prefer feature tests for business behavior and smoke tests for contract-level expectations.
3. Keep user-safe error and fallback behavior covered when adding new async flows.
4. Update this file when testing posture or gaps materially change.