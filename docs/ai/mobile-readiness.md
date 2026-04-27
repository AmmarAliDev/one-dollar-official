# Mobile Readiness Boundaries (AI Context)

Use this guide when adding features that should remain compatible with future mobile clients.

## Stable boundaries

1. API transport boundary
- Keep request/response handling in `src/app/api/*`.
- Route handlers should validate input and delegate business operations to feature services.

2. Business logic boundary
- Keep core rules in `src/features/*/service.ts`.
- Do not place business rules directly in React page/component files.

3. Contract boundary
- Feature contracts (types + schemas) are the canonical interface for UI and API layers.
- Checkout submit contract is currently defined in:
  - `src/features/checkout/api-contract.ts`
  - `src/features/checkout/client.ts`

4. UI boundary
- Components should use feature clients/helpers for transport concerns.
- Components should not parse raw API payloads inline when a feature client exists.

## Implemented in this step

1. Typed checkout API response contract with runtime parsing.
2. Shared checkout submit client with robust error normalization.
3. Checkout client UI decoupled from direct `fetch` response parsing.
4. Test coverage for success and failure paths of checkout submit transport.

## Prompting guidance for future steps

When adding mobile-ready functionality:
- Prefer extending feature services/contracts over adding logic in route/page files.
- Keep error messages user-safe and transport-agnostic.
- Preserve existing behavior; avoid broad rewrites.
- Add or update tests for new service/client contract seams.

## Deferred by design

- API versioning and OpenAPI output.
- Mobile auth/session token design.
- Offline-first workflows.
