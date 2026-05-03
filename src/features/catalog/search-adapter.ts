import { routes } from "@/config/routes";

import { searchPublishedProducts } from "@/server/db/catalog-queries";
import { normalizeCatalogImageUrl } from "./lib/product-image-url";
import type { CatalogProductCard } from "./types";

export type CatalogSearchRequest = {
  query: string;
  limit?: number;
};

export type CatalogSearchResult = {
  query: string;
  total: number;
  items: CatalogProductCard[];
  source: "db" | "seed" | "external";
};

export interface CatalogSearchAdapter {
  searchProducts(request: CatalogSearchRequest): Promise<CatalogSearchResult>;
}

// ---------------------------------------------------------------------------
// DB-backed adapter (default for production)
// ---------------------------------------------------------------------------

/**
 * Searches PUBLISHED products in the database using a case-insensitive
 * keyword match over name, shortDescription, and description.
 *
 * Results are ordered by createdAt DESC (newest first).
 * For a dedicated search engine (Algolia, Typesense), replace this adapter
 * by returning a different implementation from getCatalogSearchAdapter().
 */
const dbCatalogSearchAdapter: CatalogSearchAdapter = {
  async searchProducts({ query, limit = 12 }) {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return {
        query: normalizedQuery,
        total: 0,
        items: [],
        source: "db",
      };
    }

    // Fetch up to `limit` matches; the query layer applies the ILIKE filter.
    const records = await searchPublishedProducts(normalizedQuery, limit);

    const items: CatalogProductCard[] = records.map((record) => {
      const categorySlug = record.category?.slug ?? "";
      const defaultVariant =
        record.variants.find((v) => v.isDefault) ?? record.variants[0] ?? null;
      const price = defaultVariant?.price ?? 0;
      const compareAtRaw = defaultVariant?.compareAtPrice ?? null;
      const compareAt =
        typeof compareAtRaw === "number" && compareAtRaw > price
          ? compareAtRaw
          : undefined;
      const reviewRatings = record.reviews;
      const reviewCount = reviewRatings.length;
      const averageRating =
        reviewCount > 0
          ? Number(
              (
                reviewRatings.reduce((sum, r) => sum + r.rating, 0) / reviewCount
              ).toFixed(1),
            )
          : 0;
      const inventoryQuantity = record.variants.reduce(
        (total, v) => total + (v.inventory?.quantity ?? 0),
        0,
      );
      const primaryImage = record.images[0];
      const normalizedImageUrl = record.images
        .map((image) => normalizeCatalogImageUrl(image.url))
        .find((imageUrl): imageUrl is string => typeof imageUrl === "string");
      const imageLabel = primaryImage?.alt?.trim() || record.name;

      return {
        id: record.id,
        slug: record.slug,
        name: record.name,
        description: record.shortDescription ?? record.description ?? "",
        categorySlug,
        price,
        ...(compareAt !== undefined ? { compareAt } : {}),
        inventoryQuantity,
        averageRating,
        reviewCount,
        ...(normalizedImageUrl ? { imageUrl: normalizedImageUrl } : {}),
        imageLabel,
        imageTone: "slate",
        attributeSummary: record.specifications.slice(0, 2).map((s) => s.value),
        href: routes.storefront.product(categorySlug, record.slug),
      };
    });

    return {
      query: normalizedQuery,
      total: items.length,
      items,
      source: "db",
    };
  },
};

// ---------------------------------------------------------------------------
// Adapter factory — replace this return value to swap search backends.
// ---------------------------------------------------------------------------

/**
 * Returns the active catalog search adapter.
 *
 * Default: DB-backed adapter using Prisma full-text-like search.
 * Future: swap for an Algolia/Typesense adapter without changing call sites.
 */
export function getCatalogSearchAdapter(): CatalogSearchAdapter {
  return dbCatalogSearchAdapter;
}
