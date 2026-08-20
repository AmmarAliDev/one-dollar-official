// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CategoryInfiniteProductGrid } from "@/features/catalog/components/category-infinite-product-grid";
import type { CatalogCategoryListing, CatalogProductCard } from "@/features/catalog/types";

vi.mock("react-infinite-scroll-component", () => ({
  default: ({ children, hasMore, next, endMessage }: {
    children: ReactNode;
    hasMore: boolean;
    next: () => void;
    endMessage: ReactNode;
  }) => (
    <div>
      {children}
      {hasMore ? (
        <button
          type="button"
          data-testid="mock-infinite-scroll-next"
          onClick={() => {
            next();
          }}
        >
          Trigger next page
        </button>
      ) : (
        <div data-testid="mock-infinite-scroll-end">{endMessage}</div>
      )}
    </div>
  ),
}));

function makeProduct(index: number): CatalogProductCard {
  return {
    id: `product-${index}`,
    slug: `product-${index}`,
    name: `Product ${index}`,
    description: `Description ${index}`,
    categorySlug: "kitchen",
    price: 100 + index,
    inventoryQuantity: 10,
    averageRating: 4,
    reviewCount: 2,
    imageLabel: `Product ${index}`,
    imageTone: "sky",
    attributeSummary: ["Value"],
    href: `/categories/kitchen/product-${index}`,
  };
}

function makeListing(overrides?: Partial<CatalogCategoryListing>): CatalogCategoryListing {
  return {
    category: {
      id: "cat-kitchen",
      name: "Kitchen",
      slug: "kitchen",
      description: "Kitchen essentials",
      productCount: 10,
      href: "/categories/kitchen",
    },
    products: Array.from({ length: 6 }, (_, index) => makeProduct(index + 1)),
    filteredProductCount: 8,
    totalProductCount: 10,
    filters: {
      minPrice: undefined,
      maxPrice: undefined,
      availability: "all",
      rating: "all",
      discount: "all",
      sort: "featured",
      attribute: "",
      page: 1,
      pageSize: 6,
    },
    pagination: {
      currentPage: 1,
      pageSize: 6,
      totalItems: 8,
      totalPages: 2,
      hasNextPage: true,
      hasPreviousPage: false,
    },
    ...overrides,
  };
}

describe("CategoryInfiniteProductGrid", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows an SEO-safe initial 6-product render and appends the next page", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        products: [makeProduct(7), makeProduct(8)],
        pagination: {
          currentPage: 2,
          pageSize: 6,
          totalItems: 8,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      }),
    } as Response);

    render(<CategoryInfiniteProductGrid listing={makeListing()} />);

    expect(screen.getByText("Showing 6 of 8 matching products. Scroll down to load more.")).toBeInTheDocument();

    await user.click(screen.getByTestId("mock-infinite-scroll-next"));

    await waitFor(() => {
      expect(screen.getByText("Showing 8 of 8 matching products. You have reached the end of this list.")).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText('You have reached the end of this list.')).toBeInTheDocument();
  });

  it("shows error and retry behavior when loading the next page fails", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Temporary outage" }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          products: [makeProduct(7)],
          pagination: {
            currentPage: 2,
            pageSize: 6,
            totalItems: 7,
            totalPages: 2,
            hasNextPage: false,
            hasPreviousPage: true,
          },
        }),
      } as Response);

    render(<CategoryInfiniteProductGrid listing={makeListing({ filteredProductCount: 7 })} />);

    await user.click(screen.getByTestId("mock-infinite-scroll-next"));

    await waitFor(() => {
      expect(screen.getByText("Could not load more products")).toBeInTheDocument();
      expect(screen.getByText("Temporary outage")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("shows the end-of-list message when there are no additional pages", () => {
    render(
      <CategoryInfiniteProductGrid
        listing={makeListing({
          pagination: {
            currentPage: 1,
            pageSize: 6,
            totalItems: 6,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
          filteredProductCount: 6,
        })}
      />,
    );
  });

  it("resets grid state and paging query when filter/sort listing props change", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        products: [makeProduct(27)],
        pagination: {
          currentPage: 2,
          pageSize: 6,
          totalItems: 7,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      }),
    } as Response);

    const { rerender } = render(<CategoryInfiniteProductGrid listing={makeListing()} />);

    rerender(
      <CategoryInfiniteProductGrid
        listing={makeListing({
          products: Array.from({ length: 6 }, (_, index) => makeProduct(index + 21)),
          filteredProductCount: 7,
          filters: {
            minPrice: 300,
            maxPrice: 1500,
            availability: "in-stock",
            rating: "all",
            discount: "on-sale",
            sort: "price-desc",
            attribute: "",
            page: 1,
            pageSize: 6,
          },
          pagination: {
            currentPage: 1,
            pageSize: 6,
            totalItems: 7,
            totalPages: 2,
            hasNextPage: true,
            hasPreviousPage: false,
          },
        })}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("storefront-product-card-product-21")).toBeInTheDocument();
      expect(screen.queryByTestId("storefront-product-card-product-1")).not.toBeInTheDocument();
    });

    await user.click(screen.getByTestId("mock-infinite-scroll-next"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/catalog/categories/kitchen/products?minPrice=300&maxPrice=1500&availability=in-stock&discount=on-sale&sort=price-desc&page=2",
        {
          method: "GET",
          cache: "no-store",
        },
      );
    });
  });
});
