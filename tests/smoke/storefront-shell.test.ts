import { describe, expect, it } from "vitest";

import { routes } from "@/config/routes";
import { loadSiteConfig } from "@/config/site";

describe("storefront shell navigation", () => {
  it("exposes required primary action routes", () => {
    expect(routes.storefront.categories).toBe("/categories");
    expect(routes.storefront.category("home-care")).toBe("/categories/home-care");
    expect(routes.storefront.search).toBe("/search");
    expect(routes.storefront.account).toBe("/account");
    expect(routes.storefront.wishlist).toBe("/wishlist");
    expect(routes.storefront.cart).toBe("/cart");
  });

  it("exposes required static policy and company pages", () => {
    expect(routes.storefront.about).toBe("/about");
    expect(routes.storefront.contact).toBe("/contact");
    expect(routes.storefront.privacy).toBe("/privacy");
    expect(routes.storefront.terms).toBe("/terms");
    expect(routes.storefront.shippingPolicy).toBe("/shipping-policy");
    expect(routes.storefront.returnPolicy).toBe("/return-policy");
  });

  it("keeps storefront navigation links available for desktop and mobile menus", () => {
    const site = loadSiteConfig();
    const navHrefs = site.storefrontNav.map((item) => item.href);

    expect(navHrefs).toContain(routes.storefront.home);
    expect(navHrefs).toContain(routes.storefront.categories);
    expect(navHrefs).toContain(routes.storefront.about);
    expect(navHrefs).toContain(routes.storefront.contact);
  });
});
