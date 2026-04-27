# Mobile Readiness Strategy

This step documents practical service boundaries that allow a future mobile app to reuse core business logic without changing current behavior.

## Purpose

Prepare the codebase for future iOS/Android clients by formalizing API and domain seams, while keeping storefront/admin behavior unchanged.

## Current boundary map

1. HTTP/API boundary
- Route handlers under `src/app/api/*` are the transport layer.
- They validate input, enforce security checks, resolve auth/cart context, and call feature services.

2. Domain service boundary
- Business rules stay in `src/features/*/service.ts`.
- Services remain independent from React components and should return typed contracts.

3. Shared contract boundary
- Feature-level types and validation schemas are the source of truth for payloads.
- For checkout submit responses, typed contracts now live in:
  - `src/features/checkout/api-contract.ts`
  - `src/features/checkout/client.ts`

4. UI boundary
- Client components should delegate network orchestration to feature clients and avoid parsing raw transport payloads inline.

## What changed in this step

1. Added `submitCheckoutRequest` in `src/features/checkout/client.ts`.
- Centralizes checkout submit transport behavior.
- Normalizes network, server, and malformed-response failures into user-safe `AppError` instances.

2. Added checkout submit response contract in `src/features/checkout/api-contract.ts`.
- Defines runtime-validated success response shape.
- Provides safe extraction for server error messages.

3. Refactored checkout UI to use the feature client.
- `src/features/checkout/components/checkout-page-client.tsx` now focuses on form state/UI and delegates API parsing/error mapping.

4. Added focused tests.
- `tests/features/checkout/client.test.ts` covers success, API rejection, and malformed success payload handling.

## Why this helps mobile clients

- Mobile clients can target stable, documented API contracts instead of reverse-engineering UI behavior.
- Business logic remains in feature services, reducing duplication between web and future mobile apps.
- Transport parsing and user-safe error handling are reusable and test-covered.

## Intentionally deferred

1. Versioned public API namespace (`/api/v1/*`).
2. Mobile-specific auth tokens/session strategy.
3. Offline sync and conflict-resolution behavior.
4. Shared OpenAPI generation pipeline.

These are deferred to keep this step focused and non-breaking.
