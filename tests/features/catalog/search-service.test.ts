import { describe, expect, it } from "vitest";

import { searchCatalogProducts } from "@/features/catalog";

describe("catalog search service", () => {
  it("returns product matches for a keyword", async () => {
    const result = await searchCatalogProducts("detergent");

    expect(result.total).toBeGreaterThan(0);
    expect(result.items[0]?.slug).toBe("ultra-wash-detergent-1kg");
  });

  it("returns an empty result set for unknown terms", async () => {
    const result = await searchCatalogProducts("zzzz-no-hit-term");

    expect(result.total).toBe(0);
    expect(result.items).toHaveLength(0);
  });

  it("respects the result limit", async () => {
    const result = await searchCatalogProducts("care", { limit: 1 });

    expect(result.items).toHaveLength(1);
  });
});
