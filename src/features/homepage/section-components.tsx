import type { ComponentType } from "react";

import { BlogHighlightsSectionBlock } from "./components/blog-highlights-section";
import { DealSpotlightSectionBlock } from "./components/deal-spotlight-section";
import { FeaturedCategoriesSectionBlock } from "./components/featured-categories-section";
import { FeaturedProductsSectionBlock } from "./components/featured-products-section";
import { HeroBannerSectionBlock } from "./components/hero-banner-section";
import type {
  BlogHighlightsSection,
  DealSpotlightSection,
  FeaturedCategoriesSection,
  FeaturedProductsSection,
  HeroBannerSection,
  HomepageSection,
  HomepageSectionKind,
} from "./types";

type SectionComponentMap = {
  "hero-banner": ComponentType<{ section: HeroBannerSection }>;
  "featured-categories": ComponentType<{ section: FeaturedCategoriesSection }>;
  "featured-products": ComponentType<{ section: FeaturedProductsSection }>;
  "deal-spotlight": ComponentType<{ section: DealSpotlightSection }>;
  "blog-highlights": ComponentType<{ section: BlogHighlightsSection }>;
};

export const SECTION_COMPONENTS: SectionComponentMap = {
  "hero-banner": HeroBannerSectionBlock,
  "featured-categories": FeaturedCategoriesSectionBlock,
  "featured-products": FeaturedProductsSectionBlock,
  "deal-spotlight": DealSpotlightSectionBlock,
  "blog-highlights": BlogHighlightsSectionBlock,
};

export function renderHomepageSection(section: HomepageSection) {
  const SectionComponent = SECTION_COMPONENTS[section.kind] as ComponentType<{ section: HomepageSection }>;

  return <SectionComponent key={section.id} section={section} />;
}

export function hasRegisteredSectionComponent(kind: HomepageSectionKind): boolean {
  return kind in SECTION_COMPONENTS;
}
