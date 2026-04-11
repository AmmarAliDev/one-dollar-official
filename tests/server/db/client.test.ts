import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const originalDatabaseUrl = process.env.DATABASE_URL;

describe('database client', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/one_dollar_test?schema=public';
  });

  afterEach(async () => {
    const databaseModule = await import('@/server/db');
    await databaseModule.getPrismaClient().$disconnect();

    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  });

  it('returns the same Prisma client instance across repeated calls', async () => {
    const { getPrismaClient } = await import('@/server/db');

    const firstClient = getPrismaClient();
    const secondClient = getPrismaClient();

    expect(firstClient).toBe(secondClient);
  });
});