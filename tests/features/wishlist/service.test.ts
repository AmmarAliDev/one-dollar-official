import { describe, expect, it } from "vitest";

import { resolveWishlistSeedSelection } from "@/features/wishlist";

describe("wishlist seed selection", () => {
  it("resolves default SKU for products without an explicit option", () => {
    const selection = resolveWishlistSeedSelection({
      productSlug: "olive-blend-cooking-oil-1l",
    });

    expect(selection.productSlug).toBe("olive-blend-cooking-oil-1l");
    expect(selection.sku).toBe("OBO-1L-001");
    expect(selection.optionId).toBe("vo-1l");
  });

  it("resolves selected variant option by option id", () => {
    const selection = resolveWishlistSeedSelection({
      productSlug: "ultra-wash-detergent-1kg",
      optionId: "vo-2kg",
    });

    expect(selection.optionLabel).toBe("2 kg");
    expect(selection.sku).toBe("UWD-2KG-001");
    expect(selection.price).toBe(1599);
  });

  it("throws for unknown products", () => {
    expect(() =>
      resolveWishlistSeedSelection({
        productSlug: "missing-product-slug",
      }),
    ).toThrowError(/Wishlist product not found/);
  });
});