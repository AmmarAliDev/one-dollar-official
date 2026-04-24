import type { Prisma, RefundStatus } from "@prisma/client";

import { AppError } from "@/lib/errors/app-error";
import { getPrismaClient } from "@/server/db";

const DEFAULT_ACTIVITY_PREVIEW_LIMIT = 5;
const REVENUE_INCLUDED_REFUND_STATUSES: RefundStatus[] = ["NONE", "REVERSED"];

type LowStockInventoryRecord = {
  quantity: number;
  reserved: number;
  safetyStock: number;
};

export type AdminDashboardRevenueSummary = {
  recognizedTotal: number;
  deliveredOrderCount: number;
  refundedOrderCountExcluded: number;
  currency: "PKR";
  assumptions: readonly string[];
};

export type AdminDashboardActivityEntry = {
  id: string;
  action: string;
  title: string;
  summary: string;
  createdAt: Date;
};

export type AdminDashboardMetrics = {
  pendingOrdersCount: number;
  lowStockItemCount: number;
  revenue: AdminDashboardRevenueSummary;
  recentActivity: AdminDashboardActivityEntry[];
};

function asRecord(value: Prisma.JsonValue | null | undefined): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function toLabel(value: string | null | undefined) {
  if (!value || value.trim().length === 0) {
    return "Unknown";
  }

  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function mapActivityTitle(action: string) {
  if (action === "order.created") {
    return "Order created";
  }

  if (action === "order.status.changed") {
    return "Order status updated";
  }

  if (action === "order.internal_note.updated") {
    return "Order note updated";
  }

  if (action === "category.created") {
    return "Category created";
  }

  if (action === "category.updated") {
    return "Category updated";
  }

  if (action === "category.deleted") {
    return "Category deleted";
  }

  if (action === "review.moderated") {
    return "Review moderated";
  }

  return toLabel(action.replaceAll(".", " "));
}

function mapActivitySummary(entry: {
  action: string;
  model: string | null;
  changes: Prisma.JsonValue | null;
}) {
  const changes = asRecord(entry.changes);

  if (entry.action === "order.created") {
    const orderNumber = typeof changes.orderNumber === "string" ? changes.orderNumber : null;
    return orderNumber ? `${orderNumber} was added to the queue.` : "A new order was added to the queue.";
  }

  if (entry.action === "order.status.changed") {
    const from = typeof changes.from === "string" ? toLabel(changes.from) : null;
    const to = typeof changes.to === "string" ? toLabel(changes.to) : null;

    if (from && to) {
      return `Status changed from ${from} to ${to}.`;
    }

    return "Order status was updated.";
  }

  if (entry.action === "order.internal_note.updated") {
    const nextNote = typeof changes.nextNote === "string" ? changes.nextNote.trim() : "";
    return nextNote.length > 0 ? "Internal note was updated." : "Internal note was cleared.";
  }

  if (entry.model) {
    return `${toLabel(entry.model)} activity recorded.`;
  }

  return "System activity recorded.";
}

export function countLowStockInventoryItems(inventoryRows: LowStockInventoryRecord[]) {
  return inventoryRows.reduce((count, row) => {
    const onHand = row.quantity - row.reserved;
    return onHand <= row.safetyStock ? count + 1 : count;
  }, 0);
}

export function buildDashboardRevenueSummary(input: {
  recognizedTotal: number | null | undefined;
  deliveredOrderCount: number;
  refundedOrderCountExcluded: number;
}): AdminDashboardRevenueSummary {
  return {
    recognizedTotal: input.recognizedTotal ?? 0,
    deliveredOrderCount: input.deliveredOrderCount,
    refundedOrderCountExcluded: input.refundedOrderCountExcluded,
    currency: "PKR",
    assumptions: [
      "Recognized revenue counts delivered orders only.",
      "Orders with completed refunds are excluded.",
      "Cash on Delivery payment status is not used for revenue recognition in this phase.",
    ],
  };
}

export async function listAdminRecentActivity(
  take = DEFAULT_ACTIVITY_PREVIEW_LIMIT,
): Promise<AdminDashboardActivityEntry[]> {
  const db = getPrismaClient();
  const normalizedTake = Number.isFinite(take) ? Math.max(1, Math.floor(take)) : DEFAULT_ACTIVITY_PREVIEW_LIMIT;

  const records = await db.auditLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: normalizedTake,
    select: {
      id: true,
      action: true,
      model: true,
      changes: true,
      createdAt: true,
    },
  });

  return records.map((record) => ({
    id: record.id,
    action: record.action,
    title: mapActivityTitle(record.action),
    summary: mapActivitySummary(record),
    createdAt: record.createdAt,
  }));
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const db = getPrismaClient();

  try {
    const [pendingOrdersCount, deliveredRevenueAggregate, refundedOrderCountExcluded, inventoryRows, recentActivity] = await Promise.all([
      db.order.count({
        where: {
          status: "PENDING",
        },
      }),
      db.order.aggregate({
        where: {
          status: "DELIVERED",
          refundStatus: {
            in: REVENUE_INCLUDED_REFUND_STATUSES,
          },
        },
        _sum: {
          total: true,
        },
        _count: {
          _all: true,
        },
      }),
      db.order.count({
        where: {
          status: "DELIVERED",
          refundStatus: "COMPLETED",
        },
      }),
      db.inventory.findMany({
        select: {
          quantity: true,
          reserved: true,
          safetyStock: true,
        },
      }),
      listAdminRecentActivity(DEFAULT_ACTIVITY_PREVIEW_LIMIT),
    ]);

    return {
      pendingOrdersCount,
      lowStockItemCount: countLowStockInventoryItems(inventoryRows),
      revenue: buildDashboardRevenueSummary({
        recognizedTotal: deliveredRevenueAggregate._sum.total,
        deliveredOrderCount: deliveredRevenueAggregate._count._all,
        refundedOrderCountExcluded,
      }),
      recentActivity,
    };
  } catch (error) {
    throw new AppError("Admin dashboard metrics query failed.", "ADMIN_DASHBOARD_METRICS_QUERY_FAILED", {
      cause: error,
      statusCode: 500,
      userMessage: "Dashboard metrics are temporarily unavailable. Please refresh and try again.",
    });
  }
}