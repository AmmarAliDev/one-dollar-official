import type { PaginationMeta } from "@/server/db/pagination";

export const catalogSortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating-desc", label: "Top rated" },
  { value: "discount-desc", label: "Biggest discount" },
] as const;

export const availabilityFilterOptions = [
  { value: "all", label: "All stock states" },
  { value: "in-stock", label: "In stock" },
  { value: "low-stock", label: "Low stock" },
  { value: "out-of-stock", label: "Out of stock" },
] as const;

export const ratingFilterOptions = [
  { value: "all", label: "All ratings" },
  { value: "4-up", label: "4.0 and above" },
  { value: "3-up", label: "3.0 and above" },
] as const;

export const discountFilterOptions = [
  { value: "all", label: "All pricing" },
  { value: "on-sale", label: "On sale" },
  { value: "20-up", label: "20% off or more" },
] as const;

export type CatalogSortValue = (typeof catalogSortOptions)[number]["value"];
export type AvailabilityFilterValue = (typeof availabilityFilterOptions)[number]["value"];
export type RatingFilterValue = (typeof ratingFilterOptions)[number]["value"];
export type DiscountFilterValue = (typeof discountFilterOptions)[number]["value"];

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  productCount: number;
  href: string;
};

export type CatalogProductImageTone = "sky" | "emerald" | "amber" | "rose" | "slate";

export type CatalogProductCard = {
  id: string;
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  price: number;
  compareAt?: number;
  inventoryQuantity: number;
  averageRating: number;
  reviewCount: number;
  imageLabel: string;
  imageTone: CatalogProductImageTone;
  attributeSummary: string[];
};

export type CatalogListingFilters = {
  minPrice: number | undefined;
  maxPrice: number | undefined;
  availability: AvailabilityFilterValue;
  rating: RatingFilterValue;
  discount: DiscountFilterValue;
  sort: CatalogSortValue;
  attribute: string;
  page: number;
  pageSize: number;
};

export type CatalogCategoryListing = {
  category: CatalogCategory;
  products: CatalogProductCard[];
  filteredProductCount: number;
  totalProductCount: number;
  filters: CatalogListingFilters;
  pagination: PaginationMeta;
};
