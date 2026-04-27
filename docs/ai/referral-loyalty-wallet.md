# AI Integration Notes — Referral, Loyalty, Wallet (Phase-2 Placeholder)

Scope implemented now
- Contract-only architecture placeholders live in `src/features/rewards/contracts.ts`.
- Runtime parse helpers normalize invalid payloads to user-safe failures.
- Unit tests for helper contracts live in `tests/features/rewards/contracts.test.ts`.
- No runtime wiring to checkout, cart, order, or payment flows is active.

How AI agents should use this seam
- Treat `src/features/rewards` as the only public seam for rewards-domain service contracts.
- Use `RewardsServiceResult<T>` as the standard response pattern.
- Prefer returning user-facing copy from `error.userMessage`; keep internals in `error.message`.

Contract modules
- Referral:
  - `ReferralTrackingService`
  - `parseReferralVisitInput()`
  - `parseReferralConversionInput()`
- Loyalty:
  - `LoyaltyPointsService`
  - `parseLoyaltyPointsMutationInput()`
- Wallet ledger:
  - `WalletLedgerService`
  - `parseWalletLedgerEntryInput()`

Integration boundaries
- Do not import rewards contracts into checkout/order paths until phase-2 service implementations are added.
- Keep referrals/loyalty/wallet writes behind explicit idempotent service methods.
- Keep point balances and wallet balances integer-only in minor currency units.

Deferred schema additions
- Prisma models are intentionally deferred in this step to avoid migration risk on active flows.
- Proposed model shapes are documented in `docs/dev/referral-loyalty-wallet.md`.

Future implementation expectations
- Add repositories in `src/server/db` for referral, loyalty, and wallet tables.
- Add concrete services in `src/features/rewards/service.ts`.
- Add lifecycle integrations from order/payment events only after business policy is finalized.
- Add loading/empty/error-aware UI surfaces for customer and admin in a dedicated phase.
