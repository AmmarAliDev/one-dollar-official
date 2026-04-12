import { HOMEPAGE_FALLBACK_SECTIONS } from "./fallback-content";
import type { HomepageContentResult, HomepageSection, HomepageSectionKind } from "./types";

const SECTION_RENDER_ORDER: HomepageSectionKind[] = [
  "hero-banner",
  "featured-categories",
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

  return {
    sections: sortSections(enabledCmsSections),
    source: "cms",
  };
}

export { SECTION_RENDER_ORDER };
