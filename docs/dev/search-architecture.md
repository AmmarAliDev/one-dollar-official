# Search Architecture

## Goal

Provide a fast and simple storefront product search while keeping implementation easy to upgrade to dedicated search infrastructure.

## Current Flow (Phase 3 Foundation)

1. Client UI lives in `src/features/catalog/components/catalog-search-experience.tsx`.
2. Input updates are debounced (280ms) through a lightweight local hook before network requests.
3. Debounced queries call `GET /api/catalog/search`.
4. API handler validates inputs with Zod and calls `searchCatalogProducts()`.
5. `searchCatalogProducts()` delegates to a search adapter seam via `getCatalogSearchAdapter()`.
6. The default adapter uses seeded catalog data and score-based matching for now.

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
- Add persisted recent searches and popular query suggestions.

## State Contract in UI

- Loading: shown for initial request without existing results.
- Empty: shown when a valid query has zero matches.
- Error: shown when API request fails; retry remains available.
- Recent searches: placeholder section exists to reserve space for future persistence.
