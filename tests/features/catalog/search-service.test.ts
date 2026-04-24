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
  getPublishedProductBySlug: vi.fn().mockResolvedValue(null),
  getRelatedPublishedProducts: vi.fn().mockResolvedValue([]),
  getAllPublishedProductSlugsWithCategories: vi.fn().mockResolvedValue([]),
  searchPublishedProducts: (...args: unknown[]) => mockSearchPublishedProducts(...args),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeSearchProductRecord(overrides: Partial<{ id: string; slug: string; name: string }> = {}) {
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
    images: [],
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
    expect(result.source).toBe("db");
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

