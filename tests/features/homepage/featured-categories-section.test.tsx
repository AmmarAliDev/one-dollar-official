// @vitest-environment jsdom

import type { ReactNode } from "react";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/ui/carousel", () => ({
  Carousel: ({ children }: { children: ReactNode }) => <div data-testid="carousel">{children}</div>,
  CarouselContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CarouselItem: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div data-testid="carousel-item" className={className}>
      {children}
    </div>
  ),
  CarouselPrevious: () => <button type="button">Previous slide</button>,
  CarouselNext: () => <button type="button">Next slide</button>,
}));

import { FeaturedCategoriesSectionBlock } from "@/features/homepage/components/featured-categories-section";
import {
  FEATURED_CATEGORIES_CAROUSEL_ITEM_CLASS,
  FEATURED_CATEGORIES_CAROUSEL_OPTIONS,
} from "@/features/homepage/components/featured-categories-carousel-config";
import type { FeaturedCategoriesSection } from "@/features/homepage/types";

function buildSection(categories: FeaturedCategoriesSection["categories"]): FeaturedCategoriesSection {
  return {
    id: "featured-categories",
    kind: "featured-categories",
    title: "Featured categories",
    description: "Shop by category",
    categories,
  };
}

afterEach(() => {
  cleanup();
});

describe("FeaturedCategoriesSectionBlock", () => {
  it("renders category cards inside carousel structure", () => {
    render(
      <FeaturedCategoriesSectionBlock
        section={buildSection([
          {
            id: "cat-1",
            title: "Home care",
            description: "Cleaning and essentials",
            href: "/categories/home-care",
          },
          {
            id: "cat-2",
            title: "Grocery",
            description: "Pantry basics",
            href: "/categories/grocery",
          },
        ])}
      />,
    );

    expect(screen.getByTestId("carousel")).toBeInTheDocument();
    expect(screen.getByText("Home care")).toBeInTheDocument();
    expect(screen.getByText("Grocery")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /browse .* category/i })).toHaveLength(2);
    expect(screen.getByText("Home care").closest("a")).toHaveAttribute("href", "/categories/home-care");
    expect(screen.getByText("Grocery").closest("a")).toHaveAttribute("href", "/categories/grocery");
  });

  it("renders a friendly empty state when categories are missing", () => {
    render(<FeaturedCategoriesSectionBlock section={buildSection([])} />);

    expect(screen.getByText("Categories coming soon")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse all categories" })).toBeInTheDocument();
    expect(screen.queryByTestId("carousel")).not.toBeInTheDocument();
  });
});

describe("featured categories carousel config", () => {
  it("exposes responsive item width classes and start-aligned behavior", () => {
    expect(FEATURED_CATEGORIES_CAROUSEL_OPTIONS.align).toBe("start");
    expect(FEATURED_CATEGORIES_CAROUSEL_ITEM_CLASS).toContain("basis-[85%]");
    expect(FEATURED_CATEGORIES_CAROUSEL_ITEM_CLASS).toContain("sm:basis-1/2");
    expect(FEATURED_CATEGORIES_CAROUSEL_ITEM_CLASS).toContain("lg:basis-1/3");
    expect(FEATURED_CATEGORIES_CAROUSEL_ITEM_CLASS).toContain("xl:basis-1/4");
  });
});
