// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/cart/client-events", () => ({
  addCartChangedListener: vi.fn(() => () => undefined),
}));

describe("cart mini cart", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, cart: { itemCount: 2, subtotal: 0, items: [] } }),
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("opens and closes the cart drawer from the trigger button", async () => {
    const user = userEvent.setup();

    const { CartMiniCart } = await import("@/features/cart/components/cart-mini-cart");
    render(<CartMiniCart />);

    const trigger = await screen.findByRole("button", { name: /cart/i });
    await user.click(trigger);

    expect(await screen.findByRole("dialog", { name: /mini cart/i })).toBeInTheDocument();

    await user.click(trigger);
    expect(screen.queryByRole("dialog", { name: /mini cart/i })).not.toBeInTheDocument();
  });
});
