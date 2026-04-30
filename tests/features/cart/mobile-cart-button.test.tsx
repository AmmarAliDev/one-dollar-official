// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cartCountStateMock = vi.hoisted(() => vi.fn());

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/features/cart/cart-count-state", () => ({
  useCartCountState: () => cartCountStateMock(),
}));

describe("mobile cart button", () => {
  beforeEach(() => {
    cartCountStateMock.mockReset();
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

    expect(screen.getByRole("link", { name: /shopping cart with 4 items/i })).toHaveAttribute("href", "/cart");
    expect(screen.getByText("4")).toBeInTheDocument();
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
