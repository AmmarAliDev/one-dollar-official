// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/components/sign-out-button", () => ({
  SignOutButton: () => <button type="button">Sign out</button>,
}));

describe("storefront mobile nav", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the mobile navigation drawer and toggles it from the trigger button", async () => {
    const user = userEvent.setup();

    const { StorefrontMobileNav } = await import("@/components/layout/storefront-mobile-nav");
    render(
      <StorefrontMobileNav
        navItems={[{ title: "Shop", href: "/categories" }]}
        categoryMenuItems={[{ title: "One Dollar", href: "/categories/one-dollar", kind: "one-dollar" }]}
        categoryMenuError={null}
        searchHref="/search"
        accountHref="/account"
        wishlistHref="/wishlist"
        cartHref="/cart"
        isSignedIn={false}
      />,
    );

    const trigger = screen.getByRole("button", { name: /open navigation menu/i });
    await user.click(trigger);

    expect(await screen.findByRole("navigation", { name: /mobile storefront/i })).toBeInTheDocument();

    await user.click(trigger);
    expect(screen.queryByRole("navigation", { name: /mobile storefront/i })).not.toBeInTheDocument();
  });
});
