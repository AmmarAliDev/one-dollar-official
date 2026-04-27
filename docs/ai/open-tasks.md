# Open Tasks

## Purpose

This is the prioritized backlog for future AI-assisted implementation. Items are grouped by readiness and impact.

## Next Recommended Implementation

1. Inventory history filters and adjustment reason taxonomy.
2. Activity feed filtering and cursor-driven pagination UI.
3. Revenue reporting enhancements (custom ranges, charting, export).

## Near-Term Product and Platform Work

1. Online payment provider implementation (first provider integration under existing checkout payment contract).
2. Payment webhook route and transaction persistence model rollout.
3. Email marketing double opt-in confirmation flow.
4. Abandoned cart recovery worker and reminder delivery flow.
5. Recovery email template with cart deep link semantics.
6. Optional AI-provider adapter for admin product SEO helper personalization (current generator is deterministic by design).

## Security and Reliability Hardening

1. Nonce-based CSP hardening after inline/script audit.
2. Additional review anti-abuse protections (semantic/velocity heuristics).
3. Password reset/email deliverability hardening (SPF/DKIM/DMARC and suppression strategy).

## Product Expansion (Deferred by Design)

1. Advanced inventory operations: batch imports, transfer workflows, approval/rollback flows.
2. Advanced admin settings: tax policies, payment controls, multi-warehouse shipping matrix, role-scoped notification policy automation.
3. Locale-aware storefront expansion (including Urdu blog route strategy).
4. Live campaign provider adapter (Mailchimp/Brevo/Klaviyo).

## Rules for Adding New Open Tasks

1. Add the task here with clear scope and sequencing.
2. Note whether a seam already exists or a new seam is needed.
3. If intentionally deferred, explain why and what is blocked.
4. Keep wording implementation-specific and testable.