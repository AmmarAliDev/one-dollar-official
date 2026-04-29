import type { ComponentType } from "react";

import { AnnouncementBarSectionBlock } from "./components/announcement-bar-section";
import { BlogHighlightsSectionBlock } from "./components/blog-highlights-section";
import { DealSpotlightSectionBlock } from "./components/deal-spotlight-section";
import { FeaturedCategoriesSectionBlock } from "./components/featured-categories-section";
import { FeaturedProductsSectionBlock } from "./components/featured-products-section";
import { HeroBannerSectionBlock } from "./components/hero-banner-section";
import { OneDollarSectionBlock } from "./components/one-dollar-section";
import type {
  AnnouncementBarSection,
  BlogHighlightsSection,
  DealSpotlightSection,
  FeaturedCategoriesSection,
  FeaturedProductsSection,
  HeroBannerSection,
  HomepageSection,
  HomepageSectionKind,
  OneDollarSection,
} from "./types";

type SectionComponentMap = {
  "announcement-bar": ComponentType<{ section: AnnouncementBarSection }>;
  "hero-banner": ComponentType<{ section: HeroBannerSection }>;
  "featured-categories": ComponentType<{ section: FeaturedCategoriesSection }>;
  "one-dollar": ComponentType<{ section: OneDollarSection }>;
  "featured-products": ComponentType<{ section: FeaturedProductsSection }>;
  "deal-spotlight": ComponentType<{ section: DealSpotlightSection }>;
  "blog-highlights": ComponentType<{ section: BlogHighlightsSection }>;
};

export const SECTION_COMPONENTS: SectionComponentMap = {
  "announcement-bar": AnnouncementBarSectionBlock,
  "hero-banner": HeroBannerSectionBlock,
  "featured-categories": FeaturedCategoriesSectionBlock,
  "one-dollar": OneDollarSectionBlock,
  "featured-products": FeaturedProductsSectionBlock,
  "deal-spotlight": DealSpotlightSectionBlock,
  "blog-highlights": BlogHighlightsSectionBlock,
};

export function renderHomepageSection(section: HomepageSection) {
  const SectionComponent = SECTION_COMPONENTS[section.kind] as
    | ComponentType<{ section: HomepageSection }>
    | undefined;

  if (!SectionComponent) {
    console.warn(`[homepage] No component registered for section kind="${section.kind}" id="${section.id}"`);
    return null;
  }

  return <SectionComponent key={section.id} section={section} />;
}

export function hasRegisteredSectionComponent(kind: HomepageSectionKind): boolean {
  return kind in SECTION_COMPONENTS;
}
