// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentPropsWithoutRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CatalogSearchExperience } from "@/features/catalog/components/catalog-search-experience";
import { RECENT_SEARCHES_STORAGE_KEY } from "@/features/catalog/recent-searches";
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
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("CatalogSearchExperience result card media", () => {
  it("does not render a start-typing empty state before a search is entered", () => {
    render(<CatalogSearchExperience />);

    expect(screen.queryByText(/start typing to search/i)).not.toBeInTheDocument();
    expect(screen.getByText("No recent searches yet.")).toBeInTheDocument();
  });

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

  it("renders stored recent searches and applies one on click", async () => {
    window.localStorage.setItem(
      RECENT_SEARCHES_STORAGE_KEY,
      JSON.stringify(["rice", "face wash"]),
    );
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockSearchPayload([makeSearchCard()]),
    });

    const user = userEvent.setup();
    render(<CatalogSearchExperience />);

    const recentButton = await screen.findByRole("button", { name: "rice" });
    await user.click(recentButton);

    expect(screen.getByRole("textbox", { name: /search products/i })).toHaveValue("rice");

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  it("supports removing one recent search and clearing all", async () => {
    window.localStorage.setItem(
      RECENT_SEARCHES_STORAGE_KEY,
      JSON.stringify(["rice", "face wash"]),
    );

    const user = userEvent.setup();
    render(<CatalogSearchExperience />);

    await user.click(await screen.findByRole("button", { name: /remove rice from recent searches/i }));
    expect(screen.queryByRole("button", { name: "rice" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /clear all/i }));
    expect(screen.getByText(/no recent searches yet/i)).toBeInTheDocument();
  });
});
