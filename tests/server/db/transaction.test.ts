import { describe, expect, it, vi } from 'vitest';

import {
  type DatabaseClient,
  type DatabaseTransactionClient,
  runInTransaction,
  runWithTransaction,
} from '@/server/db';

describe('transaction helpers', () => {
  it('reuses an existing transaction client', async () => {
    const transaction = { model: 'transaction' } as unknown as DatabaseTransactionClient;
    const callback = vi.fn(async (db: DatabaseTransactionClient) => db);

    const result = await runWithTransaction(callback, transaction);

    expect(result).toBe(transaction);
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith(transaction);
  });

  it('opens a transaction when given a root client', async () => {
    const transaction = { model: 'transaction' } as unknown as DatabaseTransactionClient;
    const callback = vi.fn(async (db: DatabaseTransactionClient) => db);
    const client = {
      $transaction: vi.fn(async (transactionCallback: (db: DatabaseTransactionClient) => Promise<DatabaseTransactionClient>) =>
        transactionCallback(transaction),
      ),
    } as unknown as DatabaseClient;

    const result = await runWithTransaction(callback, client);

    expect(result).toBe(transaction);
    expect(callback).toHaveBeenCalledWith(transaction);
  });

  it('runs a callback inside a transaction using the provided client', async () => {
    const transaction = { model: 'transaction' } as unknown as DatabaseTransactionClient;
    const client = {
      $transaction: vi.fn(async (transactionCallback: (db: DatabaseTransactionClient) => Promise<string>) =>
        transactionCallback(transaction),
      ),
    } as unknown as DatabaseClient;

    const result = await runInTransaction(async () => 'ok', undefined, client);

    expect(result).toBe('ok');
  });
});