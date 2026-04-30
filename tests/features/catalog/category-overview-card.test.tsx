// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CategoryOverviewCard } from "@/features/catalog/components/category-overview-card";
import type { CatalogCategory } from "@/features/catalog/types";

function makeCategory(overrides: Partial<CatalogCategory> = {}): CatalogCategory {
  return {
    id: "cat-home-care",
    name: "Home Care",
    slug: "home-care",
    description: "Cleaning and restock-friendly essentials.",
    productCount: 12,
    href: "/categories/home-care",
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
});

describe("CategoryOverviewCard media behavior", () => {
  it("renders the category card background image when image URL exists", () => {
    render(
      <CategoryOverviewCard
        category={makeCategory({
          cardImageUrl: "https://cdn.example.com/categories/home-care.jpg",
        })}
      />,
    );

    const media = document.querySelector('[data-testid="storefront-category-card-image-home-care"]');
    expect(media).toBeInTheDocument();
    expect(media).toHaveAttribute("style", expect.stringContaining("background-image"));
  });

  it("renders a fallback visual when no category image exists", () => {
    render(<CategoryOverviewCard category={makeCategory({ cardImageUrl: undefined })} />);

    expect(document.querySelector('[data-testid="storefront-category-card-image-home-care"]')).toBeNull();
    expect(document.querySelector('[data-testid="storefront-category-card-fallback-home-care"]')).toBeInTheDocument();
    expect(screen.getByText(/category preview/i)).toBeInTheDocument();
  });
});
