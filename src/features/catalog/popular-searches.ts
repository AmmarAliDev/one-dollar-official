/**
 * Curated "popular searches" shown as quick-entry suggestions inside the
 * storefront search command dialog (desktop only).
 *
 * These are intentionally static for now so the list stays predictable and
 * cheap to render. The module is a single seam: a future analytics-driven or
 * server-backed "popular queries" source can replace `POPULAR_SEARCHES` without
 * touching the dialog component.
 *
 * Terms are chosen to match current catalog topics (tumblers, home living,
 * personal care, cosmetics, gadgets, storage, etc.).
 */
export const POPULAR_SEARCHES: readonly string[] = [
  "Tumbler",
  "Cushion Cover",
  "Bath Towel",
  "Lip Tint",
  "Phone Stand",
  "Storage Box",
  "Scented Candle",
  "Makeup Brush",
] as const;

/** Maximum number of popular terms rendered in the dialog. */
export const POPULAR_SEARCHES_MAX_ITEMS = 8;
