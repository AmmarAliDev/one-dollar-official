import { randomUUID } from "node:crypto";

import { CartStatus, City, Country, OrderStatus, Prisma } from "@prisma/client";

import { mergeGuestCartIntoUserCart } from "@/features/cart";
import type { CheckoutPayload } from "@/features/checkout";
import { calculateCheckoutTotals, getCheckoutPaymentProvider } from "@/features/checkout";
import { AppError } from "@/lib/errors/app-error";
import type { DatabaseExecutor } from "@/server/db";
import { getPrismaClient, runWithTransaction } from "@/server/db";

import {
  buildOrderConfirmationUrl,
  buildOrderInvoiceUrl,
  createInvoiceNumber,
  createOrderNumber,
} from "./invoice";
import { assertOrderStatusTransition, formatOrderStatusLabel } from "./status";
import type {
  OrderDetails,
  PlaceOrderInput,
  PlaceOrderResult,
  UpdateOrderStatusInput,
  UpdateOrderStatusResult,
} from "./types";

type OrderCart = Prisma.CartGetPayload<{
  include: {
    items: {
      orderBy: {
        createdAt: "asc";
      };
      include: {
        productVariant: {
          include: {
            inventory: true;
            product: true;
          };
        };
      };
    };
  };
}>;

type OrderLookup = Prisma.OrderGetPayload<{
  include: {
    items: {
      orderBy: {
        createdAt: "asc";
      };
    };
    shippingAddress: true;
  };
}>;

const ORDER_NUMBER_RETRY_LIMIT = 5;

function getAvailableInventoryQuantity(inventory: { quantity: number; reserved: number; safetyStock: number } | null) {
  if (!inventory) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(0, inventory.quantity - inventory.reserved - inventory.safetyStock);
}

function createConfirmationAccessToken() {
  return randomUUID().replaceAll("-", "");
}

function getPaymentMethodLabel(value: string | null) {
  if (value === "COD") {
    return "Cash on Delivery";
  }

  return value ?? "Unknown";
}

function readMetadataString(value: Prisma.JsonValue | null | undefined, key: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const candidate = value[key as keyof typeof value];
  return typeof candidate === "string" && candidate.length > 0 ? candidate : null;
}

async function resolveCartForOrder(
  input: PlaceOrderInput,
  transaction: DatabaseExecutor,
): Promise<OrderCart> {
  if (input.context.userId && input.context.guestToken && input.context.mergeGuestIntoUser) {
    await mergeGuestCartIntoUserCart(
      {
        userId: input.context.userId,
        guestToken: input.context.guestToken,
      },
      transaction,
    );
  }

  let cart: OrderCart | null;

  if (input.context.userId) {
    cart = await transaction.cart.findFirst({
        where: {
          userId: input.context.userId,
          status: CartStatus.ACTIVE,
        },
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          items: {
            orderBy: {
              createdAt: "asc",
            },
            include: {
              productVariant: {
                include: {
                  inventory: true,
                  product: true,
                },
              },
            },
          },
        },
      });
  } else {
    if (!input.context.guestToken) {
      throw new AppError("Cart context missing for order placement.", "CART_CONTEXT_MISSING", {
        statusCode: 400,
        userMessage: "We could not identify your cart. Please refresh and try again.",
      });
    }

    cart = await transaction.cart.findFirst({
        where: {
          token: input.context.guestToken,
          userId: null,
          status: CartStatus.ACTIVE,
        },
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          items: {
            orderBy: {
              createdAt: "asc",
            },
            include: {
              productVariant: {
                include: {
                  inventory: true,
                  product: true,
                },
              },
            },
          },
        },
      });
  }

  if (!cart || cart.items.length === 0) {
    throw new AppError("Checkout requested with empty cart.", "CHECKOUT_CART_EMPTY", {
      statusCode: 400,
      userMessage: "Your cart is empty. Add products before checkout.",
    });
  }

  if (cart.id !== input.payload.cartId) {
    throw new AppError("Checkout cart mismatch.", "CHECKOUT_CART_MISMATCH", {
      statusCode: 409,
      userMessage: "Your cart changed. Please refresh checkout and try again.",
    });
  }

  return cart;
}

async function decrementInventoryForOrder(cart: OrderCart, transaction: DatabaseExecutor) {
  for (const item of cart.items) {
    const inventory = item.productVariant.inventory;

    if (!inventory) {
      continue;
    }

    const availableQuantity = getAvailableInventoryQuantity(inventory);
    if (availableQuantity < item.quantity) {
      throw new AppError(
        `Order placement blocked by stock for SKU ${item.productVariant.sku ?? item.productVariant.id}.`,
        "ORDER_STOCK_INSUFFICIENT",
        {
          statusCode: 409,
          userMessage: `${item.productVariant.product.name} no longer has enough stock. Please update your cart and try again.`,
        },
      );
    }

    const updateResult = await transaction.inventory.updateMany({
      where: {
        id: inventory.id,
        reserved: inventory.reserved,
        safetyStock: inventory.safetyStock,
        quantity: {
          gte: item.quantity + inventory.reserved + inventory.safetyStock,
        },
      },
      data: {
        quantity: {
          decrement: item.quantity,
        },
      },
    });

    if (updateResult.count !== 1) {
      throw new AppError(
        `Inventory update lost race for SKU ${item.productVariant.sku ?? item.productVariant.id}.`,
        "ORDER_STOCK_CONFLICT",
        {
          statusCode: 409,
          userMessage: `${item.productVariant.product.name} changed while your order was being placed. Please retry checkout.`,
        },
      );
    }
  }
}

function mapOrderDetails(order: OrderLookup): OrderDetails {
  if (!order.shippingAddress) {
    throw new AppError("Order shipping address missing.", "ORDER_ADDRESS_MISSING", {
      statusCode: 500,
    });
  }

  const confirmationAccessToken = readMetadataString(order.metadata, "confirmationAccessToken");
  const invoiceNumber = readMetadataString(order.metadata, "invoiceNumber") ?? createInvoiceNumber(order.orderNumber);

  return {
    id: order.id,
    userId: order.userId,
    orderNumber: order.orderNumber,
    invoiceNumber,
    status: order.status,
    statusLabel: formatOrderStatusLabel(order.status),
    placedAt: order.placedAt,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    paymentMethod: order.paymentMethod,
    paymentMethodLabel: getPaymentMethodLabel(order.paymentMethod),
    paymentStatus: order.paymentStatus,
    confirmationAccessToken,
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      variantTitle: item.variantTitle,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    })),
    shippingAddress: {
      fullName: order.shippingAddress.fullName,
      phone: order.shippingAddress.phone,
      email: order.shippingAddress.email,
      street1: order.shippingAddress.street1,
      street2: order.shippingAddress.street2,
      city: order.shippingAddress.city === City.KARACHI ? "Karachi" : order.shippingAddress.city,
      province: order.shippingAddress.province,
      country: order.shippingAddress.country === Country.PAK ? "Pakistan" : order.shippingAddress.country,
      postcode: order.shippingAddress.postcode,
      notes: order.shippingAddress.notes,
    },
  };
}

function hasOrderAccess(order: OrderLookup, userId?: string | null, accessToken?: string | null) {
  if (userId && order.userId === userId) {
    return true;
  }

  const expectedToken = readMetadataString(order.metadata, "confirmationAccessToken");
  return Boolean(accessToken && expectedToken && expectedToken === accessToken);
}

function isOrderNumberConflict(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function placeOrderFromCheckout(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const db = getPrismaClient();

  for (let attempt = 0; attempt < ORDER_NUMBER_RETRY_LIMIT; attempt += 1) {
    const now = new Date();
    const orderNumber = createOrderNumber(now);
    const confirmationAccessToken = createConfirmationAccessToken();
    const invoiceNumber = createInvoiceNumber(orderNumber);

    try {
      return await runWithTransaction(
        async (transaction) => {
          const cart = await resolveCartForOrder(input, transaction);
          const totals = calculateCheckoutTotals(
            cart.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
          );
          const paymentProvider = getCheckoutPaymentProvider(input.payload.paymentMethod);
          const payment = paymentProvider.authorize({
            payload: input.payload,
            totals,
          });

          await decrementInventoryForOrder(cart, transaction);

          const shippingAddress = await transaction.orderAddress.create({
            data: {
              fullName: input.payload.customer.fullName.trim(),
              phone: input.payload.customer.phone.trim(),
              email: input.payload.customer.email.trim(),
              street1: input.payload.shippingAddress.addressLine1.trim(),
              ...(input.payload.shippingAddress.addressLine2
                ? { street2: input.payload.shippingAddress.addressLine2.trim() }
                : {}),
              city: City.KARACHI,
              province: input.payload.shippingAddress.province.trim(),
              country: Country.PAK,
              postcode: input.payload.shippingAddress.postcode.trim(),
              ...(input.payload.notes ? { notes: input.payload.notes.trim() } : {}),
            },
          });

          const order = await transaction.order.create({
            data: {
              orderNumber,
              ...(input.context.userId ? { userId: input.context.userId } : {}),
              status: OrderStatus.PENDING,
              subtotal: totals.subtotal,
              shipping: totals.shipping,
              tax: 0,
              discount: 0,
              total: totals.total,
              paymentMethod: input.payload.paymentMethod,
              paymentProvider: payment.provider,
              paymentStatus: payment.status,
              placedAt: now,
              shippingAddressId: shippingAddress.id,
              billingAddressId: shippingAddress.id,
              metadata: {
                confirmationAccessToken,
                invoiceNumber,
                cartId: cart.id,
                itemCount: cart.items.length,
                notes: input.payload.notes ?? null,
              },
              items: {
                create: cart.items.map((item) => ({
                  productId: item.productVariant.productId,
                  productName: item.productVariant.product.name,
                  variantTitle: item.productVariant.title,
                  sku: item.productVariant.sku,
                  unitPrice: item.unitPrice,
                  quantity: item.quantity,
                  subtotal: item.quantity * item.unitPrice,
                  tax: 0,
                })),
              },
            },
          });

          await transaction.cart.update({
            where: {
              id: cart.id,
            },
            data: {
              status: CartStatus.COMPLETED,
              token: null,
            },
          });

          await transaction.auditLog.create({
            data: {
              ...(input.context.userId ? { actorId: input.context.userId } : {}),
              action: "order.created",
              model: "Order",
              modelId: order.id,
              changes: {
                orderNumber,
                status: OrderStatus.PENDING,
                paymentMethod: input.payload.paymentMethod,
                paymentStatus: payment.status,
                total: totals.total,
              },
            },
          });

          return {
            orderId: order.id,
            orderNumber,
            status: OrderStatus.PENDING,
            statusLabel: formatOrderStatusLabel(OrderStatus.PENDING),
            placedAt: now,
            totals,
            payment,
            confirmationAccessToken,
            confirmationUrl: buildOrderConfirmationUrl(orderNumber, confirmationAccessToken),
            invoiceUrl: buildOrderInvoiceUrl(orderNumber, confirmationAccessToken),
          } satisfies PlaceOrderResult;
        },
        db,
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error) {
      if (isOrderNumberConflict(error) && attempt < ORDER_NUMBER_RETRY_LIMIT - 1) {
        continue;
      }

      throw error;
    }
  }

  throw new AppError("Order number generation exhausted retry budget.", "ORDER_NUMBER_GENERATION_FAILED", {
    statusCode: 500,
    userMessage: "We could not finalize your order number. Please retry checkout.",
  });
}

export async function getOrderDetailsForAccess(input: {
  orderNumber: string;
  userId?: string | null;
  accessToken?: string | null;
}) {
  const db = getPrismaClient();
  const order = await db.order.findUnique({
    where: {
      orderNumber: input.orderNumber,
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

  if (!hasOrderAccess(order, input.userId, input.accessToken)) {
    return null;
  }

  return mapOrderDetails(order);
}

export async function updateOrderStatus(input: UpdateOrderStatusInput): Promise<UpdateOrderStatusResult> {
  const db = getPrismaClient();

  return runWithTransaction(async (transaction) => {
    const order = await transaction.order.findUnique({
      where: {
        id: input.orderId,
      },
    });

    if (!order) {
      throw new AppError("Order not found for status update.", "ORDER_NOT_FOUND", {
        statusCode: 404,
        userMessage: "This order could not be found.",
      });
    }

    assertOrderStatusTransition(order.status, input.nextStatus);

    const updated = await transaction.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: input.nextStatus,
      },
    });

    await transaction.auditLog.create({
      data: {
        ...(input.actorId ? { actorId: input.actorId } : {}),
        action: "order.status.changed",
        model: "Order",
        modelId: updated.id,
        changes: {
          from: order.status,
          to: input.nextStatus,
        },
      },
    });

    return {
      orderId: updated.id,
      orderNumber: updated.orderNumber,
      previousStatus: order.status,
      nextStatus: input.nextStatus,
    };
  }, db);
}

export function buildOrderInvoiceFilename(orderNumber: string) {
  return `invoice-${orderNumber.toLowerCase()}.pdf`;
}

export function buildOrderLookupPayload(payload: CheckoutPayload) {
  return {
    customerEmail: payload.customer.email.trim().toLowerCase(),
    customerPhone: payload.customer.phone.trim(),
    shippingCity: payload.shippingAddress.city.trim(),
  };
}