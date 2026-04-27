# Implemented Features

## How to Use This File

Use this as the quick implementation map for future AI prompts. Each section describes what is active in production-minded form today.

## Storefront and Catalog

- Homepage with section-based rendering and admin-manageable content resolution
- Category listing routes and product detail routes with SEO metadata support
- Database-backed catalog visibility rules (published categories/products only; approved reviews only)
- Storefront search with API transport seam and adapter-ready backend integration point
- Wishlist add/remove and authenticated wishlist page

## Cart, Checkout, and Orders

- Guest cart token persistence with guest-to-auth merge
- Live cart operations and stock validation endpoints
- Checkout flow with Karachi-only shipping validation and fixed shipping fee calculations
- COD payment provider active through pluggable checkout payment contract
- Transactional order placement with stock revalidation, snapshots, and audit logging
- Account order history/detail views, invoice route, and stock-aware reorder flow

## Auth, Access, and Security

- Auth.js credentials + Google auth
- Email verification flow and password reset flow
- RBAC for admin roles with route and layout guards
- Trusted-origin and CSRF protections for sensitive mutations
- Rate-limiting foundation with Redis-first and safe local fallback
- Safe error normalization and user-safe messaging conventions

## Admin Operations

- Dashboard metrics from live database (pending orders, recognized revenue, low stock, recent activity)
- AuditLog-based activity feed with actor and model context
- Revenue summary page with explicit inclusion assumptions
- Category and product admin CRUD with SEO controls and ISR revalidation
- Product admin SEO content helper (deterministic generation for title suggestions, SEO title/description, short description, highlights, FAQ ideas, schema-oriented specs, internal linking suggestions, and slug)
- Blog admin CRUD with publish scheduling and SEO fields
- Homepage admin controls for sections, banners, campaigns, and announcements
- Inventory monitoring plus inline manual stock adjustment with concurrency checks and audit events
- Admin review moderation with status workflow and storefront visibility control
- Admin settings workspace persisted via singleton settings record

## Content and Marketing

- Blog listing/detail pages from Prisma-backed content
- Structured data output for blog listing and detail pages
- Contact form persistence with non-blocking email/Telegram admin notifications
- Email subscriber lifecycle foundation and unsubscribe flows
- Abandoned cart event log foundation for future recovery automation

## Shared Foundations

- Shared UI primitives and fallback states
- Shared form system (React Hook Form + Zod + server-action bridge)
- Shared data-table foundation used by multiple admin pages
- Shared server/db repository and transaction utilities
- Deployment, operations, and release documentation foundation

## Intentionally Deferred (Implemented Seams Exist)

- Online payment gateways and payment webhooks (abstraction already in place)
- Rewards phase-2 integration (contract-first seam present, no live wiring)
- Advanced analytics/reporting UX beyond current operational summaries