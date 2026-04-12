import { routes } from "@/config/routes";
import { createPaginatedResult } from "@/server/db/pagination";

import { catalogCategorySeeds, catalogProductSeeds } from "./data";
import type { CatalogSearchParams } from "./filters";
import { parseCatalogSearchParams } from "./filters";
import type { CatalogCategory, CatalogCategoryListing, CatalogProductCard } from "./types";

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
    products: paginatedResult.items,
    filteredProductCount: filteredProducts.length,
    totalProductCount: categoryProducts.length,
    filters,
    pagination: paginatedResult.meta,
  };
}
