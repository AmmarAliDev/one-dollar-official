import { routes } from "@/config/routes";

import { catalogCategorySeeds, catalogProductSeeds } from "./data";
import type { CatalogProductCard } from "./types";

export type CatalogSearchRequest = {
  query: string;
  limit?: number;
};

export type CatalogSearchResult = {
  query: string;
  total: number;
  items: CatalogProductCard[];
  source: "seed" | "external";
};

export interface CatalogSearchAdapter {
  searchProducts(request: CatalogSearchRequest): Promise<CatalogSearchResult>;
}

function normalizeQuery(query: string) {
  return query.trim().toLowerCase();
}

function tokenizeQuery(query: string) {
  return normalizeQuery(query)
    .split(/\s+/)
    .filter(Boolean);
}

function mapProduct(seed: (typeof catalogProductSeeds)[number]): CatalogProductCard {
  return {
    ...seed,
    href: routes.storefront.product(seed.categorySlug, seed.slug),
  };
}

function getSeedSearchScore(product: (typeof catalogProductSeeds)[number], categoryName: string, tokens: string[]) {
  const name = product.name.toLowerCase();
  const description = product.description.toLowerCase();
  const category = categoryName.toLowerCase();
  const attributes = product.attributeSummary.join(" ").toLowerCase();

  return tokens.reduce((score, token) => {
    if (name.startsWith(token)) {
      return score + 6;
    }

    if (name.includes(token)) {
      return score + 4;
    }

    if (attributes.includes(token)) {
      return score + 3;
    }

    if (description.includes(token)) {
      return score + 2;
    }

    if (category.includes(token)) {
      return score + 1;
    }

    return score;
  }, 0);
}

const seedCatalogSearchAdapter: CatalogSearchAdapter = {
  async searchProducts({ query, limit = 12 }) {
    const normalizedQuery = normalizeQuery(query);

    if (!normalizedQuery) {
      return {
        query: normalizedQuery,
        total: 0,
        items: [],
        source: "seed",
      };
    }

    const tokens = tokenizeQuery(normalizedQuery);
    const categoryNamesBySlug = new Map(catalogCategorySeeds.map((category) => [category.slug, category.name]));

    const matched = catalogProductSeeds
      .map((product) => {
        const categoryName = categoryNamesBySlug.get(product.categorySlug) ?? "";
        const score = getSeedSearchScore(product, categoryName, tokens);

        return {
          product,
          score,
        };
      })
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score || left.product.featuredRank - right.product.featuredRank);

    return {
      query: normalizedQuery,
      total: matched.length,
      items: matched.slice(0, Math.max(1, limit)).map((item) => mapProduct(item.product)),
      source: "seed",
    };
  },
};

// This seam is intentionally centralized so dedicated search services can replace
// the seed implementation without changing page/API contracts.
export function getCatalogSearchAdapter(): CatalogSearchAdapter {
  return seedCatalogSearchAdapter;
}
