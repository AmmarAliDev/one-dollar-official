import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

const mockDb = vi.hoisted(() => ({
  cart: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/server/db", () => ({
  getPrismaClient: () => mockDb,
  runWithTransaction: async (callback: (db: typeof mockDb) => Promise<unknown>) => callback(mockDb),
}));

describe("cart context resolution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reuses an active token-backed cart without creating a duplicate guest cart", async () => {
    mockDb.cart.findFirst.mockImplementation(async (args?: { where?: Record<string, unknown> }) => {
      if (args?.where?.token === "shared-token") {
        return {
          id: "cart-1",
          token: "shared-token",
          userId: "user-1",
          status: "ACTIVE",
        };
      }

      return null;
    });

    mockDb.cart.findUnique.mockResolvedValue({
      id: "cart-1",
      token: "shared-token",
      items: [],
    });

    mockDb.cart.create.mockRejectedValue(new Error("cart.create should not be called when the token already resolves an active cart"));

    const { getCartSummaryForContext } = await import("@/features/cart");

    await expect(
      getCartSummaryForContext({
        guestToken: "shared-token",
      }),
    ).resolves.toMatchObject({
      id: "cart-1",
      token: "shared-token",
      itemCount: 0,
      subtotal: 0,
    });

    expect(mockDb.cart.create).not.toHaveBeenCalled();
  });

  it("recovers when guest cart creation races on the unique token", async () => {
    const tokenConflict = new Prisma.PrismaClientKnownRequestError("Unique constraint failed on the fields: (token)", {
      code: "P2002",
      clientVersion: "test",
      meta: {
        target: ["token"],
      },
    });

    mockDb.cart.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: "cart-2",
      token: "race-token",
      userId: null,
      status: "ACTIVE",
    });

    mockDb.cart.create.mockImplementationOnce(async () => {
      throw tokenConflict;
    });

    mockDb.cart.findUnique.mockResolvedValue({
      id: "cart-2",
      token: "race-token",
      items: [],
    });

    const { getCartSummaryForContext } = await import("@/features/cart");

    await expect(
      getCartSummaryForContext({
        guestToken: "race-token",
      }),
    ).resolves.toMatchObject({
      id: "cart-2",
      token: "race-token",
      itemCount: 0,
      subtotal: 0,
    });
  });

  it("rotates to a fresh cart token when the cookie token belongs to a completed cart", async () => {
    mockDb.cart.findFirst.mockImplementation(async (args?: { where?: Record<string, unknown> }) => {
      if (args?.where?.token === "used-token") {
        return {
          id: "old-cart",
          token: "used-token",
          userId: null,
          status: "COMPLETED",
        };
      }

      return null;
    });

    mockDb.cart.create.mockImplementation(async (args?: { data?: Record<string, unknown> }) => {
      if (args?.data?.token === "used-token") {
        throw new Error("should not try to recreate a cart with an already-used token");
      }

      return {
        id: "cart-3",
        token: String(args?.data?.token ?? "fresh-token"),
        userId: null,
        status: "ACTIVE",
      };
    });

    mockDb.cart.findUnique.mockResolvedValue({
      id: "cart-3",
      token: "fresh-token",
      items: [],
    });

    const { getCartSummaryForContext } = await import("@/features/cart");

    await expect(
      getCartSummaryForContext({
        guestToken: "used-token",
      }),
    ).resolves.toMatchObject({
      id: "cart-3",
      itemCount: 0,
      subtotal: 0,
    });
  });
});
