import { routes } from "@/config/routes";
import { normalizePagination } from "@/server/db/pagination";

import type {
  AvailabilityFilterValue,
  CatalogListingFilters,
  CatalogSortValue,
  DiscountFilterValue,
  RatingFilterValue,
} from "./types";
import {
  availabilityFilterOptions,
  catalogSortOptions,
  discountFilterOptions,
  ratingFilterOptions,
} from "./types";

export type CatalogSearchParams = Record<string, string | string[] | undefined>;

export const catalogPageSize = 6;

const defaultAvailability: AvailabilityFilterValue = "all";
const defaultRating: RatingFilterValue = "all";
const defaultDiscount: DiscountFilterValue = "all";
const defaultSort: CatalogSortValue = "featured";

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseOptionalNumber(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return undefined;
  }

  return Math.round(parsedValue);
}

function parseEnumValue<T extends string>(value: string | undefined, allowedValues: readonly T[], fallback: T) {
  if (!value) {
    return fallback;
  }

  return allowedValues.includes(value as T) ? (value as T) : fallback;
}

export function parseCatalogSearchParams(searchParams: CatalogSearchParams = {}): CatalogListingFilters {
  const rawMinPrice = parseOptionalNumber(getFirstValue(searchParams.minPrice));
  const rawMaxPrice = parseOptionalNumber(getFirstValue(searchParams.maxPrice));
  const [minPrice, maxPrice] =
    typeof rawMinPrice === "number" && typeof rawMaxPrice === "number" && rawMinPrice > rawMaxPrice
      ? [rawMaxPrice, rawMinPrice]
      : [rawMinPrice, rawMaxPrice];

  const pagination = normalizePagination(
    {
      page: getFirstValue(searchParams.page),
      pageSize: getFirstValue(searchParams.pageSize),
    },
    {
      defaultPageSize: catalogPageSize,
      maxPageSize: catalogPageSize,
    },
  );

  return {
    minPrice,
    maxPrice,
    availability: parseEnumValue(
      getFirstValue(searchParams.availability),
      availabilityFilterOptions.map((option) => option.value),
      defaultAvailability,
    ),
    rating: parseEnumValue(
      getFirstValue(searchParams.rating),
      ratingFilterOptions.map((option) => option.value),
      defaultRating,
    ),
    discount: parseEnumValue(
      getFirstValue(searchParams.discount),
      discountFilterOptions.map((option) => option.value),
      defaultDiscount,
    ),
    sort: parseEnumValue(
      getFirstValue(searchParams.sort),
      catalogSortOptions.map((option) => option.value),
      defaultSort,
    ),
    attribute: getFirstValue(searchParams.attribute)?.trim() ?? "",
    page: pagination.page,
    pageSize: pagination.pageSize,
  };
}

export function buildCategoryListingHref(
  slug: string,
  filters: CatalogListingFilters,
  overrides: Partial<CatalogListingFilters> = {},
) {
  const params = buildCategoryListingSearchParams(filters, overrides);
  const query = params.toString();
  const path = routes.storefront.category(slug);

  return query ? `${path}?${query}` : path;
}

export function buildCategoryListingSearchParams(
  filters: CatalogListingFilters,
  overrides: Partial<CatalogListingFilters> = {},
) {
  const nextFilters = {
    ...filters,
    ...overrides,
  };
  const params = new URLSearchParams();

  if (typeof nextFilters.minPrice === "number") {
    params.set("minPrice", String(nextFilters.minPrice));
  }

  if (typeof nextFilters.maxPrice === "number") {
    params.set("maxPrice", String(nextFilters.maxPrice));
  }

  if (nextFilters.availability !== defaultAvailability) {
    params.set("availability", nextFilters.availability);
  }

  if (nextFilters.rating !== defaultRating) {
    params.set("rating", nextFilters.rating);
  }

  if (nextFilters.discount !== defaultDiscount) {
    params.set("discount", nextFilters.discount);
  }

  if (nextFilters.sort !== defaultSort) {
    params.set("sort", nextFilters.sort);
  }

  if (nextFilters.attribute) {
    params.set("attribute", nextFilters.attribute);
  }

  if (nextFilters.page > 1) {
    params.set("page", String(nextFilters.page));
  }

  return params;
}
