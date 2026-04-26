import { AppError } from "@/lib/errors/app-error";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  getReviewStatusLabel,
  isReviewModerationStatus,
  isReviewVisibleOnStorefront,
  type ReviewModerationStatus,
} from "@/lib/reviews/moderation";
import { getPrismaClient } from "@/server/db";

const DEFAULT_CUSTOMER_REVIEW_PAGE_SIZE = 20;
const MAX_CUSTOMER_REVIEW_PAGE_SIZE = 50;
const MIN_REVIEW_RATING = 1;
const MAX_REVIEW_RATING = 5;

function ensureUserId(userId: string) {
  const normalized = userId.trim();

  if (!normalized) {
    throw new AppError("Review operations require an authenticated user id.", "REVIEW_AUTH_REQUIRED", {
      statusCode: 401,
      userMessage: "Please sign in to continue.",
    });
  }

  return normalized;
}

function ensureProductId(productId: string) {
  const normalized = productId.trim();

  if (!normalized) {
    throw new AppError("Review operations require a product id.", "REVIEW_INVALID_PRODUCT_ID", {
      statusCode: 400,
      userMessage: "Please choose a product and try again.",
    });
  }

  return normalized;
}

function ensureReviewRating(rating: number) {
  if (!Number.isInteger(rating) || rating < MIN_REVIEW_RATING || rating > MAX_REVIEW_RATING) {
    throw new AppError("Review submission contained an invalid rating value.", "REVIEW_INVALID_RATING", {
      statusCode: 400,
      userMessage: `Please choose a whole-star rating between ${MIN_REVIEW_RATING} and ${MAX_REVIEW_RATING}.`,
    });
  }

  return rating;
}

function normalizePage(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.floor(value ?? 1));
}

function normalizePageSize(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return DEFAULT_CUSTOMER_REVIEW_PAGE_SIZE;
  }

  return Math.min(MAX_CUSTOMER_REVIEW_PAGE_SIZE, Math.max(1, Math.floor(value ?? DEFAULT_CUSTOMER_REVIEW_PAGE_SIZE)));
}

function resolveReviewStatus(input: { status: string; approved: boolean }): ReviewModerationStatus {
  if (isReviewModerationStatus(input.status)) {
    return input.status;
  }

  return input.approved ? "APPROVED" : "PENDING";
}

export type CustomerReviewListItem = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  status: ReviewModerationStatus;
  statusLabel: string;
  storefrontVisible: boolean;
  // Customer-facing explanation shown in /account/reviews when moderation affects visibility.
  moderationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  product: {
    id: string;
    name: string;
    slug: string;
    categorySlug: string | null;
  };
};

export type CustomerReviewListResult = {
  items: CustomerReviewListItem[];
  page: number;
  pageSize: number;
  hasNextPage: boolean;
};

export async function listCustomerReviews(
  userId: string,
  options: {
    page?: number;
    pageSize?: number;
  } = {},
): Promise<CustomerReviewListResult> {
  const db = getPrismaClient();
  const safeUserId = ensureUserId(userId);
  const page = normalizePage(options.page);
  const pageSize = normalizePageSize(options.pageSize);

  const reviews = await db.review.findMany({
    where: {
      userId: safeUserId,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * pageSize,
    take: pageSize + 1,
    select: {
      id: true,
      rating: true,
      title: true,
      body: true,
      status: true,
      approved: true,
      moderationReason: true,
      createdAt: true,
      updatedAt: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          category: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  });

  const hasNextPage = reviews.length > pageSize;
  const items = reviews.slice(0, pageSize).map((review) => {
    const status = resolveReviewStatus({
      status: review.status,
      approved: review.approved,
    });

    return {
      id: review.id,
      rating: review.rating,
      title: review.title ?? null,
      body: review.body ?? null,
      status,
      statusLabel: getReviewStatusLabel(status),
      storefrontVisible: isReviewVisibleOnStorefront(status),
      moderationReason: review.moderationReason ?? null,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      product: {
        id: review.product.id,
        name: review.product.name,
        slug: review.product.slug,
        categorySlug: review.product.category?.slug ?? null,
      },
    } satisfies CustomerReviewListItem;
  });

  return {
    items,
    page,
    pageSize,
    hasNextPage,
  };
}

export type CustomerReviewComposerContext = {
  canSubmit: boolean;
  reason: "AUTH_REQUIRED" | "PURCHASE_REQUIRED" | null;
  existingReview: {
    id: string;
    rating: number;
    title: string | null;
    body: string | null;
    status: ReviewModerationStatus;
    statusLabel: string;
  } | null;
};

export async function getCustomerReviewComposerContext(input: {
  userId?: string | null;
  productId: string;
}): Promise<CustomerReviewComposerContext> {
  const productId = ensureProductId(input.productId);
  const userId = input.userId?.trim();

  if (!userId) {
    return {
      canSubmit: false,
      reason: "AUTH_REQUIRED",
      existingReview: null,
    };
  }

  const db = getPrismaClient();
  const [existingReview, deliveredOrder] = await Promise.all([
    db.review.findFirst({
      where: {
        userId,
        productId,
      },
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        rating: true,
        title: true,
        body: true,
        status: true,
        approved: true,
      },
    }),
    db.order.findFirst({
      where: {
        userId,
        status: "DELIVERED",
        items: {
          some: {
            productId,
          },
        },
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (existingReview) {
    const status = resolveReviewStatus({
      status: existingReview.status,
      approved: existingReview.approved,
    });

    return {
      canSubmit: true,
      reason: null,
      existingReview: {
        id: existingReview.id,
        rating: existingReview.rating,
        title: existingReview.title ?? null,
        body: existingReview.body ?? null,
        status,
        statusLabel: getReviewStatusLabel(status),
      },
    };
  }

  return {
    canSubmit: Boolean(deliveredOrder),
    reason: deliveredOrder ? null : "PURCHASE_REQUIRED",
    existingReview: null,
  };
}

export async function submitCustomerReview(input: {
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  body: string;
}) {
  const db = getPrismaClient();
  const userId = ensureUserId(input.userId);
  const productId = ensureProductId(input.productId);
  const validatedRating = ensureReviewRating(input.rating);

  const product = await db.product.findFirst({
    where: {
      id: productId,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      slug: true,
      category: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!product || !product.category?.slug) {
    throw new AppError("Submitted review references a product that cannot be reviewed.", "REVIEW_PRODUCT_NOT_FOUND", {
      statusCode: 404,
      userMessage: "We could not find this product for reviewing.",
    });
  }

  const rateLimit = await checkRateLimit({
    action: "review:submit",
    identifier: `${userId}:${productId}`,
    limit: 5,
    windowMs: 15 * 60_000,
  });

  if (!rateLimit.success) {
    throw new AppError("Review submission was rate limited.", "RATE_LIMITED", {
      statusCode: 429,
      userMessage: "Too many review updates in a short time. Please wait a few minutes and try again.",
    });
  }

  const existingReview = await db.review.findFirst({
    where: {
      userId,
      productId,
    },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
    },
  });

  if (!existingReview) {
    const deliveredOrder = await db.order.findFirst({
      where: {
        userId,
        status: "DELIVERED",
        items: {
          some: {
            productId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!deliveredOrder) {
      throw new AppError("Customer attempted to review without a delivered purchase.", "REVIEW_PURCHASE_REQUIRED", {
        statusCode: 403,
        userMessage: "Only customers with a delivered order for this product can leave a review.",
      });
    }
  }

  const title = input.title?.trim() ? input.title.trim() : null;
  const body = input.body.trim();

  const data = {
    rating: validatedRating,
    title,
    body,
    approved: false,
    status: "PENDING" as const,
    moderationReason: null,
    moderatedAt: null,
    moderatedById: null,
  };

  if (existingReview) {
    await db.review.update({
      where: {
        id: existingReview.id,
      },
      data,
    });

    return {
      action: "updated" as const,
      productSlug: product.slug,
      categorySlug: product.category.slug,
    };
  }

  await db.review.create({
    data: {
      ...data,
      productId,
      userId,
    },
  });

  return {
    action: "submitted" as const,
    productSlug: product.slug,
    categorySlug: product.category.slug,
  };
}