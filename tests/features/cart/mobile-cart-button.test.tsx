// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cartCountStateMock = vi.hoisted(() => vi.fn());
const openCartDrawerMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/cart/cart-count-state", () => ({
  useCartCountState: () => cartCountStateMock(),
}));

vi.mock("@/features/cart/cart-drawer-state", () => ({
  openCartDrawer: () => openCartDrawerMock(),
}));

describe("mobile cart button", () => {
  beforeEach(() => {
    cartCountStateMock.mockReset();
    openCartDrawerMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders total cart item count badge", async () => {
    cartCountStateMock.mockReturnValue({
      itemCount: 4,
      pending: false,
      errorMessage: null,
    });

    const { MobileCartButton } = await import("@/features/cart/components/mobile-cart-button");

    render(<MobileCartButton />);

    expect(
      screen.getByRole("button", { name: /open shopping cart with 4 items/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("opens the cart drawer when clicked instead of navigating", async () => {
    const user = userEvent.setup();

    cartCountStateMock.mockReturnValue({
      itemCount: 0,
      pending: false,
      errorMessage: null,
    });

    const { MobileCartButton } = await import("@/features/cart/components/mobile-cart-button");

    render(<MobileCartButton />);

    await user.click(screen.getByRole("button", { name: /open shopping cart with 0 items/i }));

    expect(openCartDrawerMock).toHaveBeenCalledTimes(1);
  });

  it("surfaces loading and error status text for assistive technology", async () => {
    cartCountStateMock.mockReturnValue({
      itemCount: 0,
      pending: true,
      errorMessage: "Could not refresh your cart count right now.",
    });

    const { MobileCartButton } = await import("@/features/cart/components/mobile-cart-button");

    render(<MobileCartButton />);

    expect(screen.getByText("Loading cart count")).toBeInTheDocument();
    expect(screen.getByText("Could not refresh your cart count right now.")).toBeInTheDocument();
  });
});
