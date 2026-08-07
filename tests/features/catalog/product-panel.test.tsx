// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProductPanel } from "@/features/catalog/components/product-panel";

const { useRouterMock } = vi.hoisted(() => ({
  useRouterMock: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  })),
}));

vi.mock("next/navigation", () => ({
  useRouter: useRouterMock,
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

describe("product panel", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders variant groups with image-backed options when they exist", () => {
    render(
      <ProductPanel
        product={{
          id: "product-1",
          slug: "demo-product",
          name: "Demo product",
          description: "A test product",
          categorySlug: "category",
          price: 1200,
          inventoryQuantity: 7,
          averageRating: 4.5,
          reviewCount: 3,
          imageUrl: "",
          imageLabel: "Demo product",
          imageTone: "sky",
          attributeSummary: [],
          href: "/categories/category/demo-product",
          sku: "MASTER",
          shortDescription: "Short",
          longDescription: "Long",
          images: [],
          specifications: [],
          variantGroups: [
            {
              id: "color",
              name: "Color",
              options: [
                {
                  id: "blue",
                  label: "Blue",
                  sku: "BLUE",
                  inventoryQuantity: 5,
                  imageUrl: "https://example.com/blue.jpg",
                },
              ],
            },
          ],
          reviews: [],
          reviewSummary: { averageRating: 0, totalCount: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
        }}
      />,
    );

    expect(screen.getByRole("button", { name: /select blue/i })).toBeInTheDocument();
  });
});
