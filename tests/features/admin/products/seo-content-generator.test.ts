import { describe, expect, it } from "vitest";

import { generateProductSeoContent } from "@/features/admin/products";

describe("product SEO content generator", () => {
  it("returns the requested SEO content blocks for a valid product entry", () => {
    const result = generateProductSeoContent({
      title: "Daily Face Wash",
      categoryName: "Skincare",
      shortDescription: "Gentle cleanser for everyday routines.",
      description: "A lightweight face wash that removes dirt without drying skin.",
      specifications: [
        { key: "Size", value: "200ml" },
        { key: "Skin Type", value: "Normal to oily" },
      ],
    });

    expect(result.titleImprovementSuggestions.length).toBeGreaterThanOrEqual(2);
    expect(result.seoTitle).toContain("Daily Face Wash");
    expect(result.metaDescription.toLowerCase()).toContain("pakistan");
    expect(result.shortDescription.length).toBeGreaterThan(20);
    expect(result.productHighlights.length).toBeGreaterThan(0);
    expect(result.faqIdeas.length).toBeGreaterThan(3);
    expect(result.structuredSpecificationSuggestions.length).toBeGreaterThan(2);
    expect(result.internalLinkingSuggestions.length).toBeGreaterThan(2);
    expect(result.suggestedSlug).toBe("daily-face-wash");
  });

  it("preserves existing specifications while adding schema-friendly suggestions", () => {
    const result = generateProductSeoContent({
      title: "Classic Tee",
      categoryName: "Apparel",
      specifications: [
        { key: "Material", value: "Cotton" },
        { key: "Fit", value: "Regular" },
      ],
    });

    const keys = result.structuredSpecificationSuggestions.map((item) => item.key.toLowerCase());
    expect(keys).toContain("material");
    expect(keys).toContain("brand");
    expect(result.productHighlights.some((item) => item.includes("Material"))).toBe(true);
  });

  it("throws a clear message when title is missing", () => {
    expect(() =>
      generateProductSeoContent({
        title: "   ",
        categoryName: "Skincare",
      }),
    ).toThrow(/title/i);
  });
});
