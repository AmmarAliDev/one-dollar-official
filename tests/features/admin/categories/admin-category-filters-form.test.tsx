// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

import { AdminCategoryFiltersForm } from "@/features/admin/categories/components/admin-category-filters-form";

afterEach(() => {
  cleanup();
});

describe("AdminCategoryFiltersForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
  });

  it("pushes the selected admin category filters into the query string", async () => {
    const user = userEvent.setup();

    render(<AdminCategoryFiltersForm query="" status="PUBLISHED" />);

    await user.type(screen.getByLabelText(/search/i), "soap");
    await user.click(screen.getByRole("button", { name: /apply/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/admin/categories?q=soap&status=PUBLISHED");
      expect(refreshMock).toHaveBeenCalledTimes(1);
    });
  });
});
