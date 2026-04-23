# Performance Decisions

This document records production-oriented performance decisions made for the storefront and supporting APIs.

## Goals

- Fast initial loading and navigation
- Lower baseline client JavaScript
- Scalable rendering defaults
- Core Web Vitals-friendly image and cache behavior

## Rendering Strategy

### Keep catalog routes cacheable by default

- Category index, category listing, and product detail routes now export `revalidate = 900`.
- This keeps public catalog routes cache-friendly while still refreshing content regularly.

Why:

- Catalog traffic is read-heavy and does not need per-request rendering.
- Time-based revalidation reduces server work and improves TTFB consistency.

### Avoid request-time auth in public product pages

- Product detail route no longer calls server `auth()` during render.
- Wishlist auth is handled at interaction time through the wishlist API.

Why:

- Request-time auth marks the route dynamic and blocks static/cache benefits.
- Deferring auth checks to mutation endpoints preserves correctness while reducing render cost.

## Client JavaScript Reduction

### Removed global SessionProvider wrapper from root layout

- Root layout no longer wraps all routes in `SessionProvider`.

Why:

- Only a narrow storefront interaction surface needed session state.
- Removing global provider reduces shared client runtime/hydration overhead for routes that do not require it.

## Image Handling

### Enabled modern image output formats globally

- `next.config.ts` now enables AVIF/WebP output formats and a minimum image cache TTL.

### Added responsive `sizes` hints

- Blog listing cards and blog hero image now provide explicit `sizes`.
- Blog hero image quality is set to a balanced value to reduce bytes without visible quality loss.

Why:

- Better `sizes` guidance prevents over-downloading large images on small viewports.
- Modern formats and caching improve transfer size and repeat-view performance.

## API Caching

### Cached idempotent catalog search responses at the CDN layer

- `/api/catalog/search` now returns:
  - `Cache-Control: public, s-maxage=60, stale-while-revalidate=600`

Why:

- Search requests are often repeated for similar terms.
- Short edge cache lifetime cuts response latency and origin load while preserving freshness.

## Pagination and Navigation Behavior

### Reduced speculative prefetch work on pagination controls

- Catalog pagination links now disable automatic prefetch.
- Pagination links include semantic `rel="prev"` and `rel="next"`.

Why:

- For filtered listings, prefetching adjacent pages can add avoidable bandwidth and server work.
- Explicit relation hints improve crawler and browser understanding of paginated navigation.

## Deployment Safety

### Force Prisma client generation before build

- Added `prebuild` script: `pnpm prisma:generate`.

Why:

- Prevents CI/CD type drift where generated Prisma types lag behind schema changes.
- Fixes Vercel type-check failures caused by stale generated client definitions.

## Test and Verification Expectations

- Unit tests validate updated wishlist auth interaction behavior.
- Full regression checks:
  - `pnpm test`
  - `pnpm build`
