import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  homePageSection: {
    findMany: vi.fn(),
  },
  banner: {
    findMany: vi.fn(),
  },
  dealCampaign: {
    findMany: vi.fn(),
  },
}));

vi.mock("@/server/db", () => ({
  getPrismaClient: () => prismaMock,
}));

import { getHomepageContent } from "@/features/homepage";

describe("homepage CMS service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.banner.findMany.mockResolvedValue([]);
    prismaMock.dealCampaign.findMany.mockResolvedValue([]);
  });

  it("reflects valid admin homepage content on the storefront contract", async () => {
    prismaMock.homePageSection.findMany.mockResolvedValue([
      {
        id: "section-hero",
        key: "hero-primary",
        title: "Hero",
        type: "hero-banner",
        content: {
          headline: "Admin managed hero",
          description: "Updated from homepage admin.",
          primaryCtaLabel: "Shop now",
          primaryCtaHref: "/categories",
        },
        meta: {
          enabled: true,
        },
        position: 10,
        active: true,
        createdAt: new Date("2026-04-20T08:00:00.000Z"),
        updatedAt: new Date("2026-04-20T08:00:00.000Z"),
      },
    ]);

    const result = await getHomepageContent();

    expect(result.source).toBe("cms");
    expect(result.sections[0]).toMatchObject({
      kind: "hero-banner",
      headline: "Admin managed hero",
      primaryCtaHref: "/categories",
    });
  });
});
