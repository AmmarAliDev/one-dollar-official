# Search Architecture

## Goal

Provide a fast and simple storefront product search while keeping implementation easy to upgrade to dedicated search infrastructure.

## Current Flow (Command Dialog + Live DB-Backed Search)

Search no longer lives on a separate page. It is a shadcn command dialog (`CommandDialog`) mounted once and opened from the header on both desktop and mobile:

1. Client UI lives in `src/features/catalog/components/catalog-search-command-dialog.tsx` and is mounted in `src/app/(storefront)/layout.tsx` and `src/app/page.tsx` (the root homepage renders the header outside the `(storefront)` route group).
2. The dialog is opened from anywhere via the shared `search-dialog-state` store (`openSearchDialog` / `closeSearchDialog` / `useSearchDialogState` in `src/features/catalog/search-dialog-state.ts`), mirroring the cart-drawer state pattern. The header trigger lives in `src/features/catalog/components/search-dialog-trigger.tsx` (desktop labeled button + mobile icon-only button).
3. The previous `/search` page and `routes.storefront.search` route were removed; robots disallow rules for search-result URLs remain harmless.
4. The dialog uses `CommandDialog` with `shouldFilter={false}` because result ordering/relevance comes from the server — cmdk must not client-filter the live results.
5. Input updates are debounced (280ms) through a lightweight local hook before network requests.
6. Debounced queries call `GET /api/catalog/search` with `limit=8`.
7. API handler validates inputs with Zod and calls `searchCatalogProducts()`.
8. `searchCatalogProducts()` delegates to a search adapter seam via `getCatalogSearchAdapter()`.
9. The default `dbCatalogSearchAdapter` queries published products from PostgreSQL using a case-insensitive `ILIKE` match over `name`, `shortDescription`, and `description`.
10. Search result shaping aligns with catalog card media behavior: it resolves the first valid product image URL via the shared URL normalizer (accepting only root-relative and HTTP(S) URLs). When no valid image URL is available, results intentionally omit `imageUrl` so result rows fall back to a deterministic gradient placeholder.
11. Results carry `source: "db"` in the response so callers and tests can verify the active backend.
12. Recent searches are persisted locally in browser storage (`localStorage`), deduplicated case-insensitively, trimmed, and capped to a fixed list size. They are recorded on Enter submit and when a result is selected (not on every keystroke).
13. Recent searches UI supports replay (click to run), single-item removal, and clear-all while gracefully handling unavailable storage.
14. Popular searches are a curated static list in `src/features/catalog/popular-searches.ts`, shown as a quick-entry group on desktop only (CSS `hidden md:block`).

## Why This Is Upgrade-Ready

- Search contracts are centralized in `src/features/catalog/search-adapter.ts`.
- Route and UI layers depend on the stable `CatalogSearchResult` shape, not implementation details.
- Replacing search tech only requires swapping adapter internals while preserving:
  - API route contract (`query`, `limit` input; `items`, `total`, `source` output)
  - client-side UX states and rendering
  - feature-level service entrypoint (`searchCatalogProducts`)

## Planned Upgrade Path

### Step 1: Data indexing

- Index products in dedicated search storage (e.g., Postgres FTS, Meilisearch, or Algolia).
- Keep a background sync job from product writes to the search index.

### Step 2: Adapter replacement

- Replace seed adapter logic in `getCatalogSearchAdapter()` with a dedicated search adapter.
- Preserve response shape for backward compatibility with existing UI/tests.

### Step 3: Relevance & UX

- Add typo tolerance, synonym dictionaries, and language-aware tokenization.
- Add facets (price, category, availability) and ranking personalization.
- Replace the curated `POPULAR_SEARCHES` list with analytics-driven popular query suggestions.

## State Contract in UI (Dialog)

- Landing (query below `MIN_QUERY_LENGTH = 2`): the dialog shows the "Recent searches" group and the "Popular searches" group (desktop only). If no recent items exist, a "No recent searches yet." empty prompt is shown instead.
- Searching (query at or above the minimum): the landing groups hide and the dialog shows loading / results / empty / error states.
- Loading: shown for the initial request without existing results.
- Empty: shown when a valid query has zero matches (friendly copy, no raw errors).
- Error: shown when the API request fails; a retry button is available.
- Result row layout: product image on the left; product name with the price underneath on the right (image-less rows fall back to a gradient placeholder).
- Recent searches:
  - local-first persisted list for the active browser
  - trim + whitespace normalization before storage
  - case-insensitive deduplication with most-recent-first ordering
  - per-item removal and clear-all controls
  - user-safe fallback message when storage is unavailable
  - recorded on Enter submit and on result selection

## Category Listing Query-State Contract

While keyword search and category listing are separate flows, both rely on stable URL-driven state.

1. Category route render (`/categories/[slug]`) reads query values at request time and resolves listing results through `getCatalogCategoryListing()`.
2. `parseCatalogSearchParams()` is the single parser for min/max price, availability, rating, discount, sort, and pagination.
3. Filter/sort forms and infinite paging both build next URLs through `buildCategoryListingSearchParams()` / `buildCategoryListingHref()`.
4. Client listing components explicitly resync local state when a new listing payload arrives after navigation so URL changes immediately reflect in:
  - visible filter controls
  - rendered products
  - subsequent infinite-load requests
5. SEO-safe first render is preserved: page 1 is server-rendered from URL state before client continuation fetches additional pages.
