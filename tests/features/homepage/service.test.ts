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
const mockGetCatalogCategoryListing = vi.hoisted(() => vi.fn());

vi.mock("@/server/db", () => ({
  getPrismaClient: () => prismaMock,
}));

vi.mock("@/features/blog", () => ({
  getBlogPosts: (...args: unknown[]) => mockGetBlogPosts(...args),
}));

vi.mock("@/features/catalog", () => ({
  getCatalogCategoryListing: (...args: unknown[]) => mockGetCatalogCategoryListing(...args),
}));

import { getHomepageContent } from "@/features/homepage";

describe("homepage CMS service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.banner.findMany.mockResolvedValue([]);
    prismaMock.dealCampaign.findMany.mockResolvedValue([]);
    mockGetBlogPosts.mockResolvedValue([]);
    // Default: catalog returns an empty listing so One Dollar section gets hydrated with []
    mockGetCatalogCategoryListing.mockResolvedValue({ products: [], totalItems: 0 });
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

  it("hydrates One Dollar section with live catalog products", async () => {
    prismaMock.homePageSection.findMany.mockResolvedValue([
      {
        id: "section-one-dollar",
        key: "one-dollar-deals",
        title: "One Dollar deals",
        type: "one-dollar",
        content: {
          description: "Best value picks",
          ctaLabel: "View all One Dollar deals",
          ctaHref: "/categories/one-dollar",
          placeholderMessage: "No One Dollar products right now.",
        },
        meta: { enabled: true },
        position: 25,
        active: true,
        createdAt: new Date("2026-04-28T08:00:00.000Z"),
        updatedAt: new Date("2026-04-28T08:00:00.000Z"),
      },
    ]);

    mockGetCatalogCategoryListing.mockResolvedValue({
      products: [
        {
          id: "prod-1",
          slug: "cheap-soap",
          name: "Cheap Soap",
          description: "Daily soap bar",
          categorySlug: "personal-care",
          price: 250,
          compareAt: 350,
          inventoryQuantity: 10,
          averageRating: 4.5,
          reviewCount: 12,
          imageLabel: "Cheap Soap",
          imageTone: "rose",
          attributeSummary: [],
          href: "/categories/personal-care/cheap-soap",
        },
      ],
      totalItems: 1,
    });

    const result = await getHomepageContent();
    const oneDollarSection = result.sections.find((section) => section.kind === "one-dollar");

    expect(oneDollarSection).toMatchObject({
      kind: "one-dollar",
      title: "One Dollar deals",
      products: [
        {
          id: "prod-1",
          name: "Cheap Soap",
          price: 250,
          compareAt: 350,
          badge: "One Dollar",
        },
      ],
    });
  });

  it("renders One Dollar section empty state gracefully when catalog fetch fails", async () => {
    prismaMock.homePageSection.findMany.mockResolvedValue([
      {
        id: "section-one-dollar",
        key: "one-dollar-deals",
        title: "One Dollar deals",
        type: "one-dollar",
        content: {
          ctaLabel: "View all",
          ctaHref: "/categories/one-dollar",
          placeholderMessage: "No products right now.",
        },
        meta: { enabled: true },
        position: 25,
        active: true,
        createdAt: new Date("2026-04-28T08:00:00.000Z"),
        updatedAt: new Date("2026-04-28T08:00:00.000Z"),
      },
    ]);

    mockGetCatalogCategoryListing.mockRejectedValue(new Error("Catalog DB unavailable"));

    const result = await getHomepageContent();
    const oneDollarSection = result.sections.find((section) => section.kind === "one-dollar");

    // Section must still be present; products array will be empty (not hydrated)
    expect(oneDollarSection).toMatchObject({
      kind: "one-dollar",
      products: [],
    });
  });
});
