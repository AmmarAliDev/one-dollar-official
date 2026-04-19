import type { OrderStatus, Prisma } from "@prisma/client";

import { createInvoiceNumber, formatOrderStatusLabel, getNextOrderStatuses } from "@/features/orders";
import { AppError } from "@/lib/errors/app-error";
import { getPrismaClient } from "@/server/db";

const DEFAULT_ADMIN_ORDER_PAGE_SIZE = 20;
const MAX_ADMIN_ORDER_PAGE_SIZE = 100;

type AuditActorInput = {
  actorId: string;
  actorRole?: string | null;
};

export type AdminOrderStatusFilter = "ALL" | OrderStatus;

export type AdminOrderListFilters = {
  query?: string;
  status?: AdminOrderStatusFilter;
  page?: number;
  pageSize?: number;
};

export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  placedAt: Date;
  total: number;
  itemCount: number;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  city: string | null;
  paymentMethodLabel: string;
  paymentStatus: string | null;
};

export type AdminOrderListResult = {
  items: AdminOrderListItem[];
  page: number;
  pageSize: number;
  hasNextPage: boolean;
};

export type AdminOrderHistoryEntry = {
  id: string;
  action: string;
  summary: string;
  actorId: string | null;
  createdAt: Date;
};

export type AdminOrderDetailItem = {
  id: string;
  productName: string;
  variantTitle: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type AdminOrderDetailRecord = {
  id: string;
  userId: string | null;
  orderNumber: string;
  invoiceNumber: string;
  status: OrderStatus;
  statusLabel: string;
  nextStatuses: readonly OrderStatus[];
  placedAt: Date;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  paymentMethod: string | null;
  paymentMethodLabel: string;
  paymentStatus: string | null;
  refundStatus: string;
  itemCount: number;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  shippingAddress: {
    street1: string;
    street2: string | null;
    city: string;
    province: string | null;
    country: string;
    postcode: string | null;
  };
  items: AdminOrderDetailItem[];
  customerNote: string | null;
  internalNote: string | null;
  history: AdminOrderHistoryEntry[];
};

export type SaveAdminOrderInternalNoteResult = {
  orderId: string;
  orderNumber: string;
  internalNote: string | null;
};

function isKnownStatus(value: string | undefined): value is OrderStatus {
  return value === "PENDING" || value === "CONFIRMED" || value === "PACKED" || value === "SHIPPED" || value === "DELIVERED" || value === "CANCELLED";
}

function normalizePage(value: number | undefined) {
  if (!value || !Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

function normalizePageSize(value: number | undefined) {
  if (!value || !Number.isFinite(value) || value < 1) {
    return DEFAULT_ADMIN_ORDER_PAGE_SIZE;
  }

  return Math.min(MAX_ADMIN_ORDER_PAGE_SIZE, Math.floor(value));
}

function formatEnumLabel(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getPaymentMethodLabel(value: string | null) {
  if (value === "COD") {
    return "Cash on Delivery";
  }

  return formatEnumLabel(value) ?? "Unknown";
}

function readMetadataRecord(value: Prisma.JsonValue | null | undefined): Prisma.JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Prisma.JsonObject;
}

function readMetadataString(value: Prisma.JsonValue | null | undefined, key: string) {
  const record = readMetadataRecord(value);
  const candidate = record[key];
  return typeof candidate === "string" && candidate.trim().length > 0 ? candidate.trim() : null;
}

function describeAuditSummary(entry: { action: string; changes: Prisma.JsonValue | null }) {
  const changes = readMetadataRecord(entry.changes);

  if (entry.action === "order.created") {
    return `Order created with ${formatOrderStatusLabel("PENDING").toLowerCase()} status.`;
  }

  if (entry.action === "order.status.changed") {
    const from = typeof changes.from === "string" && isKnownStatus(changes.from) ? changes.from : null;
    const to = typeof changes.to === "string" && isKnownStatus(changes.to) ? changes.to : null;

    if (from && to) {
      return `Status changed from ${formatOrderStatusLabel(from)} to ${formatOrderStatusLabel(to)}.`;
    }

    return "Order status updated.";
  }

  if (entry.action === "order.internal_note.updated") {
    const nextNote = typeof changes.nextNote === "string" ? changes.nextNote.trim() : "";
    return nextNote.length > 0 ? "Internal note updated for the order." : "Internal note cleared for the order.";
  }

  return formatEnumLabel(entry.action.replaceAll(".", " ")) ?? "Order activity updated.";
}

export async function listAdminOrders(filters: AdminOrderListFilters = {}): Promise<AdminOrderListResult> {
  const db = getPrismaClient();
  const query = filters.query?.trim();
  const status = isKnownStatus(filters.status) ? filters.status : undefined;
  const page = normalizePage(filters.page);
  const pageSize = normalizePageSize(filters.pageSize);
  const conditions: Prisma.OrderWhereInput[] = [];

  if (status) {
    conditions.push({ status });
  }

  if (query) {
    conditions.push({
      OR: [
        {
          orderNumber: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          shippingAddress: {
            is: {
              fullName: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        },
        {
          shippingAddress: {
            is: {
              email: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        },
        {
          shippingAddress: {
            is: {
              phone: {
                contains: query,
              },
            },
          },
        },
      ],
    });
  }

  const queryOptions = {
    ...(conditions.length > 0 ? { where: { AND: conditions } } : {}),
    orderBy: [{ placedAt: "desc" }, { createdAt: "desc" }],
    skip: (page - 1) * pageSize,
    take: pageSize + 1,
    include: {
      shippingAddress: {
        select: {
          fullName: true,
          email: true,
          phone: true,
          city: true,
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
  } satisfies Prisma.OrderFindManyArgs;

  const orders = await db.order.findMany(queryOptions);

  const hasNextPage = orders.length > pageSize;

  return {
    page,
    pageSize,
    hasNextPage,
    items: orders.slice(0, pageSize).map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      statusLabel: formatOrderStatusLabel(order.status),
      placedAt: order.placedAt,
      total: order.total,
      itemCount: order._count.items,
      customerName: order.shippingAddress?.fullName ?? "Unknown customer",
      customerEmail: order.shippingAddress?.email ?? null,
      customerPhone: order.shippingAddress?.phone ?? null,
      city: formatEnumLabel(order.shippingAddress?.city ?? null),
      paymentMethodLabel: getPaymentMethodLabel(order.paymentMethod),
      paymentStatus: formatEnumLabel(order.paymentStatus),
    })),
  };
}

export async function getAdminOrderByNumber(orderNumber: string): Promise<AdminOrderDetailRecord | null> {
  const db = getPrismaClient();
  const normalizedOrderNumber = orderNumber.trim();

  if (!normalizedOrderNumber) {
    return null;
  }

  const order = await db.order.findUnique({
    where: {
      orderNumber: normalizedOrderNumber,
    },
    include: {
      items: {
        orderBy: {
          createdAt: "asc",
        },
      },
      shippingAddress: true,
    },
  });

  if (!order) {
    return null;
  }

  if (!order.shippingAddress) {
    throw new AppError("Order shipping address missing.", "ORDER_ADDRESS_MISSING", {
      statusCode: 500,
      userMessage: "This order is missing a delivery address snapshot.",
    });
  }

  const history = await db.auditLog.findMany({
    where: {
      model: "Order",
      modelId: order.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  const customerNote = readMetadataString(order.metadata, "notes") ?? order.shippingAddress.notes ?? null;
  const internalNote = readMetadataString(order.metadata, "adminInternalNote");
  const invoiceNumber = readMetadataString(order.metadata, "invoiceNumber") ?? createInvoiceNumber(order.orderNumber);

  return {
    id: order.id,
    userId: order.userId,
    orderNumber: order.orderNumber,
    invoiceNumber,
    status: order.status,
    statusLabel: formatOrderStatusLabel(order.status),
    nextStatuses: getNextOrderStatuses(order.status),
    placedAt: order.placedAt,
    subtotal: order.subtotal,
    shipping: order.shipping,
    tax: order.tax,
    discount: order.discount,
    total: order.total,
    currency: order.currency,
    paymentMethod: order.paymentMethod,
    paymentMethodLabel: getPaymentMethodLabel(order.paymentMethod),
    paymentStatus: formatEnumLabel(order.paymentStatus) ?? "Pending",
    refundStatus: formatEnumLabel(order.refundStatus) ?? "None",
    itemCount: order.items.length,
    customerName: order.shippingAddress.fullName,
    customerEmail: order.shippingAddress.email,
    customerPhone: order.shippingAddress.phone,
    shippingAddress: {
      street1: order.shippingAddress.street1,
      street2: order.shippingAddress.street2,
      city: formatEnumLabel(order.shippingAddress.city) ?? order.shippingAddress.city,
      province: order.shippingAddress.province,
      country: formatEnumLabel(order.shippingAddress.country) ?? order.shippingAddress.country,
      postcode: order.shippingAddress.postcode,
    },
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      variantTitle: item.variantTitle,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    })),
    customerNote,
    internalNote,
    history: history.map((entry) => ({
      id: entry.id,
      action: entry.action,
      actorId: entry.actorId,
      createdAt: entry.createdAt,
      summary: describeAuditSummary(entry),
    })),
  };
}

export async function saveAdminOrderInternalNote(input: {
  orderId: string;
  note?: string | null;
  actor: AuditActorInput;
}): Promise<SaveAdminOrderInternalNoteResult> {
  const db = getPrismaClient();
  const order = await db.order.findUnique({
    where: {
      id: input.orderId,
    },
    select: {
      id: true,
      orderNumber: true,
      metadata: true,
    },
  });

  if (!order) {
    throw new AppError("Order not found for internal note update.", "ORDER_NOT_FOUND", {
      statusCode: 404,
      userMessage: "This order could not be found.",
    });
  }

  const nextNote = input.note?.trim() ? input.note.trim() : null;
  const rawMetadata = readMetadataRecord(order.metadata);
  const previousNote = typeof rawMetadata.adminInternalNote === "string" ? rawMetadata.adminInternalNote : null;

  if (previousNote === nextNote) {
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      internalNote: nextNote,
    };
  }

  const metadata = nextNote
    ? ({
        ...rawMetadata,
        adminInternalNote: nextNote,
      } satisfies Prisma.InputJsonObject)
    : (Object.fromEntries(Object.entries(rawMetadata).filter(([key]) => key !== "adminInternalNote")) as Prisma.InputJsonObject);

  await db.order.update({
    where: {
      id: order.id,
    },
    data: {
      metadata,
    },
  });

  await db.auditLog.create({
    data: {
      actorId: input.actor.actorId,
      action: "order.internal_note.updated",
      model: "Order",
      modelId: order.id,
      changes: {
        previousNote,
        nextNote,
      },
    },
  });

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    internalNote: nextNote,
  };
}
