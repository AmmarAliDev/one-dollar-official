import type { OrderStatus } from "@prisma/client";

import { AppError } from "@/lib/errors/app-error";

export const orderStatuses = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const satisfies ReadonlyArray<OrderStatus>;

const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const orderStatusVariants: Record<OrderStatus, "warning" | "info" | "success" | "danger" | "secondary"> = {
  PENDING: "warning",
  CONFIRMED: "info",
  PACKED: "secondary",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
};

const orderStatusTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function formatOrderStatusLabel(status: OrderStatus) {
  return orderStatusLabels[status];
}

export function getOrderStatusVariant(status: OrderStatus) {
  return orderStatusVariants[status];
}

export function getNextOrderStatuses(status: OrderStatus) {
  return orderStatusTransitions[status];
}

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus) {
  return orderStatusTransitions[from].includes(to);
}

export function assertOrderStatusTransition(from: OrderStatus, to: OrderStatus) {
  if (from === to) {
    throw new AppError("Order status is already set to the requested value.", "ORDER_STATUS_UNCHANGED", {
      statusCode: 400,
      userMessage: `This order is already marked as ${formatOrderStatusLabel(from).toLowerCase()}.`,
    });
  }

  if (!canTransitionOrderStatus(from, to)) {
    throw new AppError(`Invalid order status transition: ${from} -> ${to}`, "ORDER_STATUS_TRANSITION_INVALID", {
      statusCode: 400,
      userMessage: `Orders cannot move from ${formatOrderStatusLabel(from).toLowerCase()} to ${formatOrderStatusLabel(to).toLowerCase()}.`,
    });
  }
}