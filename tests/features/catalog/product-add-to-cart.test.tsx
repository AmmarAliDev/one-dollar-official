// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const notifySuccessMock = vi.fn();
const notifyErrorMock = vi.fn();
const dispatchCartChangedMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/lib/notify", () => ({
  notify: {
    success: notifySuccessMock,
    error: notifyErrorMock,
  },
}));

vi.mock("@/features/cart/client-events", () => ({
  dispatchCartChanged: dispatchCartChangedMock,
}));

describe("product add-to-cart mobile toast UX", () => {
  beforeEach(() => {
    pushMock.mockReset();
    notifySuccessMock.mockReset();
    notifyErrorMock.mockReset();
    dispatchCartChangedMock.mockReset();

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        cart: {
          id: "cart-1",
          token: "guest-token",
          items: [],
          itemCount: 1,
          subtotal: 100,
        },
      }),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows mobile checkout CTA action and routes to checkout from toast action", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation(() => ({
        matches: true,
        media: "(max-width: 767px)",
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    const { ProductAddToCart } = await import("@/features/catalog/components/product-add-to-cart");

    render(
      <ProductAddToCart
        productSlug="surface-cleaner"
        optionId={undefined}
        productName="Surface Cleaner"
        isAvailable={true}
      />,
    );

    await user.click(screen.getByRole("button", { name: /add to cart/i }));

    await waitFor(() => {
      expect(dispatchCartChangedMock).toHaveBeenCalledTimes(1);
      expect(notifySuccessMock).toHaveBeenCalledTimes(1);
    });

    const toastOptions = notifySuccessMock.mock.calls[0]?.[2];

    expect(toastOptions?.duration).toBe(5000);
    expect(toastOptions?.action?.label).toBe("Proceed to Checkout");

    toastOptions?.action?.onClick?.({} as never);
    expect(pushMock).toHaveBeenCalledWith("/checkout");
  });

  it("keeps desktop add-to-cart toast without checkout CTA", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation(() => ({
        matches: false,
        media: "(max-width: 767px)",
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    const { ProductAddToCart } = await import("@/features/catalog/components/product-add-to-cart");

    render(
      <ProductAddToCart
        productSlug="surface-cleaner"
        optionId={undefined}
        productName="Surface Cleaner"
        isAvailable={true}
      />,
    );

    await user.click(screen.getByRole("button", { name: /add to cart/i }));

    await waitFor(() => {
      expect(notifySuccessMock).toHaveBeenCalledTimes(1);
    });

    const toastOptions = notifySuccessMock.mock.calls[0]?.[2];

    expect(toastOptions?.duration).toBe(5000);
    expect(toastOptions?.action).toBeUndefined();
  });
});
