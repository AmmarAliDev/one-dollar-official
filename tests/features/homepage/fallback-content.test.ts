import { describe, expect, it } from "vitest";

import { buildHomepageFallbackSections } from "@/features/homepage/fallback-content";

function getHeroSecondaryCta(nodeEnv: "development" | "test" | "production") {
  const sections = buildHomepageFallbackSections({
    nodeEnv,
    appUrl: "http://localhost:3000",
    defaultCity: "Karachi",
    enableAdminPreview: true,
    enableAuthPreview: true,
    gaId: undefined,
    metaPixelId: undefined,
  });

  const heroSection = sections.find((section) => section.kind === "hero-banner");

  return heroSection && "secondaryCta" in heroSection ? heroSection.secondaryCta : undefined;
}

describe("homepage fallback content", () => {
  it("hides preview-only hero CTA in production", () => {
    expect(getHeroSecondaryCta("production")).toBeUndefined();
  });

  it("keeps preview-only hero CTA in non-production environments", () => {
    expect(getHeroSecondaryCta("development")).toMatchObject({
      label: "Preview storefront shell",
      href: "/preview",
    });

    expect(getHeroSecondaryCta("test")).toMatchObject({
      label: "Preview storefront shell",
      href: "/preview",
    });
  });
});
