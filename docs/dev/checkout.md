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
- PDF invoice download route at `/api/orders/[orderNumber]/invoice`
- persisted `AuditLog` entries for order creation and lifecycle status changes
- order lifecycle helpers for `pending`, `confirmed`, `packed`, `shipped`, `delivered`, and `cancelled`

## Current assumptions

- payment methods include only COD right now
- invoice PDFs are generated on demand from the stored order snapshot rather than persisted as blobs
- guest order confirmation and invoice access use a per-order confirmation token in the order metadata

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

## Next expansion path

Prompt 4.4 should add:

- email and Telegram notifications triggered from order events
- notification failure isolation around the placement service
- template-ready email payload builders that can use the stored order snapshot
