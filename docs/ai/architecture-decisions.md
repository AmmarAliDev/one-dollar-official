# Architecture Decisions

## Purpose

Record stable design choices so future prompts can extend the system without breaking existing boundaries.

## Decision 1: Feature-first domain layering

- Decision: Keep business logic in `src/features/*` and server composition in `src/server/*`; keep `src/app/*` thin.
- Why: Improves maintainability, testing, and mobile-client reuse.
- Consequence: Route handlers/pages should delegate to services/contracts instead of embedding domain rules.

## Decision 2: Database access conventions

- Decision: Use shared server/db patterns for Prisma client, repository context, transactions, pagination, and query result contracts.
- Why: Prevents duplicated transaction/pagination behavior and inconsistent query semantics.
- Consequence: New data operations should follow existing repository/service patterns.

## Decision 3: Publish-state visibility enforcement

- Decision: Storefront catalog/blog visibility is controlled centrally in service/query layers.
- Why: Keeps storefront exposure rules consistent across pages, APIs, and future clients.
- Consequence: Do not bypass service/query visibility filters in route files.

## Decision 4: Contract-first checkout transport seam

- Decision: Checkout client/API uses explicit contract parsing and normalized error handling.
- Why: Improves resilience and keeps transport behavior reusable for future mobile clients.
- Consequence: New checkout transport behavior should extend existing contract files, not ad-hoc inline parsing.

## Decision 5: Payment provider abstraction with COD-first rollout

- Decision: COD remains active while gateway interfaces/types are prepared for future integrations.
- Why: Allows safe incremental gateway rollout without rewriting checkout.
- Consequence: Gateway-specific code must implement the provider contract and webhook model when activated.

## Decision 6: Shared UX reliability primitives

- Decision: Use shared error/loading/empty states, safe user messaging, and redacted logging patterns.
- Why: Consistent and non-technical user experience across storefront and admin surfaces.
- Consequence: New interactive flows should map failures through shared error utilities and fallback components.

## Decision 7: Shared table and form foundations

- Decision: Reuse app-wide table and form abstractions across admin and auth/checkout forms.
- Why: Reduces drift, improves consistency, and centralizes validation/interaction patterns.
- Consequence: New admin lists/forms should integrate with shared foundations unless there is a clear workflow exception.

## Decision 8: Auditability as a cross-cutting concern

- Decision: High-impact admin mutations and inventory/order transitions are captured in AuditLog.
- Why: Supports operational traceability and compliance-readiness.
- Consequence: New privileged mutations should define explicit audit event names and include actor/context metadata.

## Decision 9: Explicit deferment over hidden partial work

- Decision: Major non-trivial flows (payments, advanced inventory/revenue, email automation) are deferred with documented seams.
- Why: Prevents risky half-implementations while preserving future extension paths.
- Consequence: Deferred features must be documented in `docs/ai/open-tasks.md` and relevant dev docs.