// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notifyErrorMock = vi.hoisted(() => vi.fn());
const openCartDrawerMock = vi.hoisted(() => vi.fn());
const dispatchCartChangedMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/notify", () => ({
  notify: {
    success: vi.fn(),
    error: (...args: unknown[]) => notifyErrorMock(...args),
  },
}));

vi.mock("@/features/cart/cart-drawer-state", () => ({
  openCartDrawer: (...args: unknown[]) => openCartDrawerMock(...args),
}));

vi.mock("@/features/cart/client-events", () => ({
  dispatchCartChanged: (...args: unknown[]) => dispatchCartChangedMock(...args),
}));

function createCart() {
  return {
    id: "cart-1",
    token: "guest-token",
    itemCount: 1,
    subtotal: 150,
    items: [
      {
        id: "item-1",
        productName: "Snow Spray Large",
        productSlug: "snow-spray-large",
        categorySlug: "decorations",
        sku: "SS-500",
        optionLabel: null,
        quantity: 1,
        unitPrice: 150,
        compareAtPrice: null,
        lineSubtotal: 150,
        availableQuantity: 50,
        href: "/categories/decorations/snow-spray-large",
      },
    ],
  };
}

describe("product card add to cart", () => {
  beforeEach(() => {
    notifyErrorMock.mockReset();
    openCartDrawerMock.mockReset();
    dispatchCartChangedMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("posts to the cart API, dispatches the cart change, and opens the drawer", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ cart: createCart() }),
      }),
    );

    const { ProductCardAddToCart } = await import(
      "@/features/catalog/components/product-card-add-to-cart"
    );

    render(
      <ProductCardAddToCart
        productSlug="snow-spray-large"
        productName="Snow Spray Large"
        isAvailable
      />,
    );

    await user.click(screen.getByRole("button", { name: /add to cart/i }));

    await waitFor(() => {
      expect(dispatchCartChangedMock).toHaveBeenCalledTimes(1);
      expect(openCartDrawerMock).toHaveBeenCalledTimes(1);
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/cart",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ productSlug: "snow-spray-large", quantity: 1 }),
      }),
    );
  });

  it("disables the button and never calls the API when the product is out of stock", async () => {
    vi.stubGlobal("fetch", vi.fn());

    const { ProductCardAddToCart } = await import(
      "@/features/catalog/components/product-card-add-to-cart"
    );

    render(
      <ProductCardAddToCart
        productSlug="snow-spray-large"
        productName="Snow Spray Large"
        isAvailable={false}
      />,
    );

    const button = screen.getByRole("button", { name: /out of stock/i });
    expect(button).toBeDisabled();

    expect(fetch).not.toHaveBeenCalled();
    expect(openCartDrawerMock).not.toHaveBeenCalled();
  });

  it("shows an error toast and does not open the drawer when the API fails", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Could not add item to cart right now." }),
      }),
    );

    const { ProductCardAddToCart } = await import(
      "@/features/catalog/components/product-card-add-to-cart"
    );

    render(
      <ProductCardAddToCart
        productSlug="snow-spray-large"
        productName="Snow Spray Large"
        isAvailable
      />,
    );

    await user.click(screen.getByRole("button", { name: /add to cart/i }));

    await waitFor(() => {
      expect(notifyErrorMock).toHaveBeenCalledTimes(1);
    });

    expect(openCartDrawerMock).not.toHaveBeenCalled();
    expect(dispatchCartChangedMock).not.toHaveBeenCalled();
  });
});
