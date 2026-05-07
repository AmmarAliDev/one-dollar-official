/**
 * Catalog search service tests.
 *
 * Mocks the catalog-queries module so no real DB connection is needed.
 * Verifies keyword search routing and result mapping.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { searchCatalogProducts } from "@/features/catalog";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockSearchPublishedProducts = vi.fn();

vi.mock("@/server/db/catalog-queries", () => ({
  listPublishedCategories: vi.fn().mockResolvedValue([]),
  getPublishedCategoryBySlug: vi.fn().mockResolvedValue(null),
  listPublishedProductsByCategory: vi.fn().mockResolvedValue([]),
  listPublishedProductsByIds: vi.fn().mockResolvedValue([]),
  countPublishedOneDollarProducts: vi.fn().mockResolvedValue(0),
  getPublishedProductContextBySlug: vi.fn().mockResolvedValue(null),
  getPublishedProductBySlug: vi.fn().mockResolvedValue(null),
  getRelatedPublishedProducts: vi.fn().mockResolvedValue([]),
  getAllPublishedProductSlugsWithCategories: vi.fn().mockResolvedValue([]),
  searchPublishedProducts: (...args: unknown[]) => mockSearchPublishedProducts(...args),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeSearchProductRecord(
  overrides: Partial<{ id: string; slug: string; name: string; images: Array<{ id: string; url: string | null; alt: string | null; position: number }> }> = {},
) {
  const { id = "p1", slug = "ultra-wash-detergent-1kg", name = "Ultra Wash Detergent 1kg" } = overrides;
  return {
    id,
    name,
    slug,
    shortDescription: "Strong stain removal.",
    description: null,
    masterSku: null,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: { id: "cat-hc", name: "Home Care", slug: "home-care" },
    images: overrides.images ?? [],
    specifications: [{ id: "s1", key: "Weight", value: "1kg" }],
    variants: [
      {
        id: "v1",
        title: "Default",
        sku: "UWD-001",
        options: null,
        price: 899,
        compareAtPrice: 1099,
        isDefault: true,
        inventory: { quantity: 18 },
      },
    ],
    reviews: [{ rating: 5 }, { rating: 4 }],
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("catalog search service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns product matches for a keyword", async () => {
    mockSearchPublishedProducts.mockResolvedValue([
      makeSearchProductRecord(),
    ]);

    const result = await searchCatalogProducts("detergent");

    expect(result.total).toBeGreaterThan(0);
    expect(result.items[0]?.slug).toBe("ultra-wash-detergent-1kg");
    expect(result.items[0]?.imageUrl).toBeUndefined();
    expect(result.source).toBe("db");
  });

  it("maps the first valid image URL into search card results", async () => {
    mockSearchPublishedProducts.mockResolvedValue([
      makeSearchProductRecord({
        images: [
          { id: "img-1", url: "", alt: "Broken", position: 0 },
          { id: "img-2", url: "/uploads/catalog/detergent.png", alt: "Detergent pack", position: 1 },
        ],
      }),
    ]);

    const result = await searchCatalogProducts("detergent");

    expect(result.items[0]?.imageUrl).toBe("/uploads/catalog/detergent.png");
  });

  it("skips unsafe image URLs and preserves placeholder fallback behavior", async () => {
    mockSearchPublishedProducts.mockResolvedValue([
      makeSearchProductRecord({
        images: [{ id: "img-1", url: "javascript:alert('xss')", alt: "Unsafe", position: 0 }],
      }),
    ]);

    const result = await searchCatalogProducts("detergent");

    expect(result.items[0]?.imageUrl).toBeUndefined();
  });

  it("returns an empty result set for unknown terms (no DB matches)", async () => {
    mockSearchPublishedProducts.mockResolvedValue([]);

    const result = await searchCatalogProducts("zzzz-no-hit-term");

    expect(result.total).toBe(0);
    expect(result.items).toHaveLength(0);
  });

  it("respects the result limit", async () => {
    mockSearchPublishedProducts.mockResolvedValue([makeSearchProductRecord()]);

    const result = await searchCatalogProducts("care", { limit: 1 });

    expect(result.items).toHaveLength(1);
  });

  it("returns empty result for blank query without hitting DB", async () => {
    const result = await searchCatalogProducts("  ");

    expect(result.total).toBe(0);
    expect(result.items).toHaveLength(0);
    // DB should not be called for empty queries
    expect(mockSearchPublishedProducts).not.toHaveBeenCalled();
  });
});

