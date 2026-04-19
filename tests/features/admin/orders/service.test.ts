import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(async (callback: (tx: typeof prismaMock) => Promise<unknown>) => callback(prismaMock)),
  order: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  auditLog: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/server/db", () => ({
  getPrismaClient: () => prismaMock,
}));

import { listAdminOrders, saveAdminOrderInternalNote } from "@/features/admin/orders";

describe("admin order service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.auditLog.findMany.mockResolvedValue([]);
    prismaMock.auditLog.create.mockResolvedValue({ id: "audit-1" });
  });

  it("loads the order list with staff-friendly filters", async () => {
    prismaMock.order.findMany.mockResolvedValue([
      {
        id: "order-1",
        orderNumber: "OD-20260420-000001",
        status: "PENDING",
        placedAt: new Date("2026-04-20T10:00:00.000Z"),
        total: 2150,
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        shippingAddress: {
          fullName: "Ammar Ali",
          email: "ammar@example.com",
          phone: "+923001112233",
          city: "KARACHI",
        },
        _count: {
          items: 2,
        },
      },
    ]);

    const result = await listAdminOrders({
      query: "ammar",
      status: "PENDING",
      page: 1,
      pageSize: 20,
    });

    expect(prismaMock.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: expect.arrayContaining([
            { status: "PENDING" },
            expect.objectContaining({
              OR: expect.any(Array),
            }),
          ]),
        },
        skip: 0,
        take: 21,
      }),
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      orderNumber: "OD-20260420-000001",
      statusLabel: "Pending",
      customerName: "Ammar Ali",
      paymentMethodLabel: "Cash on Delivery",
    });
  });

  it("saves internal notes and creates an audit entry", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-1",
      orderNumber: "OD-20260420-000001",
      metadata: {
        adminInternalNote: "Old note",
      },
    });
    prismaMock.order.update.mockResolvedValue({ id: "order-1" });

    const result = await saveAdminOrderInternalNote({
      orderId: "order-1",
      note: "Call before dispatch.",
      actor: {
        actorId: "admin-1",
      },
    });

    expect(result.internalNote).toBe("Call before dispatch.");
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: {
        metadata: expect.objectContaining({
          adminInternalNote: "Call before dispatch.",
        }),
      },
    });
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "order.internal_note.updated",
          model: "Order",
          modelId: "order-1",
          actorId: "admin-1",
        }),
      }),
    );
  });
});
