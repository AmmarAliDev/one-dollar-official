# Task Status

## Current Milestone

**Phase 2 / Prompt 2.2 — Database utilities and repository conventions**

## Completed

- [x] System-aware theme switching upgraded to explicit `system`, `light`, and `dark` selection
- [x] Global design tokens added for semantic colors, spacing, radii, and shadows in `src/app/globals.css`
- [x] Storefront shell polished with a reusable header, footer, and responsive navigation structure
- [x] Admin route group upgraded with a sidebar + topbar placeholder shell
- [x] Reusable UI state primitives added for page containers, section headers, empty/loading/error states, badges, prices, and skeletons
- [x] Shared frontend toast support added through `sonner`, `AppToaster`, and `notify.*()`
- [x] Page-level fallbacks now use `PageErrorFallback`, while reusable `SectionErrorState` and `FormErrorSummary` cover localized and form-specific failures
- [x] Loading infrastructure expanded with `InlineSpinner`, configurable `PageSkeleton`, `CardSkeleton`, and `TableSkeleton`
- [x] Empty-state messaging is more configurable, and `ConfirmationDialog` now provides one reusable abstraction for high-impact actions
- [x] `src/lib/errors/error-messages.ts` centralizes friendly user-safe copy, and `src/lib/logger.ts` redacts sensitive fields for client/server logging
- [x] Boundary pages and preview/auth placeholders now exercise the new UX reliability patterns
- [x] Smoke coverage now includes safe messaging, validation summaries, and log redaction behavior in `tests/smoke/ux-infrastructure.test.ts`
- [x] AI and developer docs updated with UX and error-handling conventions for future prompts
- [x] Prisma access moved behind `src/server/db` with a lazy singleton getter instead of a top-level client instantiation
- [x] Shared repository/service factories added so future modules can accept a root client or transaction executor consistently
- [x] Transaction helpers added for both always-new and reuse-if-present transaction patterns
- [x] Offset pagination helpers added with typed metadata and user-safe validation errors
- [x] Query result typing helpers added for explicit success/failure flows when throwing is not the best fit
- [x] Database access guidance documented for future feature prompts in developer and AI docs
- [x] Helper coverage added for pagination, query results, transactions, and Prisma singleton reuse

## Deferred by design

- [ ] Product catalog and PDP implementation
- [ ] Real auth implementation
- [ ] Admin CRUD workflows and RBAC
- [ ] Server-side notifications and third-party integrations

## Recommended Next Prompt

Proceed with auth, RBAC, or the first feature-specific repositories/services on top of the shared data-layer conventions.
