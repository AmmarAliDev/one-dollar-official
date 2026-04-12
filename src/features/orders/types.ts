import type { OrderStatus } from "@prisma/client";

import type { ResolveCartContextInput } from "@/features/cart";
import type { CheckoutPayload, CheckoutPaymentResult, CheckoutTotals } from "@/features/checkout";

export type PlaceOrderInput = {
  payload: CheckoutPayload;
  context: ResolveCartContextInput;
};

export type PlaceOrderResult = {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  placedAt: Date;
  totals: CheckoutTotals;
  payment: CheckoutPaymentResult;
  confirmationAccessToken: string;
  confirmationUrl: string;
  invoiceUrl: string;
};

export type OrderDetailsItem = {
  id: string;
  productName: string;
  variantTitle: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type OrderDetailsAddress = {
  fullName: string;
  phone: string | null;
  email: string | null;
  street1: string;
  street2: string | null;
  city: string;
  province: string | null;
  country: string;
  postcode: string | null;
  notes: string | null;
};

export type OrderDetails = {
  id: string;
  userId: string | null;
  orderNumber: string;
  invoiceNumber: string;
  status: OrderStatus;
  statusLabel: string;
  placedAt: Date;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string | null;
  paymentMethodLabel: string;
  paymentStatus: string | null;
  confirmationAccessToken: string | null;
  items: OrderDetailsItem[];
  shippingAddress: OrderDetailsAddress;
};

export type UpdateOrderStatusInput = {
  orderId: string;
  nextStatus: OrderStatus;
  actorId?: string | null;
};

export type UpdateOrderStatusResult = {
  orderId: string;
  orderNumber: string;
  previousStatus: OrderStatus;
  nextStatus: OrderStatus;
};

export type OrderHistoryItem = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  placedAt: Date | null;
  total: number;
  itemCount: number;
};

export type ReorderIssueReason = "UNAVAILABLE" | "OUT_OF_STOCK" | "QUANTITY_ADJUSTED";

export type ReorderIssue = {
  orderItemId: string;
  productName: string;
  sku: string | null;
  requestedQuantity: number;
  addedQuantity: number;
  availableQuantity: number;
  reason: ReorderIssueReason;
  message: string;
};

export type ReorderFromOrderInput = {
  userId: string;
  orderNumber: string;
};

export type ReorderFromOrderResult = {
  orderId: string;
  orderNumber: string;
  cartId: string;
  addedLineCount: number;
  addedQuantity: number;
  issues: ReorderIssue[];
};

export type ReorderLineDecision = {
  quantityToAdd: number;
  availableToAdd: number;
  reason: "FULL" | "ADJUSTED" | "OUT_OF_STOCK";
};

export type ResolveReorderLineDecisionInput = {
  requestedQuantity: number;
  existingQuantity: number;
  availableQuantity: number;
  maxCartItemQuantity?: number;
};