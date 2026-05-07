import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockQueryRaw = vi.fn();
const mockProductFindMany = vi.fn();

vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

vi.mock('@/server/db', () => ({
  getPrismaClient: () => ({
    $queryRaw: (...args: unknown[]) => mockQueryRaw(...args),
    product: {
      findMany: (...args: unknown[]) => mockProductFindMany(...args),
    },
  }),
}));

describe('catalog queries one-dollar count', () => {
  beforeEach(() => {
    vi.resetModules();
    mockQueryRaw.mockReset();
    mockProductFindMany.mockReset();
  });

  it('uses SQL-side count result when raw query succeeds', async () => {
    mockQueryRaw.mockResolvedValue([{ count: 7 }]);

    const { countPublishedOneDollarProducts } = await import('@/server/db/catalog-queries');
    const total = await countPublishedOneDollarProducts();

    expect(total).toBe(7);
    expect(mockProductFindMany).not.toHaveBeenCalled();
  });

  it('falls back to Prisma findMany when raw query fails', async () => {
    mockQueryRaw.mockRejectedValue(new Error('raw SQL unavailable'));
    mockProductFindMany.mockResolvedValue([
      { variants: [{ price: 120 }] },
      { variants: [{ price: 280 }] },
      { variants: [{ price: 281 }] },
      { variants: [] },
    ]);

    const { countPublishedOneDollarProducts } = await import('@/server/db/catalog-queries');
    const total = await countPublishedOneDollarProducts();

    expect(total).toBe(2);
    expect(mockProductFindMany).toHaveBeenCalledOnce();
  });

  it('supports bigint count values from SQL drivers', async () => {
    mockQueryRaw.mockResolvedValue([{ count: 3n }]);

    const { countPublishedOneDollarProducts } = await import('@/server/db/catalog-queries');
    const total = await countPublishedOneDollarProducts();

    expect(total).toBe(3);
  });
});
