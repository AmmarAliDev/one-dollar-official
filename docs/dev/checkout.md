# Checkout Foundation (Prompt 4.2)

This document describes the one-page checkout foundation added in Phase 4 / Prompt 4.2.

## Scope implemented

- one-page checkout UI at `/checkout`
- guest and authenticated checkout supported
- Karachi-only shipping validation (client and server)
- fixed shipping fee of PKR 250
- payment method abstraction with COD implementation
- checkout API validation and retry-safe UX handling

## Current assumptions

- checkout currently validates and confirms payload, but does not create orders yet
- order creation, status lifecycle, stock deduction, and invoice generation are deferred to Prompt 4.3
- payment methods include only COD right now

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
4. Validate cart exists, IDs match, and stock is still valid
5. Build checkout attempt result using selected payment provider
6. Return totals and payment confirmation message

## Next expansion path

Prompt 4.3 should add:

- transactional order creation from validated checkout payload
- order number generation and status lifecycle
- stock reduction and order/address snapshots
- payment transaction persistence hooks behind the same payment abstraction
