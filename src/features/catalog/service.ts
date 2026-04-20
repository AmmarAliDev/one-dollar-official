import { routes } from "@/config/routes";
import { isReviewVisibleOnStorefront } from "@/lib/reviews/moderation";
import { createPaginatedResult } from "@/server/db/pagination";

import { catalogCategorySeeds, catalogProductDetailSeeds, catalogProductSeeds } from "./data";
import type { CatalogSearchParams } from "./filters";
import { parseCatalogSearchParams } from "./filters";
import { getCatalogSearchAdapter } from "./search-adapter";
import type { CatalogCategory, CatalogCategoryListing, CatalogProductCard, CatalogProductDetail, ProductReview, ProductReviewSummary } from "./types";

type CategoryListingInput = {
  slug: string;
  searchParams?: CatalogSearchParams;
};

function getDiscountPercent(product: Pick<CatalogProductCard, "price" | "compareAt">) {
  if (typeof product.compareAt !== "number" || product.compareAt <= product.price) {
    return 0;
  }

  return Math.round(((product.compareAt - product.price) / product.compareAt) * 100);
}

function mapCategory(seed: (typeof catalogCategorySeeds)[number]): CatalogCategory {
  const productCount = catalogProductSeeds.filter((product) => product.categorySlug === seed.slug).length;

  return {
    ...seed,
    productCount,
    href: routes.storefront.category(seed.slug),
  };
}

function mapProduct(seed: (typeof catalogProductSeeds)[number]): CatalogProductCard {
  return {
    ...seed,
    href: routes.storefront.product(seed.categorySlug, seed.slug),
  };
}

function sortProducts(products: typeof catalogProductSeeds, sort: string) {
  return [...products].sort((left, right) => {
    switch (sort) {
      case "newest":
        return left.newestRank - right.newestRank;
      case "price-asc":
        return left.price - right.price;
      case "price-desc":
        return right.price - left.price;
      case "rating-desc":
        return right.averageRating - left.averageRating || right.reviewCount - left.reviewCount;
      case "discount-desc":
        return getDiscountPercent(right) - getDiscountPercent(left) || left.featuredRank - right.featuredRank;
      case "featured":
      default:
        return left.featuredRank - right.featuredRank;
    }
  });
}

function applyFilters(products: typeof catalogProductSeeds, filters: ReturnType<typeof parseCatalogSearchParams>) {
  return products.filter((product) => {
    if (typeof filters.minPrice === "number" && product.price < filters.minPrice) {
      return false;
    }

    if (typeof filters.maxPrice === "number" && product.price > filters.maxPrice) {
      return false;
    }

    if (filters.availability === "in-stock" && product.inventoryQuantity <= 0) {
      return false;
    }

    if (filters.availability === "low-stock" && (product.inventoryQuantity < 1 || product.inventoryQuantity > 5)) {
      return false;
    }

    if (filters.availability === "out-of-stock" && product.inventoryQuantity > 0) {
      return false;
    }

    if (filters.rating === "4-up" && product.averageRating < 4) {
      return false;
    }

    if (filters.rating === "3-up" && product.averageRating < 3) {
      return false;
    }

    const discountPercent = getDiscountPercent(product);

    if (filters.discount === "on-sale" && discountPercent <= 0) {
      return false;
    }

    if (filters.discount === "20-up" && discountPercent < 20) {
      return false;
    }

    return true;
  });
}

function getVisibleReviewData(reviews: ProductReview[], summary: ProductReviewSummary) {
  const visibleReviews = reviews.filter((review) => isReviewVisibleOnStorefront(review.status ?? "APPROVED"));

  if (visibleReviews.length === reviews.length) {
    return {
      reviews: visibleReviews,
      summary,
    };
  }

  const distribution: ProductReviewSummary["distribution"] = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  if (visibleReviews.length === 0) {
    return {
      reviews: [],
      summary: {
        averageRating: 0,
        totalCount: 0,
        distribution,
      },
    };
  }

  const totalRating = visibleReviews.reduce((sum, review) => sum + review.rating, 0);

  for (const review of visibleReviews) {
    const normalizedRating = Math.max(1, Math.min(5, Math.round(review.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[normalizedRating] += 1;
  }

  return {
    reviews: visibleReviews,
    summary: {
      averageRating: Number((totalRating / visibleReviews.length).toFixed(1)),
      totalCount: visibleReviews.length,
      distribution,
    },
  };
}

export async function getCatalogCategories() {
  return catalogCategorySeeds.map(mapCategory);
}

export async function getCatalogCategory(slug: string) {
  const category = catalogCategorySeeds.find((item) => item.slug === slug);

  return category ? mapCategory(category) : null;
}

export async function getCatalogCategorySlugs() {
  return catalogCategorySeeds.map((category) => category.slug);
}

export async function getCatalogCategoryListing({ slug, searchParams }: CategoryListingInput): Promise<CatalogCategoryListing | null> {
  const category = await getCatalogCategory(slug);

  if (!category) {
    return null;
  }

  const filters = parseCatalogSearchParams(searchParams);
  const categoryProducts = catalogProductSeeds.filter((product) => product.categorySlug === slug);
  const filteredProducts = sortProducts(applyFilters(categoryProducts, filters), filters.sort);
  const paginatedResult = createPaginatedResult({
    items: filteredProducts.slice((filters.page - 1) * filters.pageSize, filters.page * filters.pageSize),
    totalItems: filteredProducts.length,
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
    },
  });

  return {
    category,
    products: paginatedResult.items.map(mapProduct),
    filteredProductCount: filteredProducts.length,
    totalProductCount: categoryProducts.length,
    filters,
    pagination: paginatedResult.meta,
  };
}

export async function getProductBySlug(slug: string): Promise<CatalogProductDetail | null> {
  const seed = catalogProductSeeds.find((p) => p.slug === slug);

  if (!seed) {
    return null;
  }

  const detail = catalogProductDetailSeeds[slug];

  if (!detail) {
    return null;
  }

  const card = mapProduct(seed);
  const visibleReviewData = getVisibleReviewData(detail.reviews, detail.reviewSummary);

  return {
    ...card,
    sku: detail.sku,
    shortDescription: detail.shortDescription,
    longDescription: detail.longDescription,
    images: detail.images,
    specifications: detail.specifications,
    variantGroups: detail.variantGroups,
    reviews: visibleReviewData.reviews,
    reviewSummary: visibleReviewData.summary,
  };
}

export async function getRelatedProducts(categorySlug: string, excludeSlug: string): Promise<CatalogProductCard[]> {
  return catalogProductSeeds
    .filter((p) => p.categorySlug === categorySlug && p.slug !== excludeSlug)
    .slice(0, 4)
    .map(mapProduct);
}

export async function getProductSlugsWithCategory(): Promise<{ slug: string; categorySlug: string }[]> {
  return catalogProductSeeds.map((p) => ({ slug: p.slug, categorySlug: p.categorySlug }));
}

type CatalogProductSearchOptions = {
  limit?: number;
};

export async function searchCatalogProducts(query: string, options: CatalogProductSearchOptions = {}) {
  const adapter = getCatalogSearchAdapter();

  return adapter.searchProducts({
    query,
    ...(typeof options.limit === "number" ? { limit: options.limit } : {}),
  });
}
