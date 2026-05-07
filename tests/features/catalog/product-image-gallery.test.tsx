// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentPropsWithoutRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProductImageGallery } from "@/features/catalog/components/product-image-gallery";

vi.mock("next/image", () => ({
  default: function MockNextImage(props: ComponentPropsWithoutRef<"img">) {
    const { fill: _fill, ...imgProps } = props as ComponentPropsWithoutRef<"img"> & {
      fill?: boolean;
    };

    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...imgProps} />;
  },
}));

afterEach(() => {
  cleanup();
});

describe("ProductImageGallery LCP loading behavior", () => {
  it("marks the initially active image as eager even when no explicit primary flag exists", () => {
    render(
      <ProductImageGallery
        productName="Laundry Bag"
        images={[
          {
            id: "img-1",
            label: "Front view",
            tone: "slate",
            url: "https://cdn.example.com/laundry-bag-front.webp",
            isPrimary: false,
          },
          {
            id: "img-2",
            label: "Side view",
            tone: "slate",
            url: "https://cdn.example.com/laundry-bag-side.webp",
            isPrimary: false,
          },
        ]}
      />,
    );

    const mainImage = document.querySelector(
      'img[alt="Front view"][sizes="(max-width: 768px) 100vw, 50vw"]',
    );
    expect(mainImage).not.toBeNull();
    expect(mainImage).toHaveAttribute("loading", "eager");
    expect(mainImage).toHaveAttribute("fetchpriority", "high");
  });

  it("switches to lazy loading for non-initial images selected from thumbnails", () => {
    render(
      <ProductImageGallery
        productName="Laundry Bag"
        images={[
          {
            id: "img-1",
            label: "Front view",
            tone: "slate",
            url: "https://cdn.example.com/laundry-bag-front.webp",
            isPrimary: false,
          },
          {
            id: "img-2",
            label: "Side view",
            tone: "slate",
            url: "https://cdn.example.com/laundry-bag-side.webp",
            isPrimary: false,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "View Side view" }));

    const mainImage = document.querySelector(
      'img[alt="Side view"][sizes="(max-width: 768px) 100vw, 50vw"]',
    );
    expect(mainImage).not.toBeNull();
    expect(mainImage).toHaveAttribute("loading", "lazy");
    expect(mainImage).toHaveAttribute("fetchpriority", "auto");
  });
});
