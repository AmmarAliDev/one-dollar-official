// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentPropsWithoutRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CatalogSearchExperience } from "@/features/catalog/components/catalog-search-experience";
import type { CatalogProductCard, CatalogSearchResponse } from "@/features/catalog/types";

vi.mock("next/image", () => ({
  default: function MockNextImage(props: ComponentPropsWithoutRef<"img">) {
    const { fill: _fill, ...imgProps } = props as ComponentPropsWithoutRef<"img"> & {
      fill?: boolean;
    };

    // Render a plain img in tests so search-card image behavior can be asserted.
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...imgProps} />;
  },
}));

const fetchMock = vi.fn();

function makeSearchCard(overrides: Partial<CatalogProductCard> = {}): CatalogProductCard {
  return {
    id: "prod-1",
    slug: "daily-face-wash",
    name: "Daily Face Wash",
    description: "Gentle daily cleanser.",
    categorySlug: "personal-care",
    price: 280,
    inventoryQuantity: 12,
    averageRating: 4.6,
    reviewCount: 18,
    imageLabel: "Daily Face Wash",
    imageTone: "rose",
    attributeSummary: ["Foam", "100ml"],
    href: "/categories/personal-care/daily-face-wash",
    ...overrides,
  };
}

function mockSearchPayload(items: CatalogProductCard[]): CatalogSearchResponse {
  return {
    query: "fa",
    total: items.length,
    items,
    source: "db",
  };
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("CatalogSearchExperience result card media", () => {
  it("renders product image when search result includes imageUrl", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockSearchPayload([makeSearchCard({ imageUrl: "/uploads/catalog/daily-face-wash.png" })]),
    });

    const user = userEvent.setup();
    render(<CatalogSearchExperience />);

    await user.type(screen.getByRole("textbox", { name: /search products/i }), "fa");

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByRole("img", { name: /daily face wash catalog image/i }),
    ).toBeInTheDocument();
  });

  it("renders placeholder fallback when search result imageUrl is missing", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockSearchPayload([makeSearchCard({ imageUrl: undefined })]),
    });

    const user = userEvent.setup();
    render(<CatalogSearchExperience />);

    await user.type(screen.getByRole("textbox", { name: /search products/i }), "fa");

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByRole("img", { name: /daily face wash image placeholder/i }),
    ).toBeInTheDocument();
  });
});
