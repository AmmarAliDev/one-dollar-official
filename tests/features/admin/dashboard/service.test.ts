import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  order: {
    count: vi.fn(),
    aggregate: vi.fn(),
  },
  inventory: {
    findMany: vi.fn(),
  },
  auditLog: {
    findMany: vi.fn(),
  },
}));

vi.mock("@/server/db", () => ({
  getPrismaClient: () => prismaMock,
}));

import {
  buildDashboardRevenueSummary,
  countLowStockInventoryItems,
  getAdminDashboardMetrics,
  listAdminRecentActivity,
} from "@/features/admin/dashboard";

describe("admin dashboard service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("counts low-stock rows based on on-hand quantity", () => {
    expect(
      countLowStockInventoryItems([
        { quantity: 10, reserved: 3, safetyStock: 7 },
        { quantity: 8, reserved: 1, safetyStock: 3 },
        { quantity: 2, reserved: 0, safetyStock: 2 },
      ]),
    ).toBe(2);
  });

  it("builds delivered-revenue assumptions for admins", () => {
    const summary = buildDashboardRevenueSummary({
      recognizedTotal: 4200,
      deliveredOrderCount: 3,
      refundedOrderCountExcluded: 1,
    });

    expect(summary).toMatchObject({
      recognizedTotal: 4200,
      deliveredOrderCount: 3,
      refundedOrderCountExcluded: 1,
      currency: "PKR",
    });
    expect(summary.assumptions).toEqual(
      expect.arrayContaining([
        "Recognized revenue counts delivered orders only.",
        "Orders with completed refunds are excluded.",
      ]),
    );
  });

  it("loads pending orders, delivered revenue, low-stock count, and activity", async () => {
    prismaMock.order.count
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(2);
    prismaMock.order.aggregate.mockResolvedValue({
      _sum: {
        total: 12850,
      },
      _count: {
        _all: 6,
      },
    });
    prismaMock.inventory.findMany.mockResolvedValue([
      { quantity: 6, reserved: 2, safetyStock: 4 },
      { quantity: 12, reserved: 1, safetyStock: 5 },
      { quantity: 3, reserved: 0, safetyStock: 3 },
    ]);
    prismaMock.auditLog.findMany.mockResolvedValue([
      {
        id: "audit-1",
        action: "order.created",
        model: "Order",
        changes: {
          orderNumber: "OD-20260424-000001",
        },
        createdAt: new Date("2026-04-24T12:00:00.000Z"),
      },
    ]);

    const result = await getAdminDashboardMetrics();

    expect(prismaMock.order.count).toHaveBeenNthCalledWith(1, {
      where: {
        status: "PENDING",
      },
    });
    expect(prismaMock.order.aggregate).toHaveBeenCalledWith({
      where: {
        status: "DELIVERED",
        refundStatus: {
          in: ["NONE", "REVERSED"],
        },
      },
      _sum: {
        total: true,
      },
      _count: {
        _all: true,
      },
    });
    expect(result.pendingOrdersCount).toBe(4);
    expect(result.lowStockItemCount).toBe(2);
    expect(result.revenue.recognizedTotal).toBe(12850);
    expect(result.revenue.deliveredOrderCount).toBe(6);
    expect(result.recentActivity).toHaveLength(1);
    expect(result.recentActivity[0]).toMatchObject({
      title: "Order created",
      summary: "OD-20260424-000001 was added to the queue.",
    });
  });

  it("maps recent activity entries into non-technical labels", async () => {
    prismaMock.auditLog.findMany.mockResolvedValue([
      {
        id: "audit-2",
        action: "order.status.changed",
        model: "Order",
        changes: {
          from: "PENDING",
          to: "CONFIRMED",
        },
        createdAt: new Date("2026-04-24T13:00:00.000Z"),
      },
    ]);

    const activity = await listAdminRecentActivity(10);

    expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 10,
      }),
    );
    expect(activity).toEqual([
      expect.objectContaining({
        action: "order.status.changed",
        title: "Order status updated",
        summary: "Status changed from Pending to Confirmed.",
      }),
    ]);
  });
});