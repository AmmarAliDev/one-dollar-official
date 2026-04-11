import type { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

type GlobalPrismaCache = typeof globalThis & {
  __oneDollarPrisma?: PrismaClient;
};

const globalForPrisma = globalThis as GlobalPrismaCache;

export type DatabaseClient = PrismaClient;
export type DatabaseTransactionClient = Prisma.TransactionClient;
export type DatabaseExecutor = DatabaseClient | DatabaseTransactionClient;

function createPrismaClientOptions(): Prisma.PrismaClientOptions {
  if (process.env.NODE_ENV === 'development') {
    return {
      log: ['warn', 'error'],
    };
  }

  return {};
}

export function createPrismaClient(): PrismaClient {
  return new PrismaClient(createPrismaClientOptions());
}

export function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.__oneDollarPrisma) {
    globalForPrisma.__oneDollarPrisma = createPrismaClient();
  }

  return globalForPrisma.__oneDollarPrisma;
}

export function resolveDbExecutor(db?: DatabaseExecutor): DatabaseExecutor {
  return db ?? getPrismaClient();
}