import { describe, expect, it } from "vitest";

import { buildCategoryListingHref, parseCatalogSearchParams } from "@/features/catalog";

describe("catalog filter parsing", () => {
  it("uses stable defaults for an empty query", () => {
    expect(parseCatalogSearchParams()).toEqual({
      minPrice: undefined,
      maxPrice: undefined,
      availability: "all",
      rating: "all",
      discount: "all",
      sort: "featured",
      attribute: "",
      page: 1,
      pageSize: 6,
    });
  });

  it("normalizes inverted price bounds and ignores invalid filter values", () => {
    expect(
      parseCatalogSearchParams({
        minPrice: "2000",
        maxPrice: "1000",
        availability: "unsupported",
        rating: "4-up",
        discount: "bad-value",
        sort: "price-desc",
        attribute: "  citrus  ",
        page: "2",
      }),
    ).toEqual({
      minPrice: 1000,
      maxPrice: 2000,
      availability: "all",
      rating: "4-up",
      discount: "all",
      sort: "price-desc",
      attribute: "citrus",
      page: 2,
      pageSize: 6,
    });
  });

  it("rebuilds category hrefs from active filters without default noise", () => {
    const href = buildCategoryListingHref("grocery", {
      minPrice: 500,
      maxPrice: undefined,
      availability: "in-stock",
      rating: "all",
      discount: "on-sale",
      sort: "featured",
      attribute: "bottle",
      page: 2,
      pageSize: 6,
    });

    expect(href).toBe("/categories/grocery?minPrice=500&availability=in-stock&discount=on-sale&attribute=bottle&page=2");
  });
});
