import { HOMEPAGE_FALLBACK_SECTIONS } from "./fallback-content";
import type { HomepageContentResult, HomepageSection, HomepageSectionKind } from "./types";

const SECTION_RENDER_ORDER: HomepageSectionKind[] = [
  "announcement-bar",
  "hero-banner",
  "featured-categories",
  "one-dollar",
  "featured-products",
  "deal-spotlight",
  "blog-highlights",
];

const SECTION_ORDER_INDEX: Record<HomepageSectionKind, number> = SECTION_RENDER_ORDER.reduce(
  (accumulator, kind, index) => {
    accumulator[kind] = index;
    return accumulator;
  },
  {} as Record<HomepageSectionKind, number>,
);

function composeSectionsWithFallback(enabledCmsSections: HomepageSection[]): HomepageSection[] {
  const hasCampaignOverlay = enabledCmsSections.some(
    (section) => section.kind === "deal-spotlight" && section.id.startsWith("campaign-"),
  );

  const hasPrimaryHomepageSection = enabledCmsSections.some((section) => {
    if (section.kind === "announcement-bar") {
      return false;
    }

    if (section.kind === "deal-spotlight" && section.id.startsWith("campaign-")) {
      return false;
    }

    return true;
  });

  // Announcement bars are additive promotional surfaces. If they are the only
  // CMS-provided sections, keep baseline homepage sections from fallback so the
  // page shell remains complete.
  if (hasPrimaryHomepageSection) {
    return enabledCmsSections;
  }

  const fallbackPrimarySections = HOMEPAGE_FALLBACK_SECTIONS.filter((section) => {
    if (section.kind === "announcement-bar") {
      return false;
    }

    // Avoid rendering duplicate deal spotlight content when an active campaign
    // is already contributing a deal-spotlight section.
    if (hasCampaignOverlay && section.kind === "deal-spotlight") {
      return false;
    }

    return true;
  });

  return [...enabledCmsSections, ...fallbackPrimarySections];
}

function sortSections(sections: HomepageSection[]): HomepageSection[] {
  return [...sections].sort((left, right) => {
    const leftOrder = left.displayOrder ?? Number.POSITIVE_INFINITY;
    const rightOrder = right.displayOrder ?? Number.POSITIVE_INFINITY;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return SECTION_ORDER_INDEX[left.kind] - SECTION_ORDER_INDEX[right.kind];
  });
}

export function resolveHomepageSections(cmsSections: HomepageSection[] | null | undefined): HomepageContentResult {
  if (!cmsSections || cmsSections.length === 0) {
    return {
      sections: sortSections(HOMEPAGE_FALLBACK_SECTIONS),
      source: "fallback",
    };
  }

  const enabledCmsSections = cmsSections.filter((section) => section.enabled !== false);

  if (enabledCmsSections.length === 0) {
    return {
      sections: sortSections(HOMEPAGE_FALLBACK_SECTIONS),
      source: "fallback",
    };
  }

  const composedSections = composeSectionsWithFallback(enabledCmsSections);

  return {
    sections: sortSections(composedSections),
    source: "cms",
  };
}

export { SECTION_RENDER_ORDER };
