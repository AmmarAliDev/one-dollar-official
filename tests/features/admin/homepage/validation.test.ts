import { describe, expect, it } from "vitest";

import {
  validateAdminBannerInput,
  validateAdminDealCampaignInput,
  validateAdminHomepageSectionInput,
} from "@/features/admin/homepage";

describe("admin homepage content validation", () => {
  it("accepts section ordering, toggles, scheduling, and valid announcement content", () => {
    const result = validateAdminHomepageSectionInput({
      id: "section-1",
      key: "announcement-primary",
      title: "Announcement",
      type: "announcement-bar",
      position: 5,
      active: true,
      startAt: "2026-04-20T08:00:00.000Z",
      endAt: "2026-04-22T18:00:00.000Z",
      content: {
        message: "Free delivery on orders over PKR 2,000",
        href: "/categories",
        label: "Browse deals",
      },
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.position).toBe(5);
      expect(result.data.type).toBe("announcement-bar");
      expect(result.data.active).toBe(true);
    }
  });

  it("rejects invalid schedules and malformed section payloads", () => {
    const result = validateAdminHomepageSectionInput({
      id: "section-2",
      key: "hero-primary",
      title: "Broken hero",
      type: "hero-banner",
      position: 10,
      active: true,
      startAt: "2026-04-25T08:00:00.000Z",
      endAt: "2026-04-20T08:00:00.000Z",
      content: {
        headline: "",
        description: "Missing headline should fail",
        primaryCtaLabel: "Shop now",
        primaryCtaHref: "/categories",
      },
    });

    expect(result.success).toBe(false);
  });

  it("validates banner and campaign scheduling consistently", () => {
    const banner = validateAdminBannerInput({
      title: "Weekend banner",
      imageUrl: "https://example.com/banner.jpg",
      href: "/categories",
      position: 1,
      active: true,
      startAt: "2026-04-20T08:00:00.000Z",
      endAt: "2026-04-21T08:00:00.000Z",
    });
    const campaign = validateAdminDealCampaignInput({
      name: "Flash deal",
      description: "Limited-time savings",
      startsAt: "2026-04-20T08:00:00.000Z",
      endsAt: "2026-04-21T08:00:00.000Z",
      active: true,
    });

    expect(banner.success).toBe(true);
    expect(campaign.success).toBe(true);
  });

  it("accepts hero/deal spotlight image fields on configured hosts", () => {
    const heroResult = validateAdminHomepageSectionInput({
      key: "hero-with-image",
      title: "Hero with image",
      type: "hero-banner",
      position: 10,
      active: true,
      content: {
        headline: "Admin hero",
        description: "Homepage hero content",
        primaryCtaLabel: "Shop now",
        primaryCtaHref: "/categories",
        image: {
          url: "https://store.public.blob.vercel-storage.com/admin/banner/hero-banner.png",
          alt: "Family shopping from a curated grocery basket",
        },
      },
    });

    const dealResult = validateAdminHomepageSectionInput({
      key: "deal-with-image",
      title: "Deal with image",
      type: "deal-spotlight",
      position: 40,
      active: true,
      content: {
        description: "Save on best sellers this week.",
        dealLabel: "Flash deal",
        price: 999,
        compareAt: 1299,
        ctaLabel: "View deal",
        ctaHref: "/categories",
        image: {
          url: "/blog/deal-spotlight.jpg",
          alt: "Featured products highlighted for a limited-time sale",
        },
      },
    });

    expect(heroResult.success).toBe(true);
    expect(dealResult.success).toBe(true);
  });

  it("rejects unsupported hero/deal image hosts", () => {
    const heroResult = validateAdminHomepageSectionInput({
      key: "hero-invalid-image",
      title: "Hero invalid image",
      type: "hero-banner",
      position: 10,
      active: true,
      content: {
        headline: "Admin hero",
        description: "Homepage hero content",
        primaryCtaLabel: "Shop now",
        primaryCtaHref: "/categories",
        image: {
          url: "https://images.example.com/hero.jpg",
          alt: "Hero image",
        },
      },
    });

    expect(heroResult.success).toBe(false);
  });
});
