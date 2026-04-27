# Referral + Loyalty + Wallet (Phase-2 Architecture Placeholder)

Purpose
- Define a safe extension seam for referral tracking, loyalty points, and wallet ledger without changing active checkout or order behavior.

Current implementation status
- Contracts and runtime input-parse helpers are added in `src/features/rewards/contracts.ts`.
- Public exports are available in `src/features/rewards/index.ts`.
- No route handlers or server actions are wired yet.
- No current business flow depends on these contracts.

Why this is safe now
- The contracts are standalone and have no side effects.
- Existing checkout and order modules do not import the new rewards feature.
- Runtime helpers normalize invalid payloads into user-safe contract errors.

Service contracts added
- `ReferralTrackingService`
  - `trackVisit(input)`
  - `trackConversion(input)`
  - `getSummary(referralCode)`
- `LoyaltyPointsService`
  - `award(input)`
  - `redeem(input)`
  - `getBalance(userId)`
  - `listTransactions(userId, paging)`
- `WalletLedgerService`
  - `appendEntry(input)`
  - `getBalance(walletId)`
  - `listEntries(walletId, paging)`

Error contract
- Shared result union: `RewardsServiceResult<T>`.
- Success shape: `{ ok: true, data }`.
- Failure shape: `{ ok: false, error }` with:
  - `code`
  - `message` (operator/debug context)
  - `userMessage` (safe customer/admin-facing text)
  - optional `cause`

Loading and empty-state guidance for future UI work
- Read methods return a `state` field (`ready` or `empty`) on paged/summary payloads.
- UI integration should:
  - show skeleton/loading before request resolve,
  - render dedicated empty-state copy when `state` is `empty`,
  - render action-safe error banners from `error.userMessage` when failures occur.

Data model extension plan (phase-2)
- Migration remains intentionally deferred in this step to avoid accidental runtime risk.
- Proposed Prisma models for future migration:
  1. `ReferralProgram`
    - `id`, `code` (unique), `ownerUserId?`, `status`, `createdAt`, `updatedAt`
  2. `ReferralVisit`
    - `id`, `referralProgramId`, `visitorSessionId`, `landingPath`, `campaign?`, `occurredAt`
    - indexes: `(referralProgramId, occurredAt)`, `(visitorSessionId)`
  3. `ReferralConversion`
    - `id`, `referralProgramId`, `orderId` (unique), `orderNumber`, `orderTotalMinor`, `occurredAt`
    - indexes: `(referralProgramId, occurredAt)`
  4. `LoyaltyAccount`
    - `id`, `userId` (unique), `pointsAvailable`, `pointsPending`, `tier?`, `updatedAt`
  5. `LoyaltyTransaction`
    - `id`, `loyaltyAccountId`, `points` (signed), `reason`, `reference`, `occurredAt`
    - indexes: `(loyaltyAccountId, occurredAt)`, `(reference)`
  6. `Wallet`
    - `id`, `userId`, `currency` (PKR), `availableMinor`, `holdMinor`, `updatedAt`
    - unique: `(userId, currency)`
  7. `WalletLedgerEntry`
    - `id`, `walletId`, `direction` (`credit`/`debit`), `amountMinor`, `source`, `reference`, `note?`, `occurredAt`
    - indexes: `(walletId, occurredAt)`, `(reference)`

Integration sequence (future)
1. Add Prisma migration and repository queries for the proposed models.
2. Implement concrete services behind these contracts in `src/features/rewards/service.ts`.
3. Add idempotency protections for referral conversion and wallet posting.
4. Attach event-driven writes from order lifecycle hooks only after payment/refund assumptions are finalized.
5. Add admin/account screens with explicit loading, empty, and safe error states.

Intentional deferments
- No points accrual rules are finalized yet.
- No referral attribution window/business policy is enforced yet.
- No wallet withdrawal/payout behavior is implemented yet.
