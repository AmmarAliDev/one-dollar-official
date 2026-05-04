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
  // Overlay sections are additive promotional surfaces that do not constitute a
  // primary homepage structure on their own. Both announcement bars and deal
  // spotlights fall into this category — whether the spotlight was created via
  // the admin deal-campaign flow (id prefix "campaign-") or as a standalone
  // HomePageSection record.
  const isOverlaySection = (section: HomepageSection) =>
    section.kind === "announcement-bar" || section.kind === "deal-spotlight";

  const hasPrimaryHomepageSection = enabledCmsSections.some((section) => !isOverlaySection(section));

  // If at least one non-overlay section exists in CMS, treat the full CMS set
  // as the homepage definition and skip fallback merging.
  if (hasPrimaryHomepageSection) {
    return enabledCmsSections;
  }

  // Only overlay sections are present in CMS. Merge them with the fallback
  // homepage structure so the page shell remains complete.
  const hasDealSpotlightSection = enabledCmsSections.some((section) => section.kind === "deal-spotlight");

  const fallbackPrimarySections = HOMEPAGE_FALLBACK_SECTIONS.filter((section) => {
    // Announcement bars from fallback would duplicate the additive CMS bars.
    if (section.kind === "announcement-bar") {
      return false;
    }

    // Avoid rendering a duplicate deal spotlight when the CMS already provides
    // one (either from an admin section record or an active campaign).
    if (hasDealSpotlightSection && section.kind === "deal-spotlight") {
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
