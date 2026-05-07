import { describe, expect, it } from "vitest";

import {
  buildCategoryListingHref,
  buildCategoryListingSearchParams,
  parseCatalogSearchParams,
} from "@/features/catalog";

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

  it("builds stable listing search params for infinite paging", () => {
    const params = buildCategoryListingSearchParams(
      {
        minPrice: undefined,
        maxPrice: undefined,
        availability: "all",
        rating: "all",
        discount: "all",
        sort: "featured",
        attribute: "",
        page: 1,
        pageSize: 6,
      },
      { page: 3, sort: "price-desc", discount: "on-sale" },
    );

    expect(params.toString()).toBe("discount=on-sale&sort=price-desc&page=3");
  });

  it("reads first query values from array params", () => {
    expect(
      parseCatalogSearchParams({
        minPrice: ["150", "300"],
        maxPrice: ["450"],
        availability: ["low-stock", "in-stock"],
        rating: ["3-up"],
        discount: ["20-up"],
        sort: ["rating-desc", "price-asc"],
        page: ["2", "0"],
      }),
    ).toEqual({
      minPrice: 150,
      maxPrice: 450,
      availability: "low-stock",
      rating: "3-up",
      discount: "20-up",
      sort: "rating-desc",
      attribute: "",
      page: 2,
      pageSize: 6,
    });
  });
});
