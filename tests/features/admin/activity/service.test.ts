import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  auditLog: {
    findMany: vi.fn(),
  },
  user: {
    findMany: vi.fn(),
  },
}));

vi.mock("@/server/db", () => ({
  getPrismaClient: () => prismaMock,
}));

import { listAdminActivityFeed } from "@/features/admin/activity";

describe("admin activity feed service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns activity entries with actor context and next cursor", async () => {
    prismaMock.auditLog.findMany.mockResolvedValue([
      {
        id: "audit-1",
        actorId: "user-1",
        action: "order.created",
        model: "Order",
        modelId: "order-1",
        changes: {
          orderNumber: "OD-20260424-000001",
        },
        createdAt: new Date("2026-04-24T16:00:00.000Z"),
      },
      {
        id: "audit-2",
        actorId: null,
        action: "homepage.section.updated",
        model: "HomePageSection",
        modelId: "hero",
        changes: {
          after: {
            title: "Hero",
          },
        },
        createdAt: new Date("2026-04-24T15:00:00.000Z"),
      },
      {
        id: "audit-3",
        actorId: "user-2",
        action: "product.updated",
        model: "Product",
        modelId: "product-9",
        changes: null,
        createdAt: new Date("2026-04-24T14:00:00.000Z"),
      },
    ]);

    prismaMock.user.findMany.mockResolvedValue([
      {
        id: "user-1",
        name: "Ops Manager",
        email: "ops@example.com",
      },
    ]);

    const result = await listAdminActivityFeed({ take: 2 });

    expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 3,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      }),
    );
    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: ["user-1"],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    expect(result.nextCursor).toBe("audit-2");
    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toMatchObject({
      title: "Order created",
      summary: "Order OD-20260424-000001 was added to the queue.",
      actor: {
        label: "Ops Manager",
      },
    });
    expect(result.items[1]).toMatchObject({
      actor: {
        label: "System",
        isSystem: true,
      },
    });
  });

  it("handles empty activity results without actor lookups", async () => {
    prismaMock.auditLog.findMany.mockResolvedValue([]);

    const result = await listAdminActivityFeed({ take: 30 });

    expect(result).toEqual({
      items: [],
      nextCursor: null,
    });
    expect(prismaMock.user.findMany).not.toHaveBeenCalled();
  });
});
