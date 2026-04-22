/**
 * Reusable Prisma mock utilities.
 *
 * Usage inside a test file:
 *
 * ```ts
 * import { mockPrismaModel } from "@tests/helpers/prisma";
 *
 * const prismaMock = vi.hoisted(() => ({
 *   user: mockPrismaModel(),
 *   product: mockPrismaModel(),
 * }));
 *
 * vi.mock("@/server/db", () => ({
 *   getPrismaClient: () => prismaMock,
 *   runWithTransaction: async (cb: (db: typeof prismaMock) => Promise<unknown>) =>
 *     cb(prismaMock),
 * }));
 * ```
 *
 * Because ESM static imports are resolved before `vi.hoisted()` callbacks
 * execute, calling `mockPrismaModel()` inside `vi.hoisted()` is safe.
 */
import { vi } from "vitest";

/**
 * Creates a standard set of `vi.fn()` stubs for a single Prisma model.
 * Covers the most-commonly-used Prisma methods; extend as needed per test.
 */
export function mockPrismaModel() {
  return {
    findFirst: vi.fn(),
    findFirstOrThrow: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
    groupBy: vi.fn(),
  };
}

/**
 * Builds a mock `getPrismaClient` return value with the specified model keys.
 *
 * @example
 * const prismaMock = vi.hoisted(() => createDbMock(["user", "product"]));
 */
export function createDbMock<K extends string>(
  models: K[],
): Record<K, ReturnType<typeof mockPrismaModel>> {
  return Object.fromEntries(models.map((m) => [m, mockPrismaModel()])) as Record<
    K,
    ReturnType<typeof mockPrismaModel>
  >;
}
