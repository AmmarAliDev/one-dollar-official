# Task Status

## Current Milestone

**Phase 3 / Prompt 3.4 — Product detail page (PDP)**

## Completed

- [x] System-aware theme switching upgraded to explicit `system`, `light`, and `dark` selection
- [x] Global design tokens added for semantic colors, spacing, radii, and shadows in `src/app/globals.css`
- [x] Storefront shell polished with a reusable header, footer, and responsive navigation structure
- [x] Admin route group upgraded with a sidebar + topbar placeholder shell
- [x] Reusable UI state primitives added for page containers, section headers, empty/loading/error states, badges, prices, and skeletons
- [x] Shared frontend toast support added through `sonner`, `AppToaster`, and `notify.*()`
- [x] Page-level fallbacks now use `PageErrorFallback`, while reusable `SectionErrorState` and `FormErrorSummary` cover localized and form-specific failures
- [x] Loading infrastructure expanded with `InlineSpinner`, configurable `PageSkeleton`, `CardSkeleton`, and `TableSkeleton`
- [x] Empty-state messaging is more configurable, and `ConfirmationDialog` now provides one reusable abstraction for high-impact actions
- [x] `src/lib/errors/error-messages.ts` centralizes friendly user-safe copy, and `src/lib/logger.ts` redacts sensitive fields for client/server logging
- [x] Boundary pages and preview/auth placeholders now exercise the new UX reliability patterns
- [x] Smoke coverage now includes safe messaging, validation summaries, and log redaction behavior in `tests/smoke/ux-infrastructure.test.ts`
- [x] AI and developer docs updated with UX and error-handling conventions for future prompts
- [x] Prisma access moved behind `src/server/db` with a lazy singleton getter instead of a top-level client instantiation
- [x] Shared repository/service factories added so future modules can accept a root client or transaction executor consistently
- [x] Transaction helpers added for both always-new and reuse-if-present transaction patterns
- [x] Offset pagination helpers added with typed metadata and user-safe validation errors
- [x] Query result typing helpers added for explicit success/failure flows when throwing is not the best fit
- [x] Database access guidance documented for future feature prompts in developer and AI docs
- [x] Helper coverage added for pagination, query results, transactions, and Prisma singleton reuse
- [x] **Auth.js v5 (next-auth beta) configured** with JWT sessions + PrismaAdapter
- [x] **Email/password sign-in and sign-up** via Credentials provider + bcrypt (12 rounds)
- [x] **Google SSO** wired via Google OAuth provider (reads `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`)
- [x] **Sign-out** server action clears JWT session
- [x] **Prisma schema updated** with `User.password`, `User.emailVerified`, `User.image` (migration 20260411_auth)
- [x] **Zod validators** for sign-in, sign-up, and forgot-password (Zod v4 compatible)
- [x] **Rate-limit foundation** (in-memory sliding window; Redis-ready abstraction in `src/lib/rate-limit`)
- [x] **Session utilities** for server (`getSession`, `requireSession`, `getCurrentUserId`, `hasRole`, `hasPermission`) and client (`useSession`)
- [x] **Auth pages** at `/auth/sign-in`, `/auth/sign-up`, `/auth/error`, `/auth/forgot-password`
- [x] **JWT type augmentation** adds `id` and typed `role` to `Session.user` and `JWT`
- [x] **Typed RBAC model** added in `src/lib/auth/rbac.ts` with `super admin`, `product manager`, and `order manager` admin roles
- [x] **Permission helpers** now centralize `admin:access`, catalog, order, and user-read grants for future modules
- [x] **Route guards** added for server components and route handlers via `src/lib/auth/guards.ts`
- [x] **Admin route group** now blocks unauthenticated users and signed-in non-admin roles through `src/proxy.ts` + `(admin)/layout.tsx`
- [x] **Unauthorized and forbidden pages** added at `/unauthorized` and `/forbidden`
- [x] **Admin audit foundation** added in `src/lib/audit/admin-actions.ts` for future `AuditLog` persistence
- [x] **`AuthProvider`** (SessionProvider wrapper) added to root layout
- [x] **Input and Label** UI primitives added to `src/components/ui`
- [x] **5 new RBAC tests** cover non-admin blocking, valid admin-role access, forbidden API responses, audit payload generation, and forbidden-page rendering (54 total tests)
- [x] Verification re-confirmed with `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build`
- [x] Developer docs at `docs/dev/auth.md`
- [x] Global security headers added through `next.config.ts` + `src/config/security.ts`
- [x] CSRF / trusted-origin checks added for sensitive Server Actions through `src/lib/security/csrf.ts`
- [x] Redis-first rate-limit foundation added using `@upstash/redis` + `@upstash/ratelimit` with a safe in-memory fallback for local/test
- [x] Shared Zod validation conventions added in `src/lib/security/validation.ts`
- [x] Centralized safe error normalization/response helpers added in `src/lib/errors/handling.ts`
- [x] Security-focused developer guide added at `docs/dev/security.md`
- [x] Validation, rate-limit, and safe-error helper coverage expanded in Vitest
- [x] Storefront header now includes logo, search placeholder, account, wishlist, and cart links
- [x] Responsive mobile navigation added with accessible toggle semantics and shared nav config usage
- [x] Footer expanded with company links, policy links, and newsletter placeholder section
- [x] Storefront placeholder pages added for `/about`, `/contact`, `/privacy`, `/terms`, `/shipping-policy`, and `/return-policy`
- [x] Additional placeholder routes added for `/search`, `/account`, `/wishlist`, and `/cart` so primary header actions resolve cleanly
- [x] Route config and smoke coverage updated for storefront shell navigation requirements
- [x] AI and developer docs updated for Prompt 3.1 conventions
- [x] Homepage switched to a section-based renderer through `src/features/homepage` for CMS/admin-driven composition
- [x] Initial homepage sections added: hero banner, featured categories, featured products, deal spotlight, and blog highlights placeholder
- [x] Fallback homepage payload added so storefront renders when CMS content is missing or fully disabled
- [x] Server-side homepage service seam added in `src/features/homepage/service.ts` with CMS loading stub + resolver
- [x] Section contract documented in `docs/dev/homepage-section-contract.md`
- [x] Homepage section rendering coverage added in `tests/features/homepage/section-rendering.test.ts`
- [x] SEO-friendly category routes added at `/categories` and `/categories/[slug]`
- [x] Catalog listing module added in `src/features/catalog` with typed fallback data, filter parsing, sorting, and pagination helpers
- [x] Reusable product grid cards now show placeholder imagery, product title, price, compare price, stock badge, and review summary placeholder
- [x] Category listing pages now include loading, empty, sorting, filtering, and pagination states
- [x] Storefront navigation and homepage fallback links now point to category listing routes
- [x] Catalog-focused tests added for filter parsing, listing behavior, and storefront route coverage
- [x] Product detail routes added at `/categories/[slug]/[productSlug]` with static params and SEO metadata
- [x] PDP now includes a multi-image gallery, product info block (title, price, compare-at, stock, SKU, short description), and add-to-cart interaction stub
- [x] Variant selection UX added for variant-enabled products with dynamic price/SKU/stock state updates
- [x] Specifications and reviews sections added with seeded fallback detail data
- [x] Related products section added with same-category recommendations excluding the current product
- [x] PDP loading state added through `ProductDetailSkeleton`
- [x] Product cards now link directly to PDP routes
- [x] Catalog service now exposes product detail and related-product helpers
- [x] PDP service tests added for rendering prerequisites, variant availability data, and related-product behavior

## Deferred by design

- [ ] Email-based password reset (requires email provider — deferred to Prompt 4.4)
- [ ] Email verification for credentials accounts
- [ ] Nonce-based CSP hardening once all inline/script requirements are audited
- [ ] Dedicated CSRF token flow for any future embedded or cross-origin clients
- [ ] Live catalog persistence beyond the fallback listing dataset
- [ ] Admin CRUD workflows
- [ ] Server-side notifications and third-party integrations

## Recommended Next Prompt

Proceed with **Phase 3 / Prompt 3.5 — cart foundations and server-backed cart state**.
