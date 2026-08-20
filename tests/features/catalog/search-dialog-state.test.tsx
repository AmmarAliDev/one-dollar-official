// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  __resetSearchDialogStateForTests,
  closeSearchDialog,
  openSearchDialog,
  useSearchDialogState,
} from "@/features/catalog/search-dialog-state";

function SearchDialogStateProbe() {
  const { open } = useSearchDialogState();

  return <span data-testid="search-open">{open ? "open" : "closed"}</span>;
}

describe("search dialog state", () => {
  afterEach(() => {
    cleanup();
    __resetSearchDialogStateForTests();
  });

  it("starts closed", () => {
    render(<SearchDialogStateProbe />);

    expect(screen.getByTestId("search-open").textContent).toBe("closed");
  });

  it("opens and closes through the global actions", () => {
    render(<SearchDialogStateProbe />);

    act(() => openSearchDialog());
    expect(screen.getByTestId("search-open").textContent).toBe("open");

    act(() => closeSearchDialog());
    expect(screen.getByTestId("search-open").textContent).toBe("closed");
  });

  it("is a no-op when toggling to the same value", () => {
    render(<SearchDialogStateProbe />);

    act(() => openSearchDialog());
    act(() => openSearchDialog());
    expect(screen.getByTestId("search-open").textContent).toBe("open");
  });
});
