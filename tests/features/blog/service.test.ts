import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockListBlogPostsByLocale = vi.fn();
const mockGetBlogPostBySlug = vi.fn();

vi.mock("@/server/db/blog-queries", () => ({
  listBlogPostsByLocale: (...args: unknown[]) => mockListBlogPostsByLocale(...args),
  getBlogPostBySlug: (...args: unknown[]) => mockGetBlogPostBySlug(...args),
  getAllBlogPostSlugsByLocale: vi.fn().mockResolvedValue([]),
}));

import { getBlogPostBySlug, getBlogPosts } from "@/features/blog";

const now = new Date("2026-04-26T12:00:00.000Z");

const records = [
  {
    id: "post-live",
    locale: "en",
    title: "Live post",
    slug: "live-post",
    excerpt: "Live excerpt",
    content: [{ type: "paragraph", text: "Live" }],
    coverImageUrl: "/blog/live.svg",
    coverImageAlt: "Live",
    coverImageWidth: 1200,
    coverImageHeight: 630,
    status: "PUBLISHED",
    publishedAt: new Date("2026-04-20T10:00:00.000Z"),
    seoTitle: null,
    seoDescription: null,
    seoCanonicalUrl: null,
    seoOgTitle: null,
    seoOgDescription: null,
    seoImageUrl: null,
    seoNoIndex: false,
    seoSchemaNotes: null,
    createdAt: new Date("2026-04-20T10:00:00.000Z"),
    updatedAt: new Date("2026-04-20T10:00:00.000Z"),
  },
  {
    id: "post-future",
    locale: "en",
    title: "Scheduled post",
    slug: "scheduled-post",
    excerpt: "Scheduled excerpt",
    content: [{ type: "paragraph", text: "Scheduled" }],
    coverImageUrl: "/blog/scheduled.svg",
    coverImageAlt: "Scheduled",
    coverImageWidth: 1200,
    coverImageHeight: 630,
    status: "PUBLISHED",
    publishedAt: new Date("2026-05-01T10:00:00.000Z"),
    seoTitle: null,
    seoDescription: null,
    seoCanonicalUrl: null,
    seoOgTitle: null,
    seoOgDescription: null,
    seoImageUrl: null,
    seoNoIndex: false,
    seoSchemaNotes: null,
    createdAt: new Date("2026-04-21T10:00:00.000Z"),
    updatedAt: new Date("2026-04-21T10:00:00.000Z"),
  },
  {
    id: "post-draft",
    locale: "en",
    title: "Draft post",
    slug: "draft-post",
    excerpt: "Draft excerpt",
    content: [{ type: "paragraph", text: "Draft" }],
    coverImageUrl: "/blog/draft.svg",
    coverImageAlt: "Draft",
    coverImageWidth: 1200,
    coverImageHeight: 630,
    status: "DRAFT",
    publishedAt: null,
    seoTitle: null,
    seoDescription: null,
    seoCanonicalUrl: null,
    seoOgTitle: null,
    seoOgDescription: null,
    seoImageUrl: null,
    seoNoIndex: true,
    seoSchemaNotes: null,
    createdAt: new Date("2026-04-22T10:00:00.000Z"),
    updatedAt: new Date("2026-04-22T10:00:00.000Z"),
  },
] as const;

describe("blog storefront service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(now);

    mockListBlogPostsByLocale.mockResolvedValue(records);
    mockGetBlogPostBySlug.mockImplementation(async (slug: string) => records.find((record) => record.slug === slug) ?? null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("hides draft and future-scheduled posts by default", async () => {
    const posts = await getBlogPosts({ locale: "en" });

    expect(posts.map((post) => post.slug)).toEqual(["live-post"]);
  });

  it("includes drafts and future posts for admin-like preview mode", async () => {
    const posts = await getBlogPosts({ locale: "en", includeDrafts: true });

    expect(posts.map((post) => post.slug)).toEqual(["scheduled-post", "live-post", "draft-post"]);
  });

  it("finds visible post by slug", async () => {
    const post = await getBlogPostBySlug("live-post", { locale: "en" });

    expect(post?.slug).toBe("live-post");
  });

  it("returns null for invisible slug by default", async () => {
    const post = await getBlogPostBySlug("draft-post", { locale: "en" });

    expect(post).toBeNull();
  });
});
