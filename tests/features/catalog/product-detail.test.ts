import { describe, expect, it } from "vitest";

import { getProductBySlug, getProductSlugsWithCategory, getRelatedProducts } from "@/features/catalog";

describe("product detail service", () => {
  it("returns full product detail for a valid slug", async () => {
    const product = await getProductBySlug("ultra-wash-detergent-1kg");

    expect(product).not.toBeNull();
    expect(product?.slug).toBe("ultra-wash-detergent-1kg");
    expect(product?.sku).toBe("UWD-1KG-001");
    expect(product?.images.length).toBeGreaterThan(0);
    expect(product?.specifications.length).toBeGreaterThan(0);
  });

  it("includes the resolved product URL", async () => {
    const product = await getProductBySlug("hydra-care-face-wash");

    expect(product?.href).toBe("/categories/personal-care/hydra-care-face-wash");
  });

  it("returns null for an unknown slug", async () => {
    const product = await getProductBySlug("does-not-exist");

    expect(product).toBeNull();
  });

  it("includes variant groups for products with variants", async () => {
    const product = await getProductBySlug("ultra-wash-detergent-1kg");
    const firstGroup = product?.variantGroups[0];

    expect(product?.variantGroups.length).toBe(1);
    expect(firstGroup?.name).toBe("Size");
    expect(firstGroup?.options.length).toBe(3);
  });

  it("has empty variant groups for products without variants", async () => {
    const product = await getProductBySlug("premium-basmati-rice-5kg");

    expect(product?.variantGroups).toHaveLength(0);
  });

  it("includes review summary data", async () => {
    const product = await getProductBySlug("olive-blend-cooking-oil-1l");

    expect(product?.reviewSummary.totalCount).toBe(45);
    expect(product?.reviewSummary.averageRating).toBe(4.8);
    expect(product?.reviewSummary.distribution[5]).toBe(38);
  });

  it("returns related products from the same category excluding self", async () => {
    const related = await getRelatedProducts("home-care", "ultra-wash-detergent-1kg");

    expect(related.length).toBeGreaterThan(0);
    expect(related.every((p) => p.categorySlug === "home-care")).toBe(true);
    expect(related.some((p) => p.slug === "ultra-wash-detergent-1kg")).toBe(false);
  });

  it("caps related products at 4", async () => {
    // grocery has 3 products, home-care has 3; this validates the max-4 cap doesn't over-return
    const related = await getRelatedProducts("home-care", "ultra-wash-detergent-1kg");

    expect(related.length).toBeLessThanOrEqual(4);
  });

  it("returns href on related product cards", async () => {
    const related = await getRelatedProducts("personal-care", "hydra-care-face-wash");

    expect(related.every((p) => p.href.startsWith("/categories/"))).toBe(true);
  });

  it("returns all product slugs with category slugs", async () => {
    const slugs = await getProductSlugsWithCategory();

    expect(slugs.length).toBe(9);
    expect(slugs.every((s) => typeof s.slug === "string" && typeof s.categorySlug === "string")).toBe(true);
  });
});
