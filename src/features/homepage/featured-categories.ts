import { ONE_DOLLAR_CATEGORY_SLUG } from "@/features/catalog/one-dollar";
import type { CatalogCategory } from "@/features/catalog/types";

import type { FeaturedCategoryItem } from "./types";

type LegacyFeaturedCategoryItem = {
  id: string;
  name?: string;
  title?: string;
  description: string;
  href: string;
  slug?: string;
  cardImageUrl?: string;
};

export function toFeaturedCategoryItem(category: CatalogCategory): FeaturedCategoryItem {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    href: category.href,
    ...(category.slug ? { slug: category.slug } : {}),
    ...(category.cardImageUrl ? { cardImageUrl: category.cardImageUrl } : {}),
  };
}

export function normalizeFeaturedCategoryItem(
  category: LegacyFeaturedCategoryItem,
): FeaturedCategoryItem | null {
  const name = category.name?.trim() || category.title?.trim();

  if (!name) {
    return null;
  }

  return {
    id: category.id,
    name,
    description: category.description,
    href: category.href,
    ...(category.slug ? { slug: category.slug } : {}),
    ...(category.cardImageUrl ? { cardImageUrl: category.cardImageUrl } : {}),
  };
}

export function normalizeFeaturedCategoryItems(
  categories: readonly LegacyFeaturedCategoryItem[],
): FeaturedCategoryItem[] {
  return categories
    .map((category) => normalizeFeaturedCategoryItem(category))
    .filter((category): category is FeaturedCategoryItem => category !== null);
}

export function mapCatalogCategoriesToFeaturedCategoryItems(
  categories: readonly CatalogCategory[],
): FeaturedCategoryItem[] {
  return categories
    .filter((category) => category.slug !== ONE_DOLLAR_CATEGORY_SLUG)
    .map((category) => toFeaturedCategoryItem(category));
}