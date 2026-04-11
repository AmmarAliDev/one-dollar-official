export {
  createPrismaClient,
  type DatabaseClient,
  type DatabaseExecutor,
  type DatabaseTransactionClient,
  getPrismaClient,
  resolveDbExecutor,
} from '@/server/db/client';
export {
  createPaginatedResult,
  createPaginationMeta,
  normalizePagination,
  type PaginatedResult,
  type Pagination,
  type PaginationConfig,
  type PaginationInput,
  type PaginationMeta,
} from '@/server/db/pagination';
export {
  createQueryFailure,
  createQuerySuccess,
  isQueryFailure,
  isQuerySuccess,
  type PaginatedQueryResult,
  type QueryFailure,
  type QueryResult,
  type QuerySuccess,
} from '@/server/db/query-result';
export {
  createRepositoryContext,
  createServiceContext,
  defineRepository,
  defineService,
  type RepositoryContext,
  type ServiceContext,
} from '@/server/db/repository';
export {
  runInTransaction,
  runWithTransaction,
  type TransactionCallback,
  type TransactionOptions,
} from '@/server/db/transaction';
export { validateProductImageInput } from '@/server/db/validators';