import { describe, expect, it } from "vitest";

import {
  buildBlogListingJsonLd,
  buildBlogPostBreadcrumbJsonLd,
  buildBlogPostJsonLd,
  getBlogPostBySlug,
  getBlogPosts,
  getBlogPostSlugs,
  getRelatedBlogPosts,
  toBlogMetadataInput,
} from "@/features/blog";

describe("blog helpers", () => {
  it("returns published English posts sorted by publish date descending", () => {
    const posts = getBlogPosts({ locale: "en" });

    expect(posts.length).toBeGreaterThan(0);
    expect(posts[0]?.slug).toBe("home-restock-routine-checklist");
    expect(posts.every((post) => post.status === "published")).toBe(true);
  });

  it("returns static params slugs for published posts", () => {
    const slugs = getBlogPostSlugs("en");

    expect(slugs).toContain("weekly-budget-grocery-basket-karachi");
    expect(slugs).toContain("home-restock-routine-checklist");
    expect(slugs).not.toContain("seasonal-pantry-planning-ramadan");
  });

  it("returns null for unpublished post by default and allows includeDrafts", () => {
    const hiddenDraft = getBlogPostBySlug("seasonal-pantry-planning-ramadan", { locale: "en" });
    const visibleDraft = getBlogPostBySlug("seasonal-pantry-planning-ramadan", {
      locale: "en",
      includeDrafts: true,
    });

    expect(hiddenDraft).toBeNull();
    expect(visibleDraft?.status).toBe("draft");
  });

  it("builds metadata input with SEO field overrides", () => {
    const post = getBlogPostBySlug("weekly-budget-grocery-basket-karachi", {
      locale: "en",
      includeDrafts: true,
    });

    expect(post).toBeTruthy();

    const metadataInput = toBlogMetadataInput(post!);
    expect(metadataInput.title).toBe("Weekly Budget Grocery Basket Guide | One Dollar Blog");
    expect(metadataInput.path).toBe("/blog/weekly-budget-grocery-basket-karachi");
    expect(metadataInput.openGraphImage).toBe("/blog/budget-basket.svg");
    expect(metadataInput.noIndex).toBe(false);
  });

  it("returns related posts excluding the current article", () => {
    const post = getBlogPostBySlug("weekly-budget-grocery-basket-karachi", {
      locale: "en",
      includeDrafts: true,
    });

    expect(post).toBeTruthy();

    const related = getRelatedBlogPosts(post!, 2);
    expect(related.length).toBeLessThanOrEqual(2);
    expect(related.some((item) => item.slug === post!.slug)).toBe(false);
  });

  it("builds listing and post structured data payloads", () => {
    const posts = getBlogPosts({ locale: "en" });
    const listingJsonLd = buildBlogListingJsonLd(posts);
    const post = getBlogPostBySlug("home-restock-routine-checklist", {
      locale: "en",
      includeDrafts: true,
    });

    expect(post).toBeTruthy();

    const postJsonLd = buildBlogPostJsonLd(post!);
    const breadcrumbJsonLd = buildBlogPostBreadcrumbJsonLd(post!);

    expect(listingJsonLd["@type"]).toBe("CollectionPage");
    expect(postJsonLd["@type"]).toBe("BlogPosting");
    expect(postJsonLd.mainEntityOfPage["@id"]).toMatch(/\/blog\/home-restock-routine-checklist$/);
    expect(breadcrumbJsonLd["@type"]).toBe("BreadcrumbList");
  });
});
