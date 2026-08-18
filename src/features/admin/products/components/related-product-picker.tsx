"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { Input } from "@/components/ui/input";

import type { AdminRelatedProductOption } from "../service";

type RelatedProductPickerProps = {
  selectedIds: string[];
  onChangeIds: (ids: string[]) => void;
  categoryId: string;
  disabled?: boolean;
  errorMessage?: string;
};

type RelatedProductsResponse = {
  products: AdminRelatedProductOption[];
};

const DEBOUNCE_MS = 300;
const DEFAULT_TAKE = 20;

export function RelatedProductPicker({
  selectedIds,
  onChangeIds,
  categoryId,
  disabled,
  errorMessage,
}: RelatedProductPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<AdminRelatedProductOption[]>([]);
  const [knownProducts, setKnownProducts] = useState<Record<string, AdminRelatedProductOption>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const normalizedQuery = searchQuery.trim();

    const runFetch = async () => {
      const params = new URLSearchParams();

      if (normalizedQuery) {
        params.set("q", normalizedQuery);
      }

      if (categoryId) {
        params.set("categoryId", categoryId);
      }

      params.set("take", `${DEFAULT_TAKE}`);

      selectedIdsRef.current.forEach((id) => {
        params.append("selectedIds", id);
      });

      try {
        const response = await fetch(`/api/admin/products/related-search?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Related products request failed.");
        }

        const data = (await response.json()) as RelatedProductsResponse;
        const products = Array.isArray(data.products) ? data.products : [];

        if (!cancelled) {
          setResults(products);
          setKnownProducts((previous) => {
            const next = { ...previous };
            products.forEach((product) => {
              next[product.id] = product;
            });
            return next;
          });
          setHasLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load related products. Please try again.");
          setResults([]);
          setHasLoaded(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    const timer = normalizedQuery ? setTimeout(runFetch, DEBOUNCE_MS) : undefined;
    if (!timer) {
      void runFetch();
    }

    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [searchQuery, categoryId]);

  const selectedOptions = useMemo(
    () =>
      selectedIds
        .map((id) => knownProducts[id])
        .filter((product): product is AdminRelatedProductOption => Boolean(product)),
    [selectedIds, knownProducts],
  );
  const resultOptions = useMemo(
    () => results.filter((product) => !selectedIds.includes(product.id)),
    [results, selectedIds],
  );

  const selectedIdsSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggleProduct = (product: AdminRelatedProductOption, checked: boolean) => {
    const nextValues = checked
      ? [...selectedIds, product.id]
      : selectedIds.filter((selectedId) => selectedId !== product.id);

    setKnownProducts((previous) => ({
      ...previous,
      [product.id]: product,
    }));
    onChangeIds(nextValues);
  };

  const isEmpty = !isLoading && hasLoaded && !error && selectedOptions.length === 0 && resultOptions.length === 0;

  return (
    <Field data-invalid={Boolean(errorMessage)}>
      <FieldContent className="gap-3">
        <Input
          type="search"
          aria-label="Search related products"
          placeholder="Search by title or slug..."
          value={searchQuery}
          disabled={disabled}
          onChange={(event) => setSearchQuery(event.target.value)}
        />

        {isLoading ? (
          <InlineSpinner label="Loading products..." />
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}

        {selectedOptions.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {selectedOptions.map((item) => {
              const checked = selectedIdsSet.has(item.id);

              return (
                <label key={item.id} className="flex gap-3 rounded-xl border p-3 text-sm">
                  <Checkbox
                    checked={checked}
                    disabled={disabled}
                    onCheckedChange={(value) => {
                      toggleProduct(item, value === true);
                    }}
                  />
                  <span>
                    <span className="block font-medium">{item.title}</span>
                    <span className="text-muted-foreground block text-xs">
                      /{item.slug}
                      {item.categoryName ? ` • ${item.categoryName}` : ""}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        ) : null}

        {resultOptions.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {resultOptions.map((item) => (
              <label key={item.id} className="flex gap-3 rounded-xl border p-3 text-sm">
                <Checkbox
                  checked={false}
                  disabled={disabled}
                  onCheckedChange={(value) => {
                    toggleProduct(item, value === true);
                  }}
                />
                <span>
                  <span className="block font-medium">{item.title}</span>
                  <span className="text-muted-foreground block text-xs">
                    /{item.slug}
                    {item.categoryName ? ` • ${item.categoryName}` : ""}
                  </span>
                </span>
              </label>
            ))}
          </div>
        ) : null}

        {isEmpty ? (
          <p className="text-sm text-muted-foreground">No products found.</p>
        ) : null}

        <FieldError
          {...(errorMessage ? { errors: [{ message: errorMessage }] } : {})}
        />
      </FieldContent>
    </Field>
  );
}
