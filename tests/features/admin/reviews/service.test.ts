import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(async (callback: (tx: typeof prismaMock) => Promise<unknown>) => callback(prismaMock)),
  review: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  product: {
    findMany: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
}));

vi.mock("@/server/db", () => ({
  getPrismaClient: () => prismaMock,
}));

import { isReviewVisibleOnStorefront, listAdminReviews, moderateAdminReview } from "@/features/admin/reviews/service";

describe("admin review moderation service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies status and product filters and masks reviewer details safely", async () => {
    prismaMock.review.findMany.mockResolvedValue([
      {
        id: "review-1",
        rating: 5,
        title: "Excellent",
        body: "Loved it",
        status: "PENDING",
        approved: false,
        moderationReason: null,
        moderatedAt: null,
        createdAt: new Date("2026-04-20T09:00:00.000Z"),
        updatedAt: new Date("2026-04-20T09:00:00.000Z"),
        product: {
          id: "product-1",
          name: "Daily Face Wash",
          slug: "daily-face-wash",
          category: {
            slug: "skincare",
          },
        },
        user: {
          id: "user-1",
          name: "Ammar Khan",
          email: "ammar@example.com",
        },
      },
    ]);

    const result = await listAdminReviews({
      status: "PENDING",
      productId: "product-1",
      page: 1,
      pageSize: 20,
    });

    expect(prismaMock.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: expect.arrayContaining([{ status: "PENDING" }, { productId: "product-1" }]),
        },
      }),
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.reviewer.displayName).toBe("Ammar Khan");
    expect(result.items[0]?.reviewer.maskedEmail).toBe("a***@example.com");
    expect(result.items[0]?.storefrontVisible).toBe(false);
  });

  it("falls back safely when the moderation columns are not yet in the database", async () => {
    prismaMock.review.findMany
      .mockRejectedValueOnce(Object.assign(new Error("Missing column"), { code: "P2022", meta: { column: "Review.status" } }))
      .mockResolvedValueOnce([
        {
          id: "review-legacy-1",
          rating: 4,
          title: "Solid",
          body: "Works well",
          approved: true,
          createdAt: new Date("2026-04-20T08:00:00.000Z"),
          updatedAt: new Date("2026-04-20T08:00:00.000Z"),
          product: {
            id: "product-1",
            name: "Daily Face Wash",
            slug: "daily-face-wash",
            category: {
              slug: "skincare",
            },
          },
          user: {
            id: "user-1",
            name: "Ammar Khan",
            email: "ammar@example.com",
          },
        },
      ]);

    const result = await listAdminReviews({ status: "APPROVED" });

    expect(result.usesLegacySchemaFallback).toBe(true);
    expect(result.items[0]?.status).toBe("APPROVED");
    expect(prismaMock.review.findMany).toHaveBeenCalledTimes(2);
  });

  it("updates moderation status and writes an audit log entry", async () => {
    prismaMock.review.findUnique.mockResolvedValue({
      id: "review-1",
      status: "PENDING",
      approved: false,
      title: "Excellent",
      body: "Loved it",
      rating: 5,
      product: {
        id: "product-1",
        name: "Daily Face Wash",
        slug: "daily-face-wash",
        category: {
          slug: "skincare",
        },
      },
      user: {
        id: "user-1",
        name: "Ammar Khan",
        email: "ammar@example.com",
      },
    });
    prismaMock.review.update.mockResolvedValue({
      id: "review-1",
      status: "APPROVED",
      approved: true,
      moderationReason: null,
      moderatedAt: new Date("2026-04-20T10:00:00.000Z"),
      product: {
        id: "product-1",
        name: "Daily Face Wash",
        slug: "daily-face-wash",
        category: {
          slug: "skincare",
        },
      },
      user: {
        id: "user-1",
        name: "Ammar Khan",
        email: "ammar@example.com",
      },
      createdAt: new Date("2026-04-20T09:00:00.000Z"),
      updatedAt: new Date("2026-04-20T10:00:00.000Z"),
      rating: 5,
      title: "Excellent",
      body: "Loved it",
    });
    prismaMock.auditLog.create.mockResolvedValue({ id: "audit-1" });

    const result = await moderateAdminReview({
      reviewId: "review-1",
      nextStatus: "APPROVED",
      actor: {
        actorId: "admin-1",
        actorRole: "SUPER_ADMIN",
      },
    });

    expect(prismaMock.review.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "review-1" },
        data: expect.objectContaining({
          status: "APPROVED",
          approved: true,
          moderatedById: "admin-1",
        }),
      }),
    );
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "review.moderated",
          model: "Review",
          modelId: "review-1",
          changes: expect.objectContaining({
            beforeStatus: "PENDING",
            afterStatus: "APPROVED",
            storefrontVisible: true,
          }),
        }),
      }),
    );
    expect(result.storefrontVisible).toBe(true);
  });

  it("marks rejected reviews as hidden from storefront", async () => {
    prismaMock.review.findUnique.mockResolvedValue({
      id: "review-2",
      status: "APPROVED",
      approved: true,
      title: "Okay",
      body: "Not ideal",
      rating: 2,
      product: {
        id: "product-1",
        name: "Daily Face Wash",
        slug: "daily-face-wash",
        category: {
          slug: "skincare",
        },
      },
      user: {
        id: "user-1",
        name: "Ammar Khan",
        email: "ammar@example.com",
      },
    });
    prismaMock.review.update.mockResolvedValue({
      id: "review-2",
      status: "REJECTED",
      approved: false,
      moderationReason: "Off-topic content",
      moderatedAt: new Date("2026-04-20T11:00:00.000Z"),
      product: {
        id: "product-1",
        name: "Daily Face Wash",
        slug: "daily-face-wash",
        category: {
          slug: "skincare",
        },
      },
      user: {
        id: "user-1",
        name: "Ammar Khan",
        email: "ammar@example.com",
      },
      createdAt: new Date("2026-04-20T09:00:00.000Z"),
      updatedAt: new Date("2026-04-20T11:00:00.000Z"),
      rating: 2,
      title: "Okay",
      body: "Not ideal",
    });
    prismaMock.auditLog.create.mockResolvedValue({ id: "audit-2" });

    const result = await moderateAdminReview({
      reviewId: "review-2",
      nextStatus: "REJECTED",
      reason: "Off-topic content",
      actor: {
        actorId: "admin-1",
      },
    });

    expect(prismaMock.review.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "REJECTED",
          approved: false,
        }),
      }),
    );
    expect(result.storefrontVisible).toBe(false);
  });

  it("treats only approved reviews as storefront-visible", () => {
    expect(isReviewVisibleOnStorefront("APPROVED")).toBe(true);
    expect(isReviewVisibleOnStorefront("PENDING")).toBe(false);
    expect(isReviewVisibleOnStorefront("REJECTED")).toBe(false);
    expect(isReviewVisibleOnStorefront("HIDDEN")).toBe(false);
  });
});
