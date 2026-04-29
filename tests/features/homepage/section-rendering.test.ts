import { describe, expect, it } from "vitest";

import type { HomepageSection } from "@/features/homepage";
import {
  hasRegisteredSectionComponent,
  resolveHomepageSections,
  SECTION_RENDER_ORDER,
} from "@/features/homepage";

describe("homepage section rendering", () => {
  it("falls back to default sections when CMS content is missing", () => {
    const result = resolveHomepageSections(null);

    expect(result.source).toBe("fallback");
    expect(result.sections.length).toBeGreaterThan(0);
    expect(result.sections.map((section) => section.kind)).toEqual([
      "hero-banner",
      "featured-categories",
      "one-dollar",
      "featured-products",
      "deal-spotlight",
      "blog-highlights",
    ]);
  });

  it("renders CMS sections in deterministic order and ignores disabled sections", () => {
    const cmsSections: HomepageSection[] = [
      {
        id: "cms-blog",
        kind: "blog-highlights",
        title: "Blog updates",
        description: "Latest reads",
        placeholderMessage: "No highlights yet",
        articles: [],
        displayOrder: 90,
      },
      {
        id: "cms-hero",
        kind: "hero-banner",
        headline: "CMS hero",
        description: "Controlled by admin",
        primaryCtaLabel: "Shop now",
        primaryCtaHref: "/search",
        displayOrder: 10,
      },
      {
        id: "cms-products-disabled",
        kind: "featured-products",
        title: "Disabled section",
        products: [],
        enabled: false,
        displayOrder: 20,
      },
      {
        id: "cms-deal",
        kind: "deal-spotlight",
        title: "Deal",
        description: "Limited time",
        dealLabel: "Deal",
        price: 1000,
        compareAt: 1200,
        ctaLabel: "View",
        ctaHref: "/preview",
        displayOrder: 20,
      },
    ];

    const result = resolveHomepageSections(cmsSections);

    expect(result.source).toBe("cms");
    expect(result.sections.map((section) => section.id)).toEqual(["cms-hero", "cms-deal", "cms-blog"]);
  });

  it("keeps section architecture modular with registry coverage for each section kind", () => {
    expect(SECTION_RENDER_ORDER.every((kind) => hasRegisteredSectionComponent(kind))).toBe(true);
  });
});
