import { describe, expect, it } from "vitest";

import {
  buildStorefrontCategoryMenu,
  buildStorefrontNavbarCategoryMenu,
  NAVBAR_DIRECT_CATEGORY_LIMIT,
} from "@/components/layout/storefront-category-menu";

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

describe("buildStorefrontNavbarCategoryMenu", () => {
  const categories = [
    { name: "Home Care", href: "/categories/home-care" },
    { name: "one dollar", href: "/categories/one-dollar" },
    { name: "Grocery", href: "/categories/grocery" },
    { name: "Personal Care", href: "/categories/personal-care" },
    { name: "Cleaning Supplies", href: "/categories/cleaning-supplies" },
    { name: "Kitchen & Dining", href: "/categories/kitchen-dining" },
  ];

  it("renders a capped set of categories directly in the navbar", () => {
    const menu = buildStorefrontNavbarCategoryMenu(categories);

    expect(menu.directCategories.map((item) => item.title)).toEqual([
      "One Dollar",
      "Cleaning Supplies",
      "Grocery",
      "Home Care",
    ]);
    expect(menu.directCategories).toHaveLength(NAVBAR_DIRECT_CATEGORY_LIMIT);
    expect(menu.directCategories.some((item) => item.kind === "all-categories")).toBe(false);
  });

  it("puts remaining categories inside the More dropdown", () => {
    const menu = buildStorefrontNavbarCategoryMenu(categories);

    expect(menu.moreCategories.map((item) => item.title)).toEqual([
      "Kitchen & Dining",
      "Personal Care",
    ]);
  });

  it("always appends All Categories as the last More dropdown item", () => {
    const menu = buildStorefrontNavbarCategoryMenu(categories);

    expect(menu.allCategories).toMatchObject({
      title: "All Categories",
      href: "/categories",
      kind: "all-categories",
    });
    expect(menu.moreCategories.some((item) => item.kind === "all-categories")).toBe(false);
  });

  it("avoids duplicate links between the navbar and the More dropdown", () => {
    const menu = buildStorefrontNavbarCategoryMenu(categories);

    const directHrefs = new Set(menu.directCategories.map((item) => item.href));
    const moreHrefs = new Set([
      ...menu.moreCategories.map((item) => item.href),
      menu.allCategories.href,
    ]);

    [...directHrefs].forEach((href) => {
      expect(moreHrefs.has(href)).toBe(false);
    });
  });

  it("keeps every category reachable across the navbar and More dropdown", () => {
    const menu = buildStorefrontNavbarCategoryMenu(categories);

    const reachableHrefs = new Set([
      ...menu.directCategories.map((item) => item.href),
      ...menu.moreCategories.map((item) => item.href),
      menu.allCategories.href,
    ]);

    categories.forEach((category) => {
      expect(reachableHrefs.has(category.href)).toBe(true);
    });
  });

  it("handles fewer categories than the direct limit without duplication", () => {
    const menu = buildStorefrontNavbarCategoryMenu([
      { name: "One Dollar", href: "/categories/one-dollar" },
      { name: "Grocery", href: "/categories/grocery" },
    ]);

    expect(menu.directCategories.map((item) => item.title)).toEqual(["One Dollar", "Grocery"]);
    expect(menu.moreCategories).toEqual([]);
    expect(menu.allCategories.title).toBe("All Categories");
  });
});

