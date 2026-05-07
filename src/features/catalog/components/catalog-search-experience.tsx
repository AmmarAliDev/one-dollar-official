"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Clock3, SearchX, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionErrorState } from "@/components/ui/section-error-state";
import type { CatalogProductCard, CatalogSearchResponse } from "@/features/catalog/types";

import { CatalogSearchInput } from "./catalog-search-input";
import { ProductGridCard } from "./product-grid-card";

const DEBOUNCE_DELAY_MS = 280;
const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 12;

function useDebouncedValue(value: string, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [delayMs, value]);

  return debouncedValue;
}

const RECENT_SEARCHES_PLACEHOLDER = ["detergent", "rice", "face wash"];

export function CatalogSearchExperience() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogProductCard[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resolvedQuery, setResolvedQuery] = useState("");
  const [retryNonce, setRetryNonce] = useState(0);
  const activeRequest = useRef<AbortController | null>(null);

  const debouncedQuery = useDebouncedValue(query.trim(), DEBOUNCE_DELAY_MS);

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      activeRequest.current?.abort();
      setIsFetching(false);
      setResults([]);
      setResolvedQuery("");
      setErrorMessage(null);
      return;
    }

    const controller = new AbortController();
    activeRequest.current?.abort();
    activeRequest.current = controller;
    setIsFetching(true);
    setErrorMessage(null);

    const loadResults = async () => {
      try {
        const response = await fetch(
          `/api/catalog/search?query=${encodeURIComponent(debouncedQuery)}&limit=${MAX_RESULTS}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Search request failed");
        }

        const payload = (await response.json()) as CatalogSearchResponse;

        setResults(payload.items);
        setResolvedQuery(debouncedQuery);
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        setErrorMessage("Search is temporarily unavailable. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setIsFetching(false);
        }
      }
    };

    void loadResults();

    return () => {
      controller.abort();
    };
  }, [debouncedQuery, retryNonce]);

  const canSearch = query.trim().length >= MIN_QUERY_LENGTH;
  const showLoading = isFetching && results.length === 0;
  const showError = Boolean(errorMessage);
  const showEmpty = !isFetching && !showError && canSearch && results.length === 0;
  const showResults = results.length > 0;

  return (
    <div className="space-y-6">
      <CatalogSearchInput value={query} onChange={setQuery} isLoading={isFetching} />

      <div className="border-border/70 bg-muted/20 space-y-3 rounded-xl border p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock3 className="text-muted-foreground size-4" aria-hidden="true" />
          Recent searches
          <span className="text-muted-foreground text-xs">(coming soon)</span>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Recent searches placeholder">
          {RECENT_SEARCHES_PLACEHOLDER.map((term) => (
            <button
              key={term}
              type="button"
              disabled
              className="border-border text-muted-foreground rounded-full border px-3 py-1 text-xs"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {!canSearch ? (
        <EmptyState
          icon={Sparkles}
          title="Start typing to search"
          description="Type at least two characters to quickly find products by name, category, and keyword."
        />
      ) : null}

      {showLoading ? (
        <LoadingState
          title="Searching products"
          description="We are finding matching items for you."
        />
      ) : null}

      {showError ? (
        <SectionErrorState
          title="Search unavailable"
          description={errorMessage ?? "We could not load search results."}
          retryLabel="Retry"
          onRetry={() => {
            setRetryNonce((current) => current + 1);
          }}
        />
      ) : null}

      {showEmpty ? (
        <EmptyState
          icon={SearchX}
          title="No products found"
          description={`No products matched "${resolvedQuery}". Try a broader keyword or fewer words.`}
        />
      ) : null}

      {showResults ? (
        <div className="space-y-4" aria-live="polite">
          <p className="text-muted-foreground text-sm">
            Found {results.length} result{results.length === 1 ? "" : "s"} for <q>{resolvedQuery}</q>.
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.map((product, index) => (
              <ProductGridCard key={product.id} product={product} eagerImage={index === 0} />
            ))}
          </div>
        </div>
      ) : null}

      {showError && !showResults ? (
        <p className="text-muted-foreground flex items-center gap-2 text-xs">
          <AlertTriangle className="size-3.5" aria-hidden="true" />
          Results are hidden until the next successful search.
        </p>
      ) : null}
    </div>
  );
}
