import { describe, expect, it } from "vitest";

import {
  SEO_CONTENT_REVALIDATE_SECONDS,
  toBlogStaticParams,
  toCategoryStaticParams,
  toProductStaticParams,
} from "@/features/rendering/seo-content-rendering";

describe("seo-content-rendering helpers", () => {
  it("uses the canonical ISR revalidation window for SEO content pages", () => {
    expect(SEO_CONTENT_REVALIDATE_SECONDS).toBe(900);
  });

  it("maps category and blog slug lists into static params", () => {
    expect(toCategoryStaticParams(["grocery", "home-care"])).toEqual([
      { slug: "grocery" },
      { slug: "home-care" },
    ]);

    expect(toBlogStaticParams(["budgeting-basics"])).toEqual([{ slug: "budgeting-basics" }]);
  });

  it("creates product static params and excludes rows missing category slug", () => {
    expect(
      toProductStaticParams([
        { slug: "dish-soap", categorySlug: "home-care" },
        { slug: "orphaned-item", categorySlug: "" },
        { slug: "apple-juice", categorySlug: "grocery" },
      ]),
    ).toEqual([
      { slug: "home-care", productSlug: "dish-soap" },
      { slug: "grocery", productSlug: "apple-juice" },
    ]);
  });
});
