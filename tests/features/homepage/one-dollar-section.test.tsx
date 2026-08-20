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

import { OneDollarSectionBlock } from "@/features/homepage/components/one-dollar-section";
import { HOMEPAGE_CAROUSEL_MAX_ITEMS } from "@/features/homepage/components/homepage-carousel-config";
import type { OneDollarSection, FeaturedProductItem } from "@/features/homepage/types";

function buildProduct(id: string): FeaturedProductItem {
  return { id, name: `Deal ${id}`, href: `/products/${id}`, price: 100 };
}

function buildSection(
  products: FeaturedProductItem[],
  overrides?: Partial<OneDollarSection>,
): OneDollarSection {
  return {
    id: "one-dollar",
    kind: "one-dollar",
    title: "One Dollar deals",
    products,
    ctaLabel: "View all deals",
    ctaHref: "/categories/one-dollar",
    placeholderMessage: "No deals available right now.",
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
});

describe("OneDollarSectionBlock", () => {
  it("renders product cards inside a carousel when products are present", () => {
    render(<OneDollarSectionBlock section={buildSection([buildProduct("d1"), buildProduct("d2")])} />);

    expect(screen.getByTestId("carousel")).toBeInTheDocument();
    expect(screen.getByText("Deal d1")).toBeInTheDocument();
    expect(screen.getByText("Deal d2")).toBeInTheDocument();
  });

  it("renders each one-dollar product card as a full clickable link", () => {
    render(<OneDollarSectionBlock section={buildSection([buildProduct("d1")])} />);

    const link = screen.getByRole("link", { name: "View Deal d1" });
    expect(link).toHaveAttribute("href", "/products/d1");
    expect(link).toContainElement(screen.getByText("Deal d1"));
  });

  it("renders an add-to-cart button for available products with a slug", () => {
    render(
      <OneDollarSectionBlock
        section={buildSection([{ ...buildProduct("d1"), slug: "d1", inventoryQuantity: 3 }])}
      />,
    );

    const button = screen.getByRole("button", { name: "Add to cart: Deal d1" });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("omits the add-to-cart button when a product has no slug", () => {
    render(<OneDollarSectionBlock section={buildSection([buildProduct("d1")])} />);

    expect(screen.queryByRole("button", { name: /add to cart/i })).not.toBeInTheDocument();
  });

  it("always shows the View All CTA when products are present", () => {
    render(<OneDollarSectionBlock section={buildSection([buildProduct("d1")])} />);

    const link = screen.getByRole("link", { name: "View all deals" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/categories/one-dollar");
  });

  it("renders the empty state with CTA when no products are available", () => {
    render(<OneDollarSectionBlock section={buildSection([])} />);

    expect(screen.getByText("No One Dollar deals right now")).toBeInTheDocument();
    expect(screen.getByText("No deals available right now.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View all deals" })).toBeInTheDocument();
    expect(screen.queryByTestId("carousel")).not.toBeInTheDocument();
  });

  it("caps carousel items at HOMEPAGE_CAROUSEL_MAX_ITEMS when there are more products", () => {
    const products = Array.from({ length: 12 }, (_, i) => buildProduct(`d${i + 1}`));
    render(<OneDollarSectionBlock section={buildSection(products)} />);

    expect(screen.getAllByTestId("carousel-item")).toHaveLength(HOMEPAGE_CAROUSEL_MAX_ITEMS);
  });

  it("applies responsive sizes to one-dollar product images", () => {
    render(
      <OneDollarSectionBlock
        section={buildSection([
          {
            ...buildProduct("d-image"),
            images: [
              {
                url: "https://cdn.example.com/products/d-image.jpg",
                alt: "Deal d-image",
                isPrimary: true,
              },
            ],
          },
        ])}
      />,
    );

    const image = screen.getByTestId("storefront-product-card-image-d-image");
    expect(image).toHaveAttribute(
      "sizes",
      "(max-width: 639px) 85vw, (max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, (max-width: 1535px) 20vw, 17vw",
    );
  });

});
