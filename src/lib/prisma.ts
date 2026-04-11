export type {
  DatabaseClient,
  DatabaseExecutor,
  DatabaseTransactionClient,
} from '@/server/db';
export {
  createPrismaClient,
  getPrismaClient,
  resolveDbExecutor,
  validateProductImageInput,
} from '@/server/db';
