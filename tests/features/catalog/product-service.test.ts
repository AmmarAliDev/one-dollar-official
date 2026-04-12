import { describe, expect, it } from "vitest";

import { getProductBySlug, getRelatedProducts } from "@/features/catalog";

describe("product detail service", () => {
  it("returns product details by slug", async () => {
    const product = await getProductBySlug("ultra-wash-detergent-1kg");

    expect(product).not.toBeNull();
    expect(product?.slug).toBe("ultra-wash-detergent-1kg");
    expect(product?.images.length).toBeGreaterThan(1);
    expect(product?.specifications.length).toBeGreaterThan(1);
    expect(product?.reviewSummary.totalCount).toBeGreaterThan(0);
  });

  it("returns null for unknown product slug", async () => {
    const product = await getProductBySlug("missing-product");

    expect(product).toBeNull();
  });

  it("includes variant groups for variant-enabled products", async () => {
    const product = await getProductBySlug("hydra-care-face-wash");

    expect(product).not.toBeNull();
    expect(product?.variantGroups.length).toBeGreaterThan(0);
    expect(product?.variantGroups[0]?.options.length).toBeGreaterThan(1);
  });

  it("returns related products in same category excluding current product", async () => {
    const related = await getRelatedProducts("home-care", "ultra-wash-detergent-1kg");

    expect(related.length).toBeGreaterThan(0);
    expect(related.find((item) => item.slug === "ultra-wash-detergent-1kg")).toBeUndefined();
    expect(related.every((item) => item.categorySlug === "home-care")).toBe(true);
  });
});
