import { describe, expect, it } from "vitest";

import { getCatalogCategoryListing } from "@/features/catalog";

describe("catalog listing service", () => {
  it("returns category listing data for a valid slug", async () => {
    const listing = await getCatalogCategoryListing({ slug: "home-care" });

    expect(listing).not.toBeNull();
    expect(listing?.category.slug).toBe("home-care");
    expect(listing?.totalProductCount).toBe(3);
    expect(listing?.products).toHaveLength(3);
  });

  it("filters by stock and discount state", async () => {
    const listing = await getCatalogCategoryListing({
      slug: "home-care",
      searchParams: {
        availability: "out-of-stock",
        discount: "all",
      },
    });

    expect(listing?.filteredProductCount).toBe(1);
    expect(listing?.products.map((product) => product.slug)).toEqual(["drawstring-trash-bags-30-pack"]);
  });

  it("sorts matching products by ascending price", async () => {
    const listing = await getCatalogCategoryListing({
      slug: "grocery",
      searchParams: {
        sort: "price-asc",
      },
    });

    expect(listing?.products.map((product) => product.slug)).toEqual([
      "strong-brew-tea-bags-100-pack",
      "olive-blend-cooking-oil-1l",
      "premium-basmati-rice-5kg",
    ]);
  });
});
