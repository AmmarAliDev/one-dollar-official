import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  wishlist: {
    create: vi.fn(),
    findFirst: vi.fn(),
  },
  category: {
    upsert: vi.fn(),
  },
  product: {
    upsert: vi.fn(),
  },
  productVariant: {
    upsert: vi.fn(),
  },
  wishlistItem: {
    upsert: vi.fn(),
  },
}));

vi.mock("@/server/db", () => ({
  getPrismaClient: () => prismaMock,
}));

import { addWishlistItemForUser, resolveWishlistSeedSelection } from "@/features/wishlist";

describe("wishlist service", () => {
  beforeEach(() => {
    prismaMock.wishlist.create.mockReset().mockResolvedValue({
      id: "wishlist-1",
      userId: "user-1",
    });
    prismaMock.wishlist.findFirst.mockReset().mockResolvedValue({
      id: "wishlist-1",
      userId: "user-1",
    });
    prismaMock.category.upsert.mockReset().mockResolvedValue({
      id: "category-1",
      slug: "cooking-oils",
      name: "Cooking Oils",
    });
    prismaMock.product.upsert.mockReset().mockResolvedValue({
      id: "product-1",
      slug: "olive-blend-cooking-oil-1l",
      name: "Olive Blend Cooking Oil 1L",
    });
    prismaMock.productVariant.upsert.mockReset().mockResolvedValue({
      id: "variant-1",
      sku: "OBO-1L-001",
    });
    prismaMock.wishlistItem.upsert.mockReset().mockResolvedValue({
      id: "wishlist-item-1",
    });
  });

  it("creates the wishlist before adding an item", async () => {
    await addWishlistItemForUser("user-1", {
      productSlug: "olive-blend-cooking-oil-1l",
    });

    expect(prismaMock.wishlist.create).toHaveBeenCalledWith({
      data: { userId: "user-1" },
    });
  });
});

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