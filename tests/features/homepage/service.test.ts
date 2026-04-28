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

const mockGetBlogPosts = vi.hoisted(() => vi.fn());

vi.mock("@/server/db", () => ({
  getPrismaClient: () => prismaMock,
}));

vi.mock("@/features/blog", () => ({
  getBlogPosts: (...args: unknown[]) => mockGetBlogPosts(...args),
}));

import { getHomepageContent } from "@/features/homepage";

describe("homepage CMS service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.banner.findMany.mockResolvedValue([]);
    prismaMock.dealCampaign.findMany.mockResolvedValue([]);
    mockGetBlogPosts.mockResolvedValue([]);
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

  it("hydrates homepage blog highlights from DB-backed posts", async () => {
    prismaMock.homePageSection.findMany.mockResolvedValue([
      {
        id: "section-blog",
        key: "blog-home",
        title: "Blog highlights",
        type: "blog-highlights",
        content: {
          description: "Latest posts",
          placeholderMessage: "No posts yet",
          articles: [{ id: "legacy", title: "Legacy", excerpt: "Legacy", href: "/blog/legacy" }],
        },
        meta: {
          enabled: true,
        },
        position: 50,
        active: true,
        createdAt: new Date("2026-04-20T08:00:00.000Z"),
        updatedAt: new Date("2026-04-20T08:00:00.000Z"),
      },
    ]);

    mockGetBlogPosts.mockResolvedValue([
      {
        id: "db-post-1",
        locale: "en",
        title: "DB First Post",
        slug: "db-first-post",
        excerpt: "From db",
        content: [],
        coverImage: {
          src: "/blog/db-post-1.svg",
          alt: "DB First Post",
          width: 1200,
          height: 630,
        },
        status: "published",
        publishedAt: "2026-04-25T08:00:00.000Z",
        seo: {},
      },
    ]);

    const result = await getHomepageContent();
    const blogSection = result.sections.find((section) => section.kind === "blog-highlights");

    expect(blogSection).toMatchObject({
      kind: "blog-highlights",
      articles: [
        {
          id: "db-post-1",
          title: "DB First Post",
          excerpt: "From db",
          href: "/blog/db-first-post",
        },
      ],
    });
  });

  it("isolates manual fallback articles when homepage blog DB read fails", async () => {
    prismaMock.homePageSection.findMany.mockResolvedValue([
      {
        id: "section-blog",
        key: "blog-home",
        title: "Blog highlights",
        type: "blog-highlights",
        content: {
          description: "Latest posts",
          placeholderMessage: "No posts yet",
          articles: [{ id: "legacy", title: "Legacy", excerpt: "Legacy", href: "/blog/legacy" }],
        },
        meta: {
          enabled: true,
        },
        position: 50,
        active: true,
        createdAt: new Date("2026-04-20T08:00:00.000Z"),
        updatedAt: new Date("2026-04-20T08:00:00.000Z"),
      },
    ]);

    mockGetBlogPosts.mockRejectedValue(new Error("DB unavailable"));

    const result = await getHomepageContent();
    const blogSection = result.sections.find((section) => section.kind === "blog-highlights");

    expect(blogSection).toMatchObject({
      kind: "blog-highlights",
      articles: [],
    });
  });
});
