/**
 * Storefront catalog Prisma query layer.
 *
 * All queries enforce publish-state visibility rules:
 *   - Only PUBLISHED categories are returned
 *   - Only PUBLISHED products belonging to PUBLISHED categories are returned
 *   - Only APPROVED reviews are returned on the product detail
 *
 * Consumed by:
 *   - src/features/catalog/service.ts   — listing, detail, and related products
 *   - src/features/catalog/search-adapter.ts — DB-backed keyword search
 */

import type { Prisma } from "@prisma/client";

import { getPrismaClient } from "@/server/db";

// ---------------------------------------------------------------------------
// Shared product field selection
// ---------------------------------------------------------------------------

/**
 * Standard fields fetched for any published product.
 * Used in listings, related-products queries, and the detail page.
 */
const storefrontProductSelect = {
  id: true,
  name: true,
  slug: true,
  shortDescription: true,
  description: true,
  masterSku: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  images: {
    orderBy: { position: "asc" as const },
    select: {
      id: true,
      url: true,
      alt: true,
      position: true,
    },
  },
  specifications: {
    orderBy: { position: "asc" as const },
    select: {
      id: true,
      key: true,
      value: true,
    },
  },
  variants: {
    orderBy: [{ isDefault: "desc" as const }, { createdAt: "asc" as const }],
    select: {
      id: true,
      title: true,
      sku: true,
      options: true,
      price: true,
      compareAtPrice: true,
      isDefault: true,
      inventory: {
        select: {
          quantity: true,
        },
      },
    },
  },
  // Include APPROVED review ratings for computing averageRating / reviewCount
  // on the listing cards. Only fetch rating to keep payloads small.
  reviews: {
    where: { status: "APPROVED" as const },
    select: {
      rating: true,
    },
  },
} satisfies Prisma.ProductSelect;

/** Inferred type for a product row returned by storefrontProductSelect. */
export type StorefrontProductRecord = Prisma.ProductGetPayload<{
  select: typeof storefrontProductSelect;
}>;

// ---------------------------------------------------------------------------
// Category queries
// ---------------------------------------------------------------------------

/**
 * Returns all PUBLISHED categories, ordered by name.
 * The `productCount` field reflects the count of PUBLISHED products only.
 */
export async function listPublishedCategories() {
  const db = getPrismaClient();
  return db.category.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      cardImageUrl: true,
      seoTitle: true,
      seoDescription: true,
      _count: {
        select: {
          products: {
            where: { status: "PUBLISHED" },
          },
        },
      },
    },
  });
}

/** Inferred record type for a category row from listPublishedCategories. */
export type StorefrontCategoryRecord = Awaited<
  ReturnType<typeof listPublishedCategories>
>[number];

/**
 * Returns a single PUBLISHED category by slug.
 * Returns `null` if the category does not exist or is not published.
 */
export async function getPublishedCategoryBySlug(slug: string) {
  const db = getPrismaClient();
  return db.category.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      cardImageUrl: true,
      seoTitle: true,
      seoDescription: true,
      _count: {
        select: {
          products: {
            where: { status: "PUBLISHED" },
          },
        },
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Product listing and detail queries
// ---------------------------------------------------------------------------

/**
 * Returns all PUBLISHED products within a PUBLISHED category identified by slug.
 * Ordered by `createdAt DESC` (newest first) as the base for client-side sort.
 *
 * Filtering (price, availability, ratings, discount) and final sort/pagination
 * are applied in the service layer after this fetch.
 */
export async function listPublishedProductsByCategory(categorySlug: string) {
  const db = getPrismaClient();
  return db.product.findMany({
    where: {
      status: "PUBLISHED",
      category: { slug: categorySlug, status: "PUBLISHED" },
    },
    orderBy: { createdAt: "desc" },
    select: storefrontProductSelect,
  });
}

/**
 * Returns all PUBLISHED products whose category is also PUBLISHED.
 * Ordered by `createdAt DESC` (newest first).
 *
 * Used by virtual/system storefront collections that derive membership
 * from product attributes instead of direct category relations.
 */
export async function listAllPublishedProducts() {
  const db = getPrismaClient();
  return db.product.findMany({
    where: {
      status: "PUBLISHED",
      category: { status: "PUBLISHED" },
    },
    orderBy: { createdAt: "desc" },
    select: storefrontProductSelect,
  });
}

/**
 * Returns the full detail record for a single PUBLISHED product identified by slug.
 * Includes APPROVED review body text (for PDP review section).
 *
 * Returns `null` if the product does not exist, is not published, or belongs
 * to a category that is not published.
 */
export async function getPublishedProductBySlug(slug: string) {
  const db = getPrismaClient();
  return db.product.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      category: { status: "PUBLISHED" },
    },
    select: {
      ...storefrontProductSelect,
      // For the detail page, also fetch full review text (APPROVED only)
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rating: true,
          title: true,
          body: true,
          status: true,
          createdAt: true,
          user: {
            select: { name: true },
          },
        },
      },
    },
  });
}

/** Inferred type for the product detail record. */
export type StorefrontProductDetailRecord = Awaited<
  ReturnType<typeof getPublishedProductBySlug>
>;

/**
 * Returns up to `limit` PUBLISHED products in a category (by category slug),
 * excluding the product with the given slug.
 * Used for "Related Products" on PDP.
 */
export async function getRelatedPublishedProducts(
  categorySlug: string,
  excludeProductSlug: string,
  limit: number = 4,
) {
  const db = getPrismaClient();
  return db.product.findMany({
    where: {
      status: "PUBLISHED",
      category: { slug: categorySlug, status: "PUBLISHED" },
      slug: { not: excludeProductSlug },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    select: storefrontProductSelect,
  });
}

/**
 * Returns PUBLISHED products by explicit product IDs, preserving publish
 * visibility constraints (product + category must both be PUBLISHED).
 *
 * Callers are responsible for ordering results to match input IDs.
 */
export async function listPublishedProductsByIds(productIds: string[]) {
  if (productIds.length === 0) {
    return [];
  }

  const db = getPrismaClient();
  return db.product.findMany({
    where: {
      id: {
        in: productIds,
      },
      status: "PUBLISHED",
      category: {
        status: "PUBLISHED",
      },
    },
    select: storefrontProductSelect,
  });
}

/**
 * Returns slug + category slug pairs for all PUBLISHED products whose category
 * is also PUBLISHED. Used by `generateStaticParams` in the product detail route.
 */
export async function getAllPublishedProductSlugsWithCategories() {
  const db = getPrismaClient();
  return db.product.findMany({
    where: {
      status: "PUBLISHED",
      category: { status: "PUBLISHED" },
    },
    select: {
      slug: true,
      category: { select: { slug: true } },
    },
  });
}

// ---------------------------------------------------------------------------
// Search query
// ---------------------------------------------------------------------------

/**
 * Searches PUBLISHED products by keyword using a case-insensitive `ILIKE`
 * across name, shortDescription, and description fields (PostgreSQL).
 *
 * Results are ordered by createdAt descending for recency; caller handles
 * score sorting if needed.
 */
export async function searchPublishedProducts(query: string, limit: number = 12) {
  const db = getPrismaClient();
  return db.product.findMany({
    where: {
      status: "PUBLISHED",
      category: { status: "PUBLISHED" },
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { shortDescription: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    select: storefrontProductSelect,
  });
}
