// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const refreshMock = vi.fn();
const pathnameMock = vi.hoisted(() => vi.fn(() => "/categories/cleaning/surface-cleaner"));
const notifyInfoMock = vi.fn();
const notifySuccessMock = vi.fn();
const notifyErrorMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
  usePathname: () => pathnameMock(),
}));

vi.mock("@/lib/notify", () => ({
  notify: {
    info: notifyInfoMock,
    success: notifySuccessMock,
    error: notifyErrorMock,
  },
}));

describe("wishlist toggle button", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    notifyInfoMock.mockReset();
    notifySuccessMock.mockReset();
    notifyErrorMock.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("redirects to sign-in when wishlist API returns 401", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: "Not authenticated" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { WishlistToggleButton } = await import("@/features/wishlist/components/wishlist-toggle-button");

    render(
      <WishlistToggleButton
        productSlug="surface-cleaner"
        sku="CLN-SRF-500"
        productName="Surface Cleaner"
      />,
    );

    await user.click(screen.getByRole("button", { name: /save to wishlist/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        "/auth/sign-in?from=%2Fcategories%2Fcleaning%2Fsurface-cleaner",
      );
    });

    expect(notifyInfoMock).toHaveBeenCalledWith(
      "Sign in required",
      "Please sign in to save products to your wishlist.",
    );
  });

  it("updates button state and refreshes route after a successful toggle", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { WishlistToggleButton } = await import("@/features/wishlist/components/wishlist-toggle-button");

    render(
      <WishlistToggleButton
        productSlug="surface-cleaner"
        sku="CLN-SRF-500"
        productName="Surface Cleaner"
      />,
    );

    await user.click(screen.getByRole("button", { name: /save to wishlist/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /saved to wishlist/i })).toBeInTheDocument();
    });

    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(notifySuccessMock).toHaveBeenCalledWith("Surface Cleaner saved", "Wishlist updated.");
  });
});
