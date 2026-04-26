import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  review: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  order: {
    findFirst: vi.fn(),
  },
  product: {
    findFirst: vi.fn(),
  },
}));

const checkRateLimitMock = vi.hoisted(() => vi.fn());

vi.mock("@/server/db", () => ({
  getPrismaClient: () => prismaMock,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: (...args: Parameters<typeof checkRateLimitMock>) => checkRateLimitMock(...args),
}));

import {
  getCustomerReviewComposerContext,
  listCustomerReviews,
  submitCustomerReview,
} from "@/features/reviews/service";

describe("customer reviews service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkRateLimitMock.mockResolvedValue({ success: true });
  });

  it("creates a pending review for users with delivered purchases", async () => {
    prismaMock.product.findFirst.mockResolvedValue({
      id: "product-1",
      slug: "daily-face-wash",
      category: { slug: "skincare" },
    });
    prismaMock.review.findFirst.mockResolvedValue(null);
    prismaMock.order.findFirst.mockResolvedValue({ id: "order-1" });
    prismaMock.review.create.mockResolvedValue({ id: "review-1" });

    const result = await submitCustomerReview({
      userId: "user-1",
      productId: "product-1",
      rating: 5,
      title: "Excellent",
      body: "This product was delivered on time and works very well for daily use.",
    });

    expect(result.action).toBe("submitted");
    expect(prismaMock.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          productId: "product-1",
          status: "PENDING",
          approved: false,
        }),
      }),
    );
  });

  it("resets moderation fields when a customer updates an existing review", async () => {
    prismaMock.product.findFirst.mockResolvedValue({
      id: "product-1",
      slug: "daily-face-wash",
      category: { slug: "skincare" },
    });
    prismaMock.review.findFirst.mockResolvedValue({ id: "review-1" });
    prismaMock.review.update.mockResolvedValue({ id: "review-1" });

    const result = await submitCustomerReview({
      userId: "user-1",
      productId: "product-1",
      rating: 4,
      title: "Updated",
      body: "I updated my review after using the product for another week.",
    });

    expect(result.action).toBe("updated");
    expect(prismaMock.review.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "PENDING",
          approved: false,
          moderationReason: null,
          moderatedAt: null,
          moderatedById: null,
        }),
      }),
    );
  });

  it("blocks submission when the customer has no delivered purchase", async () => {
    prismaMock.product.findFirst.mockResolvedValue({
      id: "product-1",
      slug: "daily-face-wash",
      category: { slug: "skincare" },
    });
    prismaMock.review.findFirst.mockResolvedValue(null);
    prismaMock.order.findFirst.mockResolvedValue(null);

    await expect(
      submitCustomerReview({
        userId: "user-1",
        productId: "product-1",
        rating: 4,
        body: "This product text is long enough for validation in service-layer tests.",
      }),
    ).rejects.toMatchObject({ code: "REVIEW_PURCHASE_REQUIRED" });
  });

  it("rejects non-integer or out-of-range ratings before persistence", async () => {
    await expect(
      submitCustomerReview({
        userId: "user-1",
        productId: "product-1",
        rating: 4.5,
        body: "This product text is long enough for validation in service-layer tests.",
      }),
    ).rejects.toMatchObject({ code: "REVIEW_INVALID_RATING" });

    expect(prismaMock.product.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.review.create).not.toHaveBeenCalled();
    expect(prismaMock.review.update).not.toHaveBeenCalled();
  });

  it("returns account review list with status mapping and pagination metadata", async () => {
    prismaMock.review.findMany.mockResolvedValue([
      {
        id: "review-1",
        rating: 5,
        title: "Excellent",
        body: "Loved it",
        status: "APPROVED",
        approved: true,
        moderationReason: null,
        createdAt: new Date("2026-04-20T10:00:00.000Z"),
        updatedAt: new Date("2026-04-20T10:00:00.000Z"),
        product: {
          id: "product-1",
          name: "Daily Face Wash",
          slug: "daily-face-wash",
          category: { slug: "skincare" },
        },
      },
      {
        id: "review-2",
        rating: 2,
        title: null,
        body: "Not for me",
        status: "REJECTED",
        approved: false,
        moderationReason: "Contains unsupported claim",
        createdAt: new Date("2026-04-19T10:00:00.000Z"),
        updatedAt: new Date("2026-04-19T10:00:00.000Z"),
        product: {
          id: "product-2",
          name: "Hair Oil",
          slug: "hair-oil",
          category: { slug: "hair-care" },
        },
      },
    ]);

    const result = await listCustomerReviews("user-1", { page: 1, pageSize: 1 });

    expect(result.items).toHaveLength(1);
    expect(result.hasNextPage).toBe(true);
    expect(result.items[0]?.storefrontVisible).toBe(true);
  });

  it("enforces ownership in review list calls", async () => {
    await expect(listCustomerReviews("   ")).rejects.toMatchObject({ code: "REVIEW_AUTH_REQUIRED" });
  });

  it("returns submit eligibility context with ownership and purchase rules", async () => {
    prismaMock.review.findFirst.mockResolvedValue(null);
    prismaMock.order.findFirst.mockResolvedValue(null);

    const context = await getCustomerReviewComposerContext({
      userId: "user-1",
      productId: "product-1",
    });

    expect(context.canSubmit).toBe(false);
    expect(context.reason).toBe("PURCHASE_REQUIRED");
  });

  it("allows existing reviewers to edit their review even without a new delivered order check", async () => {
    prismaMock.review.findFirst.mockResolvedValue({
      id: "review-1",
      rating: 5,
      title: "Great",
      body: "Good product",
      status: "APPROVED",
      approved: true,
    });
    prismaMock.order.findFirst.mockResolvedValue(null);

    const context = await getCustomerReviewComposerContext({
      userId: "user-1",
      productId: "product-1",
    });

    expect(context.canSubmit).toBe(true);
    expect(context.reason).toBe(null);
    expect(context.existingReview?.status).toBe("APPROVED");
  });
});
