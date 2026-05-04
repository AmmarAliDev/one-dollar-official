import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => {
  const tx = {
    banner: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  };

  const database = {
    $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx)),
  };

  return {
    tx,
    database,
  };
});

const logAdminActionMock = vi.hoisted(() => vi.fn());

vi.mock("@/server/db", () => ({
  getPrismaClient: () => prismaMock.database,
}));

vi.mock("@/lib/audit/admin-actions", () => ({
  logAdminAction: (...args: unknown[]) => logAdminActionMock(...args),
}));

import { deleteAdminBanner } from "@/features/admin/homepage/service";

describe("admin homepage banner deletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes an existing banner and records audit metadata", async () => {
    prismaMock.tx.banner.findUnique.mockResolvedValue({
      id: "banner-1",
      title: "Weekend banner",
      imageUrl: "https://cdn.example.com/banner.jpg",
      href: "/categories",
      position: 1,
      active: true,
      startAt: null,
      endAt: null,
      createdAt: new Date("2026-05-04T08:00:00.000Z"),
      updatedAt: new Date("2026-05-04T08:00:00.000Z"),
    });
    prismaMock.tx.banner.delete.mockResolvedValue({ id: "banner-1" });
    prismaMock.tx.auditLog.create.mockResolvedValue({ id: "audit-1" });

    const result = await deleteAdminBanner({
      id: "banner-1",
      actor: {
        actorId: "admin-1",
        actorRole: "SUPER_ADMIN",
      },
    });

    expect(prismaMock.database.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.tx.banner.delete).toHaveBeenCalledWith({ where: { id: "banner-1" } });
    expect(prismaMock.tx.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorId: "admin-1",
          action: "homepage.banner.deleted",
          model: "Banner",
          modelId: "banner-1",
        }),
      }),
    );
    expect(logAdminActionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "homepage.banner.deleted",
        targetType: "Banner",
        targetId: "banner-1",
        status: "success",
      }),
    );
    expect(result).toEqual({ id: "banner-1" });
  });

  it("fails with not-found when deleting a missing banner", async () => {
    prismaMock.tx.banner.findUnique.mockResolvedValue(null);

    await expect(
      deleteAdminBanner({
        id: "missing-banner",
        actor: {
          actorId: "admin-1",
        },
      }),
    ).rejects.toMatchObject({
      code: "HOMEPAGE_CONTENT_NOT_FOUND",
    });

    expect(prismaMock.tx.banner.delete).not.toHaveBeenCalled();
    expect(prismaMock.tx.auditLog.create).not.toHaveBeenCalled();
  });
});
