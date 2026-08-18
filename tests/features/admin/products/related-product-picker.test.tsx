// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { RelatedProductPicker } from "@/features/admin/products/components/related-product-picker";

type RelatedOption = {
  id: string;
  title: string;
  slug: string;
  categoryName: string | null;
};

const RELATED_SEARCH_PATH = "/api/admin/products/related-search";

beforeAll(() => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  vi.stubGlobal("PointerEvent", class PointerEventMock extends MouseEvent {});

  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  window.HTMLElement.prototype.setPointerCapture = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function mockRelatedSearch(products: RelatedOption[] = [], status = 200) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async () => jsonResponse({ products }, status));
}

function lastSearchCall(fetchMock: ReturnType<typeof vi.fn>) {
  const input = fetchMock.mock.calls.at(-1)?.[0];
  return new URL(String(input), "http://localhost");
}

describe("RelatedProductPicker", () => {
  it("renders the search input", () => {
    mockRelatedSearch([]);

    render(<RelatedProductPicker selectedIds={[]} onChangeIds={vi.fn()} categoryId="category-1" />);

    expect(screen.getByLabelText(/search related products/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search by title or slug/i)).toBeInTheDocument();
  });

  it("fetches on mount with categoryId from form context", async () => {
    const fetchMock = mockRelatedSearch([]);
    const onChangeIds = vi.fn();

    render(<RelatedProductPicker selectedIds={[]} onChangeIds={onChangeIds} categoryId="category-1" />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const url = lastSearchCall(fetchMock);
    expect(url.pathname).toBe(RELATED_SEARCH_PATH);
    expect(url.searchParams.get("categoryId")).toBe("category-1");
    expect(url.searchParams.get("q")).toBeNull();
  });

  it("debounces and fetches on query change", async () => {
    const user = userEvent.setup();
    const fetchMock = mockRelatedSearch([
      { id: "product-1", title: "Face Wash", slug: "face-wash", categoryName: "Skincare" },
    ]);

    render(<RelatedProductPicker selectedIds={[]} onChangeIds={vi.fn()} categoryId="category-1" />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    await user.type(screen.getByLabelText(/search related products/i), "wash");

    await waitFor(() => {
      expect(fetchMock.mock.calls.length).toBeGreaterThan(1);
    });

    const url = lastSearchCall(fetchMock);
    expect(url.searchParams.get("q")).toBe("wash");
    expect(url.searchParams.get("categoryId")).toBe("category-1");
  });

  it("toggles selection correctly", async () => {
    const user = userEvent.setup();
    const onChangeIds = vi.fn();
    const products: RelatedOption[] = [
      { id: "product-1", title: "Face Wash", slug: "face-wash", categoryName: "Skincare" },
      { id: "product-2", title: "Face Wash Foam", slug: "face-wash-foam", categoryName: "Skincare" },
    ];

    mockRelatedSearch(products);

    const { container, rerender } = render(
      <RelatedProductPicker selectedIds={[]} onChangeIds={onChangeIds} categoryId="category-1" />,
    );

    await waitFor(() => {
      expect(screen.getByText("Face Wash")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Face Wash"));
    expect(onChangeIds).toHaveBeenLastCalledWith(["product-1"]);

    rerender(<RelatedProductPicker selectedIds={["product-1"]} onChangeIds={onChangeIds} categoryId="category-1" />);

    const checkedBoxes = [...container.querySelectorAll('button[role="checkbox"]')].filter(
      (element) => element.getAttribute("data-state") === "checked",
    );
    expect(checkedBoxes).toHaveLength(1);

    await user.click(screen.getByText("Face Wash"));
    expect(onChangeIds).toHaveBeenLastCalledWith([]);
  });

  it("keeps selected items visible at the top when they are not in the current results", async () => {
    const user = userEvent.setup();
    const onChangeIds = vi.fn();
    const fetchMock = mockRelatedSearch([
      { id: "product-1", title: "Face Wash", slug: "face-wash", categoryName: "Skincare" },
    ]);

    const { rerender } = render(
      <RelatedProductPicker selectedIds={[]} onChangeIds={onChangeIds} categoryId="category-1" />,
    );

    await waitFor(() => {
      expect(screen.getByText("Face Wash")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Face Wash"));
    expect(onChangeIds).toHaveBeenLastCalledWith(["product-1"]);

    // Next search returns a different page that no longer contains the selected item.
    fetchMock.mockImplementation(async () =>
      jsonResponse({
        products: [{ id: "product-9", title: "Moisturizer", slug: "moisturizer", categoryName: "Skincare" }],
      }),
    );

    rerender(<RelatedProductPicker selectedIds={["product-1"]} onChangeIds={onChangeIds} categoryId="category-1" />);

    await user.type(screen.getByLabelText(/search related products/i), "moist");

    await waitFor(() => {
      expect(screen.getByText("Moisturizer")).toBeInTheDocument();
    });

    // The previously selected item stays visible even though it is not in the current page.
    expect(screen.getByText("Face Wash")).toBeInTheDocument();
  });

  it("shows a spinner while loading", async () => {
    let resolveFetch: (value: Response) => void = () => {};
    const pendingFetch = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });

    vi.spyOn(globalThis, "fetch").mockReturnValue(pendingFetch);

    render(<RelatedProductPicker selectedIds={[]} onChangeIds={vi.fn()} categoryId="category-1" />);

    expect(screen.getByText(/loading products/i)).toBeInTheDocument();

    resolveFetch(jsonResponse({ products: [] }));

    await waitFor(() => {
      expect(screen.queryByText(/loading products/i)).not.toBeInTheDocument();
    });
  });

  it('shows "No products found" when the API returns an empty list', async () => {
    mockRelatedSearch([]);

    render(<RelatedProductPicker selectedIds={[]} onChangeIds={vi.fn()} categoryId="category-1" />);

    await waitFor(() => {
      expect(screen.getByText("No products found.")).toBeInTheDocument();
    });
  });
});
