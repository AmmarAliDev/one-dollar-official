export type HomepageSectionKind =
  | "hero-banner"
  | "featured-categories"
  | "featured-products"
  | "deal-spotlight"
  | "blog-highlights";

export type HeroBannerSection = {
  id: string;
  kind: "hero-banner";
  enabled?: boolean;
  displayOrder?: number;
  headline: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  eyebrow?: string;
};

export type FeaturedCategoryItem = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export type FeaturedCategoriesSection = {
  id: string;
  kind: "featured-categories";
  enabled?: boolean;
  displayOrder?: number;
  title: string;
  description?: string;
  categories: FeaturedCategoryItem[];
};

export type FeaturedProductItem = {
  id: string;
  name: string;
  href: string;
  price: number;
  compareAt?: number;
  badge?: string;
};

export type FeaturedProductsSection = {
  id: string;
  kind: "featured-products";
  enabled?: boolean;
  displayOrder?: number;
  title: string;
  description?: string;
  products: FeaturedProductItem[];
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
};

export type BlogHighlightItem = {
  id: string;
  title: string;
  excerpt: string;
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
  | HeroBannerSection
  | FeaturedCategoriesSection
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
