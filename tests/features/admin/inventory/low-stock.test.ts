import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  storeSettings: {
    findUnique: vi.fn(),
  },
  inventory: {
    findMany: vi.fn(),
  },
}));

vi.mock("@/server/db", () => ({
  getPrismaClient: () => prismaMock,
}));

import {
  isInventoryLowStock,
  listAdminLowStockInventoryItems,
  resolveInventoryLowStockThreshold,
} from "@/features/admin/inventory/service";

describe("admin low-stock inventory logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses store low-stock threshold when per-item safety stock is zero", () => {
    expect(
      isInventoryLowStock({
        quantity: 6,
        reserved: 2,
        safetyStock: 0,
        fallbackLowStockThreshold: 5,
      }),
    ).toBe(true);

    expect(
      resolveInventoryLowStockThreshold({
        safetyStock: 0,
        fallbackLowStockThreshold: 5,
      }),
    ).toBe(5);
  });

  it("prefers item safety stock when it is explicitly configured", () => {
    expect(
      resolveInventoryLowStockThreshold({
        safetyStock: 2,
        fallbackLowStockThreshold: 5,
      }),
    ).toBe(2);

    expect(
      isInventoryLowStock({
        quantity: 6,
        reserved: 2,
        safetyStock: 2,
        fallbackLowStockThreshold: 5,
      }),
    ).toBe(false);
  });

  it("lists only low-stock rows with computed on-hand and alert threshold", async () => {
    prismaMock.storeSettings.findUnique.mockResolvedValue({
      lowStockThreshold: 5,
    });
    prismaMock.inventory.findMany.mockResolvedValue([
      {
        id: "inv-1",
        productVariantId: "variant-1",
        quantity: 7,
        reserved: 3,
        safetyStock: 0,
        location: "KARACHI",
        updatedAt: new Date("2026-04-28T10:00:00.000Z"),
        productVariant: {
          sku: "SKU-1",
          product: {
            name: "Daily Face Wash",
          },
        },
      },
      {
        id: "inv-2",
        productVariantId: "variant-2",
        quantity: 9,
        reserved: 1,
        safetyStock: 2,
        location: "KARACHI",
        updatedAt: new Date("2026-04-28T10:01:00.000Z"),
        productVariant: {
          sku: "SKU-2",
          product: {
            name: "Night Cream",
          },
        },
      },
    ]);

    const items = await listAdminLowStockInventoryItems({ take: 200 });

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      inventoryId: "inv-1",
      productVariantId: "variant-1",
      productName: "Daily Face Wash",
      sku: "SKU-1",
      onHand: 4,
      safetyStock: 0,
      alertThreshold: 5,
    });
  });
});
