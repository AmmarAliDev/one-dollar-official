import { describe, expect, it } from "vitest";

import { buildStorefrontCategoryMenu } from "@/components/layout/storefront-category-menu";

describe("buildStorefrontCategoryMenu", () => {
  it("pins One Dollar first, sorts other categories, and appends All Categories", () => {
    const menu = buildStorefrontCategoryMenu([
      { name: "Home Care", href: "/categories/home-care" },
      { name: "one dollar", href: "/categories/one-dollar" },
      { name: "Grocery", href: "/categories/grocery" },
    ]);

    expect(menu.map((item) => item.title)).toEqual([
      "One Dollar",
      "Grocery",
      "Home Care",
      "All Categories",
    ]);

    expect(menu[0]).toMatchObject({
      title: "One Dollar",
      href: "/categories/one-dollar",
      kind: "one-dollar",
    });

    expect(menu.at(-1)).toMatchObject({
      title: "All Categories",
      href: "/categories",
      kind: "all-categories",
    });
  });

  it("falls back to the One Dollar category route when category data is unavailable", () => {
    const menu = buildStorefrontCategoryMenu([
      { name: "Personal Care", href: "/categories/personal-care" },
    ]);

    expect(menu[0]).toMatchObject({
      title: "One Dollar",
      href: "/categories/one-dollar",
      kind: "one-dollar",
    });
  });
});
