import { routes } from "@/config/routes";

import type { CatalogCategory } from "./types";

export const ONE_DOLLAR_CATEGORY_SLUG = "one-dollar";
export const ONE_DOLLAR_CATEGORY_LABEL = "One Dollar";
export const ONE_DOLLAR_MAX_PRICE_PKR = 280;

/** Default card/OG image for the One Dollar virtual category. */
export const ONE_DOLLAR_CATEGORY_IMAGE_URL =
  "https://7vmvuxle2dj9679q.public.blob.vercel-storage.com/admin/category/2026/05/one-dollar-5f2ffdb0.jpg";

const ONE_DOLLAR_CATEGORY_ID = "system-one-dollar";

export function isOneDollarCategorySlug(slug: string): boolean {
  return slug.trim().toLocaleLowerCase("en-US") === ONE_DOLLAR_CATEGORY_SLUG;
}

export function createOneDollarVirtualCategory(productCount: number): CatalogCategory {
  return {
    id: ONE_DOLLAR_CATEGORY_ID,
    name: ONE_DOLLAR_CATEGORY_LABEL,
    slug: ONE_DOLLAR_CATEGORY_SLUG,
    description: `All published products priced at Rs. ${ONE_DOLLAR_MAX_PRICE_PKR} or less.`,
    cardImageUrl: ONE_DOLLAR_CATEGORY_IMAGE_URL,
    seoTitle: "One Dollar Deals in Pakistan",
    seoDescription:
      "Shop One Dollar picks across all categories. This special storefront collection automatically includes published products priced at Rs. 280 or less.",
    productCount,
    href: routes.storefront.category(ONE_DOLLAR_CATEGORY_SLUG),
  };
}
