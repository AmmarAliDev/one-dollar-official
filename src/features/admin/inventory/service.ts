import type { Prisma } from "@prisma/client";

import { AppError } from "@/lib/errors/app-error";
import { getPrismaClient } from "@/server/db";

import type { AdminInventoryAdjustmentInput } from "./validation";

type AuditActorInput = {
  actorId: string;
  actorRole?: string | null;
};

type InventoryDbClient = ReturnType<typeof getPrismaClient> | Prisma.TransactionClient;

export type AdminInventoryAdjustmentResult = {
  inventoryId: string;
  productVariantId: string;
  productName: string | null;
  sku: string | null;
  reserved: number;
  safetyStock: number;
  previousQuantity: number;
  nextQuantity: number;
  updatedAt: Date;
};

const MAX_INVENTORY_QUANTITY = 1_000_000;

function computeNextQuantity(input: {
  mode: AdminInventoryAdjustmentInput["adjustmentMode"];
  amount: number;
  currentQuantity: number;
}) {
  switch (input.mode) {
    case "set":
      return input.amount;
    case "increase":
      return input.currentQuantity + input.amount;
    case "decrease":
      return input.currentQuantity - input.amount;
    default:
      return input.currentQuantity;
  }
}

function assertAllowedQuantity(nextQuantity: number, reserved: number) {
  if (nextQuantity < 0) {
    throw new AppError("Inventory quantity cannot be negative.", "INVENTORY_INVALID_QUANTITY", {
      statusCode: 400,
      userMessage: "Stock cannot be reduced below zero.",
    });
  }

  if (nextQuantity < reserved) {
    throw new AppError("Inventory quantity cannot be less than reserved stock.", "INVENTORY_INVALID_QUANTITY", {
      statusCode: 400,
      userMessage: "Stock cannot be reduced below reserved units.",
    });
  }

  if (nextQuantity > MAX_INVENTORY_QUANTITY) {
    throw new AppError("Inventory quantity exceeds configured safety bounds.", "INVENTORY_INVALID_QUANTITY", {
      statusCode: 400,
      userMessage: "Stock exceeds the maximum allowed quantity for a manual update.",
    });
  }
}

async function writeInventoryAuditLog(
  database: InventoryDbClient,
  input: {
    actor: AuditActorInput;
    inventoryId: string;
    productVariantId: string;
    productName: string | null;
    sku: string | null;
    adjustmentMode: AdminInventoryAdjustmentInput["adjustmentMode"];
    amount: number;
    reason: string;
    previousQuantity: number;
    nextQuantity: number;
    reserved: number;
    safetyStock: number;
  },
) {
  await database.auditLog.create({
    data: {
      actorId: input.actor.actorId,
      action: "inventory.adjusted",
      model: "Inventory",
      modelId: input.inventoryId,
      changes: {
        productVariantId: input.productVariantId,
        productName: input.productName,
        sku: input.sku,
        adjustmentMode: input.adjustmentMode,
        amount: input.amount,
        reason: input.reason,
        beforeQuantity: input.previousQuantity,
        afterQuantity: input.nextQuantity,
        delta: input.nextQuantity - input.previousQuantity,
        reserved: input.reserved,
        safetyStock: input.safetyStock,
        actorRole: input.actor.actorRole ?? null,
      },
    },
  });
}

export async function adjustAdminInventory(input: {
  data: AdminInventoryAdjustmentInput;
  actor: AuditActorInput;
}): Promise<AdminInventoryAdjustmentResult> {
  const db = getPrismaClient();

  return db.$transaction(async (tx) => {
    const current = await tx.inventory.findUnique({
      where: {
        id: input.data.inventoryId,
      },
      include: {
        productVariant: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!current) {
      throw new AppError("Inventory record not found.", "INVENTORY_NOT_FOUND", {
        statusCode: 404,
        userMessage: "This inventory record no longer exists.",
      });
    }

    const nextQuantity = computeNextQuantity({
      mode: input.data.adjustmentMode,
      amount: input.data.amount,
      currentQuantity: current.quantity,
    });

    assertAllowedQuantity(nextQuantity, current.reserved);

    const result = await tx.inventory.updateMany({
      where: {
        id: current.id,
        updatedAt: input.data.expectedUpdatedAt,
      },
      data: {
        quantity: nextQuantity,
      },
    });

    if (result.count !== 1) {
      throw new AppError("Inventory update conflict detected.", "INVENTORY_UPDATE_CONFLICT", {
        statusCode: 409,
        userMessage: "Inventory was updated elsewhere. Refresh and apply the change again.",
      });
    }

    const updated = await tx.inventory.findUnique({
      where: {
        id: current.id,
      },
      include: {
        productVariant: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!updated) {
      throw new AppError("Inventory record missing after update.", "INVENTORY_NOT_FOUND", {
        statusCode: 404,
        userMessage: "The saved inventory record could not be reloaded.",
      });
    }

    await writeInventoryAuditLog(tx, {
      actor: input.actor,
      inventoryId: updated.id,
      productVariantId: updated.productVariantId,
      productName: updated.productVariant.product?.name ?? null,
      sku: updated.productVariant.sku ?? null,
      adjustmentMode: input.data.adjustmentMode,
      amount: input.data.amount,
      reason: input.data.reason,
      previousQuantity: current.quantity,
      nextQuantity: updated.quantity,
      reserved: updated.reserved,
      safetyStock: updated.safetyStock,
    });

    return {
      inventoryId: updated.id,
      productVariantId: updated.productVariantId,
      productName: updated.productVariant.product?.name ?? null,
      sku: updated.productVariant.sku ?? null,
      reserved: updated.reserved,
      safetyStock: updated.safetyStock,
      previousQuantity: current.quantity,
      nextQuantity: updated.quantity,
      updatedAt: updated.updatedAt,
    };
  });
}
