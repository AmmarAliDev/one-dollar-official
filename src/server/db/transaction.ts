import { type Prisma } from '@prisma/client';

import {
  type DatabaseClient,
  type DatabaseExecutor,
  type DatabaseTransactionClient,
  getPrismaClient,
  resolveDbExecutor,
} from '@/server/db/client';

export type TransactionOptions = {
  isolationLevel?: Prisma.TransactionIsolationLevel;
  maxWait?: number;
  timeout?: number;
};

export type TransactionCallback<T> = (db: DatabaseTransactionClient) => Promise<T>;

const DEFAULT_TRANSACTION_OPTIONS: TransactionOptions = {
  maxWait: 10_000,
  timeout: 20_000,
};

function isRootDatabaseClient(db: DatabaseExecutor): db is DatabaseClient {
  return '$transaction' in db;
}

function resolveTransactionOptions(options?: TransactionOptions): TransactionOptions {
  return {
    ...DEFAULT_TRANSACTION_OPTIONS,
    ...options,
  };
}

export async function runInTransaction<T>(
  callback: TransactionCallback<T>,
  options?: TransactionOptions,
  client: DatabaseClient = getPrismaClient(),
): Promise<T> {
  return client.$transaction(
    (transaction: DatabaseTransactionClient) => callback(transaction),
    resolveTransactionOptions(options),
  );
}

export async function runWithTransaction<T>(
  callback: TransactionCallback<T>,
  db?: DatabaseExecutor,
  options?: TransactionOptions,
): Promise<T> {
  const executor = resolveDbExecutor(db);

  if (isRootDatabaseClient(executor)) {
    return executor.$transaction(
      (transaction: DatabaseTransactionClient) => callback(transaction),
      resolveTransactionOptions(options),
    );
  }

  return callback(executor);
}