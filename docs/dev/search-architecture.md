# Search Architecture

## Goal

Provide a fast and simple storefront product search while keeping implementation easy to upgrade to dedicated search infrastructure.

## Current Flow (Live DB-Backed Search)

1. Client UI lives in `src/features/catalog/components/catalog-search-experience.tsx`.
2. Input updates are debounced (280ms) through a lightweight local hook before network requests.
3. Debounced queries call `GET /api/catalog/search`.
4. API handler validates inputs with Zod and calls `searchCatalogProducts()`.
5. `searchCatalogProducts()` delegates to a search adapter seam via `getCatalogSearchAdapter()`.
6. The default `dbCatalogSearchAdapter` queries published products from PostgreSQL using a case-insensitive `ILIKE` match over `name`, `shortDescription`, and `description`.
7. Search result shaping now aligns with catalog card media behavior: it resolves the first valid product image URL via the shared URL normalizer (accepting only root-relative and HTTP(S) URLs).
8. When no valid image URL is available, results intentionally omit `imageUrl` so card rendering falls back to the existing gradient placeholder mode.
9. Results carry `source: "db"` in the response so callers and tests can verify the active backend.
10. Recent searches are persisted locally in browser storage (`localStorage`) from successful debounced queries and optional Enter-key submit, deduplicated case-insensitively, trimmed, and capped to a fixed list size.
11. Recent searches UI supports replay (click to run), single-item removal, and clear-all while gracefully handling unavailable storage.

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
- Add popular query suggestions.

## State Contract in UI

- Pre-search: while the query is below the minimum length (`MIN_QUERY_LENGTH = 2`), no empty-state prompt is rendered — the recent-searches panel is the default landing view until a search is submitted.
- Loading: shown for initial request without existing results.
- Empty: shown when a valid query has zero matches.
- Error: shown when API request fails; retry remains available.
- Recent searches:
  - local-first persisted list for the active browser
  - trim + whitespace normalization before storage
  - case-insensitive deduplication with most-recent-first ordering
  - per-item removal and clear-all controls
  - user-safe fallback message when storage is unavailable

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
