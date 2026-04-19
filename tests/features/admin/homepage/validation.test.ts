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
});
