# Email Marketing & Abandoned Cart

Architecture for email subscriber capture and abandoned cart detection.

---

## Overview

Two independent but complementary systems:

| System | Status | Purpose |
|---|---|---|
| **Email subscriber capture** | Implemented | Record and manage opt-in subscribers |
| **Campaign provider abstraction** | Stub (live provider deferred) | Sync subscribers to Mailchimp / Brevo / etc. |
| **Abandoned cart events** | Implemented | Append-only event log for recovery pipeline |
| **Recovery email / cron job** | **Deferred** | Background job that reads events and sends recovery emails |

---

## Email Subscriber Capture

### Data model

`EmailSubscriber` — `src/prisma/schema.prisma`

| Field | Notes |
|---|---|
| `email` | Normalised to lowercase. Unique. |
| `source` | Capture origin slug: `"checkout"`, `"newsletter_popup"`, `"account_signup"`, `"order_completion"`. Plain string — no enum so new sources never require a migration. |
| `status` | `PENDING` → `ACTIVE` → `UNSUBSCRIBED` / `BOUNCED`. New rows land as `PENDING`. |
| `tags` | String array for segmentation (`["newsletter", "restock_alerts"]`). |
| `unsubscribeToken` | Opaque random token. **Always use this in unsubscribe links — never embed the email address in a URL.** |
| `providerMeta` | JSON blob populated after a provider sync (e.g. Mailchimp member ID). |

### Double opt-in (deferred)

New subscribers are created as `PENDING`. A confirmation email is **not yet sent**.
When double opt-in is added:
1. Create `GET /api/email/confirm?token=<confirmToken>`.
2. Set `status = ACTIVE`, `confirmedAt = now()`.
3. Send confirmation via `NotificationService` or a dedicated template.

### API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/email/subscribe` | POST | Capture subscriber. Rate-limited 5/10 min per IP. |
| `/api/email/unsubscribe` | GET | One-click unsubscribe from email footer link. |
| `/api/email/unsubscribe` | POST | Programmatic unsubscribe (preferences page, RFC 8058). |

### Feature module

`src/features/email-marketing/`

```
email-marketing/
  types.ts          — Domain types (EmailSubscriber, SubscribeInput, etc.)
  validation.ts     — Zod schemas for subscribe / unsubscribe input
  repository.ts     — DB access layer (upsert, findByEmail, unsubscribeByToken)
  service.ts        — Business logic (subscribeEmail, unsubscribeByToken)
  provider.ts       — EmailCampaignProvider interface contract
  providers/
    stub.ts         — No-op provider (logs only, safe for all environments)
    index.ts        — Singleton factory; returns stub or live provider
  index.ts          — Public barrel export
```

### Adding a live campaign provider

1. Add env vars to `src/config/env.ts` (e.g. `MAILCHIMP_API_KEY`, `MAILCHIMP_LIST_ID`).
2. Implement `EmailCampaignProvider` in `src/features/email-marketing/providers/<name>.ts`.
3. Update `providers/index.ts` to detect the env vars and return your adapter.
4. Populate `EmailSubscriber.providerMeta` with the returned `providerId` / `meta`.

---

## Abandoned Cart Tracking

### Data model additions

**`Cart` model** — new fields:

| Field | Purpose |
|---|---|
| `abandonedAt` | Set when the cart transitions to `ABANDONED` status |
| `recoveryToken` | Unique opaque token for recovery deep links (`/cart?recover=<token>`) |
| `recoveryEmailSentAt` | Timestamp of last sent recovery email |

**`AbandonedCartEvent`** — append-only event log:

| Field | Notes |
|---|---|
| `cartId` / `cartToken` | Cart reference — kept even after cart is archived |
| `userId` / `email` | Available for the recovery email job |
| `eventType` | `CART_CREATED`, `CART_UPDATED`, `REMINDER_QUEUED`, `REMINDER_SENT`, `CART_RECOVERED`, `CART_EXPIRED` |
| `metadata` | JSON snapshot: `{ itemCount, subtotalPaisa, firstProductName }` |

### Event helpers

`src/features/cart/abandoned-cart-events.ts`

| Function | When to call |
|---|---|
| `recordCartActivity(input)` | After any cart mutation (add / update / remove item). Pass `isFirstItem: true` for the first add. |
| `markCartAbandoned(cartId, token)` | From the background recovery job when the abandonment window passes. |
| `markCartRecovered(cartId, token, userId?, email?)` | From checkout service after successful order placement. |
| `generateCartRecoveryToken(cartId)` | From the background job before sending the recovery email. |

All helpers are **non-fatal**: errors are logged but never propagated so they cannot break cart or checkout operations.

### Recovery pipeline (deferred)

The background job that sends recovery emails is **not yet implemented**. When built:

1. Query `AbandonedCartEvent` for `CART_CREATED` / `CART_UPDATED` events with no subsequent `CART_RECOVERED` or `CART_EXPIRED` event beyond the abandonment window (e.g. 1 hour).
2. Call `generateCartRecoveryToken(cartId)` to mint the deep link token.
3. Send a recovery email using `NotificationService` or a dedicated template.
4. Record a `REMINDER_QUEUED` then `REMINDER_SENT` event.
5. If the customer completes checkout, `markCartRecovered()` is called and emits `CART_RECOVERED`.

---

## PII utilities

`src/lib/security/pii.ts`

| Function | Purpose |
|---|---|
| `maskEmail(email)` | `"user@example.com"` → `"u***@example.com"` for safe logging. |
| `stripControlChars(value)` | Removes C0/C1 control characters to prevent log injection. |

Use these helpers whenever email addresses appear in log output.

---

## Tests

| File | Coverage |
|---|---|
| `tests/features/email-marketing/validation.test.ts` | Zod schema validation edge cases |
| `tests/features/email-marketing/service.test.ts` | Subscribe / unsubscribe business logic |
| `tests/features/cart/abandoned-cart-events.test.ts` | CART_CREATED, CART_UPDATED, CART_EXPIRED, CART_RECOVERED events |
| `tests/lib/security/pii.test.ts` | maskEmail, stripControlChars |
