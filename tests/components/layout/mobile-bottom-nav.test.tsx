// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cartCountStateMock = vi.hoisted(() => vi.fn());
const openCartDrawerMock = vi.hoisted(() => vi.fn());
const openSearchDialogMock = vi.hoisted(() => vi.fn());
const usePathnameMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

vi.mock("@/features/cart/cart-count-state", () => ({
  useCartCountState: () => cartCountStateMock(),
}));

vi.mock("@/features/cart/cart-drawer-state", () => ({
  openCartDrawer: () => openCartDrawerMock(),
}));

vi.mock("@/features/catalog/search-dialog-state", () => ({
  openSearchDialog: () => openSearchDialogMock(),
}));

import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

function mockCartCount(itemCount: number) {
  cartCountStateMock.mockReturnValue({ itemCount, pending: false, errorMessage: null });
}

describe("MobileBottomNav", () => {
  beforeEach(() => {
    cartCountStateMock.mockReset();
    openCartDrawerMock.mockReset();
    openSearchDialogMock.mockReset();
    usePathnameMock.mockReset().mockReturnValue("/");
    mockCartCount(0);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders all five primary actions with icon labels", () => {
    render(<MobileBottomNav />);

    expect(screen.getByRole("link", { name: "Collections" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cart" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Profile" })).toBeInTheDocument();
  });

  it("links Collections to the categories page, Home to /, and Profile to /account/profile", () => {
    render(<MobileBottomNav />);

    expect(screen.getByRole("link", { name: "Collections" })).toHaveAttribute("href", "/categories");
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute("href", "/account/profile");
  });

  it("opens the shared search dialog when Search is clicked", async () => {
    const user = userEvent.setup();
    render(<MobileBottomNav />);

    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(openSearchDialogMock).toHaveBeenCalledTimes(1);
    expect(openCartDrawerMock).not.toHaveBeenCalled();
  });

  it("opens the shared cart drawer when Cart is clicked", async () => {
    const user = userEvent.setup();
    render(<MobileBottomNav />);

    await user.click(screen.getByRole("button", { name: "Cart" }));

    expect(openCartDrawerMock).toHaveBeenCalledTimes(1);
    expect(openSearchDialogMock).not.toHaveBeenCalled();
  });

  it("shows the live cart item count badge on the Cart action", () => {
    mockCartCount(4);
    render(<MobileBottomNav />);

    const cartButton = screen.getByRole("button", { name: "Cart" });
    expect(cartButton).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("does not render a cart badge when the cart is empty", () => {
    mockCartCount(0);
    render(<MobileBottomNav />);

    // No badge count is rendered for an empty cart.
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("marks the Collections link as active on a category route", () => {
    usePathnameMock.mockReturnValue("/categories/home-care");
    render(<MobileBottomNav />);

    expect(screen.getByRole("link", { name: "Collections" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current", "page");
  });

  it("marks the Home link as active on the homepage", () => {
    usePathnameMock.mockReturnValue("/");
    render(<MobileBottomNav />);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Collections" })).not.toHaveAttribute("aria-current", "page");
  });

  it("marks the Profile link as active on account routes", () => {
    usePathnameMock.mockReturnValue("/account/orders");
    render(<MobileBottomNav />);

    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current", "page");
  });
});
