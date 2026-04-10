# Architecture Notes

## Goal
Create a scalable foundation for a single-vendor e-commerce app using one shared codebase for storefront, admin, and auth experiences.

## Layering Pattern
1. **`src/app`** — routing, layouts, metadata, boundaries
2. **`src/components`** — shared UI and layout primitives
3. **`src/features`** — future business modules (catalog, cart, checkout, admin tools)
4. **`src/server`** — future repositories, services, auth, and integrations
5. **`src/config`** — app-wide constants and configuration strategy
6. **`src/lib`** — low-level helpers and shared error utilities

## Route Groups
- `(storefront)` reserves the customer-facing shell
- `(admin)` reserves the operations dashboard space
- `(auth)` reserves sign-in and account entry points

## Error Handling Strategy
- `src/app/error.tsx` handles route-segment failures gracefully
- `src/app/global-error.tsx` prevents unhandled app crashes from leaking details
- `src/app/not-found.tsx` provides a safe placeholder for unbuilt routes
- `src/lib/errors` centralizes reusable error abstractions and user-facing messaging

## Deferred on Purpose
This phase does **not** implement business features, database access, auth logic, or admin workflows. Those should be added in later prompts on top of the existing structure.
