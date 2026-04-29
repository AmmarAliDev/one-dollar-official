import { routes } from "@/config/routes";

import type { CatalogCategory } from "./types";

export const ONE_DOLLAR_CATEGORY_SLUG = "one-dollar";
export const ONE_DOLLAR_CATEGORY_LABEL = "One Dollar";
export const ONE_DOLLAR_MAX_PRICE_PKR = 280;

const ONE_DOLLAR_CATEGORY_ID = "system-one-dollar";

export function isOneDollarCategorySlug(slug: string): boolean {
  return slug.trim().toLocaleLowerCase("en-US") === ONE_DOLLAR_CATEGORY_SLUG;
}

export function createOneDollarVirtualCategory(productCount: number): CatalogCategory {
  return {
    id: ONE_DOLLAR_CATEGORY_ID,
    name: ONE_DOLLAR_CATEGORY_LABEL,
    slug: ONE_DOLLAR_CATEGORY_SLUG,
    description: `All published products priced at PKR ${ONE_DOLLAR_MAX_PRICE_PKR} or less.`,
    seoTitle: "One Dollar Deals in Pakistan",
    seoDescription:
      "Shop One Dollar picks across all categories. This special storefront collection automatically includes published products priced at PKR 280 or less.",
    productCount,
    href: routes.storefront.category(ONE_DOLLAR_CATEGORY_SLUG),
  };
}
