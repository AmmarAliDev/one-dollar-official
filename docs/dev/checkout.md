# Checkout And Orders (Prompts 4.2 and 4.3)

This document describes the one-page checkout flow and the transactional order lifecycle implemented in Phase 4.

## Scope implemented

- one-page checkout UI at `/checkout`
- guest and authenticated checkout supported
- Karachi-only shipping validation (client and server)
- fixed shipping fee of PKR 250
- payment method abstraction with COD implementation
- checkout API validation and retry-safe UX handling
- transactional order placement from checkout
- inventory deduction on successful order placement
- order item and address snapshots persisted in Prisma
- customer order confirmation page at `/checkout/confirmation/[orderNumber]`
- customer account order history at `/account/orders`
- customer account order detail page at `/account/orders/[orderNumber]`
- PDF invoice download route at `/api/orders/[orderNumber]/invoice`
- re-order action that rehydrates the active cart from a prior order with stock-aware adjustments
- persisted `AuditLog` entries for order creation and lifecycle status changes
- order lifecycle helpers for `pending`, `confirmed`, `packed`, `shipped`, `delivered`, and `cancelled`

## Current assumptions

- payment methods include only COD right now
- invoice PDFs are generated on demand from the stored order snapshot rather than persisted as blobs
- guest order confirmation and invoice access use a per-order confirmation token in the order metadata

### Confirmation Token Security

The "confirmation token" is stored in "order metadata" and protects guest order access:

**Token Generation & Storage:**
- Token must be generated using a cryptographically secure RNG (e.g., `randomBytes()`)
- Minimum entropy: ≥128 bits or 32+ URL-safe characters
- Store only SHA-256 hashed token with a strong salt in order metadata (never plaintext)
- Protect order metadata at rest (encrypted database) and in transit (HTTPS only)

**Token Expiration & Lifecycle:**
- Token expiration policy: 30 days after order creation, or configurable TTL
- Token invalidation: Tokens should be treated as single-use per confirmation link or set a limit on use count
- Token rotation: Issue a new token on successful confirmation; old token becomes invalid
- Revocation: Provide admin/customer action to revoke token (e.g., on account recovery, fraud suspected)

**Default Implementation Details:**
- Token stored in `Order.metadata.confirmationAccessToken` (hashed)
- Comparison: Hash incoming token from request and compare with stored hash (constant-time comparison)
- No user account required; token is the sole access control for guest orders

## Architecture

### Shared contracts

Checkout contracts are centralized under `src/features/checkout`:

- `validation.ts`: `checkoutPayloadSchema` (server and client safe parse)
- `service.ts`: totals and checkout attempt result shaping
- `payment.ts`: provider registry and payment method contract
- `constants.ts`: shipping fee, city restriction, payment method codes

### Payment abstraction

`payment.ts` defines a provider registry keyed by payment method code.

Current provider:

- `COD`: offline, enabled

Future providers (e.g., card gateways) should implement the same contract and be added to the registry without changing the checkout API or page form shape.

### Order placement flow

Order lifecycle logic lives under `src/features/orders`:

- `service.ts`: transactional order placement, access checks, and status updates
- `status.ts`: lifecycle transition helpers and presentation labels
- `invoice.ts`: order number strategy, invoice number strategy, confirmation/invoice URLs, and minimal PDF generation

Placement flow:

1. Validate trusted origin and checkout payload
2. Resolve active cart for guest or signed-in user
3. Re-check stock inside a serializable transaction
4. Atomically decrement inventory rows
5. Create order-address snapshots and order-item snapshots
6. Create the order with `PENDING` status
7. Mark the cart as `COMPLETED`
8. Persist `AuditLog` entry for order creation
9. Return confirmation and invoice URLs

### Status lifecycle

Supported transitions:

- `pending -> confirmed`
- `pending -> cancelled`
- `confirmed -> packed`
- `confirmed -> cancelled`
- `packed -> shipped`
- `packed -> cancelled`
- `shipped -> delivered`

`delivered` and `cancelled` are terminal states.

Note: `SHIPPED` orders cannot be directly cancelled via a status transition. Cancellations after shipment are handled through the returns/refunds process (create a return request, receive the item, then issue a refund); the lifecycle treats `SHIPPED` as irreversible in the transition table and only allows `SHIPPED -> DELIVERED`. The enforcement for allowed transitions lives in `src/features/orders/status.ts`.

## Karachi-only behavior

City is locked to Karachi in the UI and enforced server-side.

Validation behavior:

- if city is not Karachi, payload is rejected with user-safe error
- API returns friendly error messages through central error handlers

## Totals

Totals are calculated from cart subtotal with fixed shipping:

- subtotal: from active cart
- shipping: 250
- total: `subtotal + 250`

## Retry handling

The checkout form keeps the last payload on failed submit and exposes a "Retry last attempt" action. This gives users a direct recovery path for transient failures.

## API

Route: `POST /api/checkout`

Server flow:

1. Trusted-origin check
2. Payload validation with Zod
3. Resolve cart context (guest/auth)
4. Place order transactionally with stock protection and snapshot persistence
5. Return order number, totals, payment message, confirmation URL, and invoice URL

Invoice route: `GET /api/orders/[orderNumber]/invoice`

Access rules:

- signed-in customers can access their own orders without a token
- guest customers use the confirmation token returned after checkout

## Account order history and re-order

- `/account/orders` now renders a signed-in user's recent orders with status badges, totals, detail links, invoice links, and a re-order action.
- `/account/orders/[orderNumber]` provides customer-visible order detail (items, shipping address, payment summary) plus invoice download and re-order controls.
- Re-order behavior is stock aware:
	- unavailable products are reported as unavailable and skipped
	- out-of-stock products are skipped with clear feedback
	- partially available products are added with adjusted quantity and a clear adjustment message
	- successful lines are added into the customer's active cart (creating one if needed)

## Next expansion path

Prompt 4.4 should add:

- email and Telegram notifications triggered from order events
- notification failure isolation around the placement service
- template-ready email payload builders that can use the stored order snapshot
