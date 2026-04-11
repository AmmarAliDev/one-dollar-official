import { PrismaClient } from '@prisma/client';

declare global {
  // allow global caching in development to prevent too many connections
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Central Prisma client instance for the app.
 * Keep a single instance to avoid exhausting database connections in serverless environments.
 */
const prisma = global.__prisma ?? new PrismaClient();
if (!global.__prisma) global.__prisma = prisma;

export default prisma;

/**
 * Lightweight runtime validation for ProductImage creations.
 * Ensures API-level checks mirror the DB-level CHECK constraint
 * (product_id IS NOT NULL OR product_variant_id IS NOT NULL).
 */
export function validateProductImageInput(payload: { productId?: string | null; productVariantId?: string | null }) {
  if (!payload.productId && !payload.productVariantId) {
    throw new Error('ProductImage must reference at least one of productId or productVariantId');
  }
}
