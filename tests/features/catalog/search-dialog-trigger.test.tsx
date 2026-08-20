// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { SearchDialogTrigger } from "@/features/catalog/components/search-dialog-trigger";
import {
  __resetSearchDialogStateForTests,
  useSearchDialogState,
} from "@/features/catalog/search-dialog-state";

function SearchOpenProbe() {
  const { open } = useSearchDialogState();

  return <span data-testid="search-open">{open ? "open" : "closed"}</span>;
}

describe("SearchDialogTrigger", () => {
  afterEach(() => {
    cleanup();
    __resetSearchDialogStateForTests();
  });

  it("renders a labeled button in desktop mode and opens the shared dialog", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SearchDialogTrigger mode="desktop" />
        <SearchOpenProbe />
      </>,
    );

    const button = screen.getByRole("button", { name: /open search/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId("search-open").textContent).toBe("closed");

    await user.click(button);

    expect(screen.getByTestId("search-open").textContent).toBe("open");
  });

  it("renders an icon-only button in mobile mode and opens the shared dialog", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SearchDialogTrigger mode="mobile" />
        <SearchOpenProbe />
      </>,
    );

    const button = screen.getByRole("button", { name: "Search" });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId("search-open").textContent).toBe("closed");

    await user.click(button);

    expect(screen.getByTestId("search-open").textContent).toBe("open");
  });
});
