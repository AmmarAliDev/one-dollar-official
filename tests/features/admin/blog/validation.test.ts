import { describe, expect, it } from "vitest";

import {
  validateAdminBlogCreateInput,
  validateAdminBlogUpdateInput,
} from "@/features/admin/blog";

describe("admin blog validation", () => {
  it("accepts a valid blog payload", () => {
    const parsed = validateAdminBlogCreateInput({
      locale: "en",
      title: "Weekly Budget Grocery Basket",
      slug: "weekly-budget-grocery-basket",
      excerpt: "A practical weekly basket plan for predictable household budgets.",
      contentJson: JSON.stringify([{ type: "paragraph", text: "Start with staples first." }]),
      coverImageUrl: "/blog/budget-basket.svg",
      coverImageAlt: "Budget basket cover",
      coverImageWidth: "1200",
      coverImageHeight: "630",
      status: "PUBLISHED",
      publishedAt: "2026-04-26T10:00:00.000Z",
      seoTitle: "Weekly Budget Grocery Basket",
      seoDescription: "Build a predictable weekly grocery basket with less waste.",
      seoNoIndex: false,
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects malformed slug", () => {
    const parsed = validateAdminBlogCreateInput({
      locale: "en",
      title: "Weekly Budget Grocery Basket",
      slug: "Weekly Budget",
      excerpt: "A practical weekly basket plan for predictable household budgets.",
      contentJson: JSON.stringify([{ type: "paragraph", text: "Start with staples first." }]),
      status: "DRAFT",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.errors.join(" ")).toMatch(/Slug must use lowercase letters/);
    }
  });

  it("rejects invalid content JSON", () => {
    const parsed = validateAdminBlogCreateInput({
      locale: "en",
      title: "Weekly Budget Grocery Basket",
      slug: "weekly-budget-grocery-basket",
      excerpt: "A practical weekly basket plan for predictable household budgets.",
      contentJson: "{ bad json",
      status: "DRAFT",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.errors.join(" ")).toMatch(/Content must be valid JSON/);
    }
  });

  it("requires id when updating", () => {
    const parsed = validateAdminBlogUpdateInput({
      locale: "en",
      title: "Weekly Budget Grocery Basket",
      slug: "weekly-budget-grocery-basket",
      excerpt: "A practical weekly basket plan for predictable household budgets.",
      contentJson: JSON.stringify([{ type: "paragraph", text: "Start with staples first." }]),
      status: "DRAFT",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.errors.join(" ")).toMatch(/Blog post ID is required/);
    }
  });
});
