import type { CatalogCategory } from "@/features/catalog/types";

export type HomepageSectionKind =
  | "announcement-bar"
  | "hero-banner"
  | "featured-categories"
  | "one-dollar"
  | "featured-products"
  | "deal-spotlight"
  | "blog-highlights";

export type AnnouncementBarSection = {
  id: string;
  kind: "announcement-bar";
  enabled?: boolean;
  displayOrder?: number;
  message: string;
  href?: string;
  label?: string;
};

export type HeroBannerSection = {
  id: string;
  kind: "hero-banner";
  enabled?: boolean;
  displayOrder?: number;
  headline: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCta?: { label: string; href: string };
  eyebrow?: string;
  image?: {
    url: string;
    alt: string;
  };
};

export type FeaturedCategoryItem = Pick<CatalogCategory, "id" | "name" | "description" | "href"> & {
  slug?: CatalogCategory["slug"];
  cardImageUrl?: CatalogCategory["cardImageUrl"];
};

export type FeaturedProductImage = {
  url: string;
  alt?: string;
  isPrimary?: boolean;
};

export type FeaturedCategoriesSection = {
  id: string;
  kind: "featured-categories";
  enabled?: boolean;
  displayOrder?: number;
  title: string;
  description?: string;
  categories: FeaturedCategoryItem[];
  /** Optional label for the "View All" CTA shown when categories are capped. */
  viewAllLabel?: string;
  /** Optional href for the "View All" CTA. Falls back to the categories route. */
  viewAllHref?: string;
};

export type FeaturedProductItem = {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  href: string;
  price: number;
  compareAt?: number;
  badge?: string;
  images?: FeaturedProductImage[];
};

export type FeaturedProductsSection = {
  id: string;
  kind: "featured-products";
  enabled?: boolean;
  displayOrder?: number;
  title: string;
  description?: string;
  products: FeaturedProductItem[];
  /** Optional label for the "View All" CTA shown when products are capped. */
  viewAllLabel?: string;
  /** Optional href for the "View All" CTA. Falls back to the products/categories route. */
  viewAllHref?: string;
};

/**
 * One Dollar section — displays auto-hydrated catalog products priced at or
 * below ONE_DOLLAR_MAX_PRICE_PKR. Products are never stored in CMS; they are
 * resolved at runtime from the published catalog.
 *
 * Admin configures: title, description, ctaLabel, ctaHref, placeholderMessage.
 */
export type OneDollarSection = {
  id: string;
  kind: "one-dollar";
  enabled?: boolean;
  displayOrder?: number;
  title: string;
  description?: string;
  /**
   * Products hydrated from the live catalog (price ≤ ONE_DOLLAR_MAX_PRICE_PKR).
   * Empty array until hydration runs; the component renders a placeholder state
   * when this is empty.
   */
  products: FeaturedProductItem[];
  /** Label for the "View all" CTA linking to the One Dollar category. */
  ctaLabel: string;
  /** Href for the "View all" CTA (typically /categories/one-dollar). */
  ctaHref: string;
  /** Shown when no One Dollar products are available in the catalog. */
  placeholderMessage: string;
};

export type DealSpotlightSection = {
  id: string;
  kind: "deal-spotlight";
  enabled?: boolean;
  displayOrder?: number;
  title: string;
  description: string;
  dealLabel: string;
  price: number;
  compareAt: number;
  ctaLabel: string;
  ctaHref: string;
  image?: {
    url: string;
    alt: string;
  };
};

export type BlogHighlightItem = {
  id: string;
  title: string;
  excerpt: string;
  href: string;
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
};

export type BlogHighlightsSection = {
  id: string;
  kind: "blog-highlights";
  enabled?: boolean;
  displayOrder?: number;
  title: string;
  description?: string;
  placeholderMessage: string;
  articles: BlogHighlightItem[];
};

export type HomepageSection =
  | AnnouncementBarSection
  | HeroBannerSection
  | FeaturedCategoriesSection
  | OneDollarSection
  | FeaturedProductsSection
  | DealSpotlightSection
  | BlogHighlightsSection;

export type HomepageContent = {
  sections: HomepageSection[];
};

export type HomepageContentResult = {
  sections: HomepageSection[];
  source: "cms" | "fallback";
};
