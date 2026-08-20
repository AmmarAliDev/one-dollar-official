// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  __resetCartDrawerStateForTests,
  closeCartDrawer,
  openCartDrawer,
  useCartDrawerState,
} from "@/features/cart/cart-drawer-state";

function CartDrawerStateProbe() {
  const { open } = useCartDrawerState();

  return <span data-testid="drawer-open">{open ? "open" : "closed"}</span>;
}

describe("cart drawer state", () => {
  afterEach(() => {
    cleanup();
    __resetCartDrawerStateForTests();
  });

  it("starts closed", () => {
    render(<CartDrawerStateProbe />);

    expect(screen.getByTestId("drawer-open").textContent).toBe("closed");
  });

  it("opens and closes through the global actions", () => {
    render(<CartDrawerStateProbe />);

    act(() => openCartDrawer());
    expect(screen.getByTestId("drawer-open").textContent).toBe("open");

    act(() => closeCartDrawer());
    expect(screen.getByTestId("drawer-open").textContent).toBe("closed");
  });
});
