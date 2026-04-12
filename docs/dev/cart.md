# Cart Logic

This document describes the cart behavior introduced in Phase 4 / Prompt 4.1.

## Goals

- support guest and authenticated users with one consistent cart API
- support products with and without variants
- keep cart mutations stock-aware and transaction-safe
- keep UX resilient with loading, empty, and error states

## Data model usage

The Prisma schema already includes:

- `Cart` with optional `userId` and optional unique `token`
- `CartItem` linked to `Cart` and `ProductVariant`

How it is used now:

- Guest carts are resolved by `Cart.token` and persisted in an HTTP-only cookie (`one-dollar-cart`)
- Authenticated carts are resolved by `userId` + `status=ACTIVE`
- ACTIVE carts are given a token so the frontend can keep continuity across guest/auth transitions; guest carts moving to `ABANDONED` have their token removed
- `CartItem.unitPrice` is kept as a snapshot at add/update time

## Guest to auth merge

When a signed-in user has a guest token cookie, cart resolution performs a merge:

1. Load guest active cart by token (`userId=null`)
2. Resolve or create the user active cart
3. Merge line items by `productVariantId` across the guest and user carts, summing quantities; `cartId` scoping only applies to operations within a single cart
4. Clamp merged quantities to available stock
5. Mark guest cart as `ABANDONED`, null out token, remove guest line items

Merge runs inside a DB transaction to avoid partial state.

## Add, update, remove API

Route: `src/app/api/cart/route.ts`

- `GET /api/cart` returns current cart summary for guest/auth context
- `POST /api/cart` adds by `productSlug` + optional `optionId` + optional `quantity`
- `PATCH /api/cart` updates `cartItemId` quantity
- `DELETE /api/cart` removes `cartItemId`

Mutation routes use trusted-origin CSRF checks via `assertTrustedRouteHandlerRequest()`.

## Variant and non-variant products

Catalog data is currently seed-backed. Cart mutations:

- resolve requested product from seed detail by slug
- resolve requested option when `optionId` is provided
- otherwise select first in-stock variant option or fallback default SKU for non-variant products
- upsert minimal category/product/variant/inventory records for referential integrity before cart item writes

This keeps cart flows functional before full catalog persistence is complete.

## Stock-aware validation

Stock is validated in two places:

- on mutations (add/update/merge), cart quantity cannot exceed available inventory
- before checkout via `validateCartStock()` helper and `GET /api/cart/validate`

`validateCartStock()` returns item-level issues (`requestedQuantity`, `availableQuantity`) and powers checkout gating on the cart page.

## UI surfaces

- PDP add-to-cart button now calls `POST /api/cart`
- Cart page (`/cart`) now renders real line items and order summary
- Header mini-cart shows count + quick preview + subtotal
- Cart loading/error routes are implemented with dedicated states

## Persistence behavior

- Guests: cart token cookie persists for 30 days
- Auth users: active cart persists by user id, with guest cart merged when appropriate

This satisfies the expected flow:

- guest can add items
- quantity updates work
- cart persists across navigation and returning sessions
