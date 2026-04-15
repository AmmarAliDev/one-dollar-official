import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockDb = vi.hoisted(() => ({
  cart: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  category: {
    upsert: vi.fn(),
  },
  product: {
    upsert: vi.fn(),
  },
  productVariant: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  inventory: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    create: vi.fn(),
  },
  cartItem: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
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

  it("reuses existing seeded catalog records during add-to-cart", async () => {
    mockDb.cart.findFirst.mockImplementation(async (args?: { where?: Record<string, unknown> }) => {
      if (args?.where?.token === "guest-token") {
        return {
          id: "cart-existing",
          token: "guest-token",
          userId: null,
          status: "ACTIVE",
        };
      }

      return null;
    });

    mockDb.productVariant.findUnique.mockResolvedValue({
      id: "variant-1",
      sku: "CFC-900ML-001",
      inventory: {
        quantity: 20,
        reserved: 0,
        safetyStock: 0,
      },
    });

    mockDb.inventory.findUnique.mockResolvedValue({
      productVariantId: "variant-1",
      quantity: 20,
      reserved: 0,
      safetyStock: 0,
    });

    mockDb.cartItem.findUnique.mockResolvedValue(null);
    mockDb.cartItem.upsert.mockResolvedValue({
      id: "item-1",
      cartId: "cart-existing",
      productVariantId: "variant-1",
      quantity: 1,
      unitPrice: 499,
    });

    mockDb.cart.findUnique.mockImplementation(async (args?: { include?: Record<string, unknown> }) => {
      if (args?.include) {
        return {
          id: "cart-existing",
          token: "guest-token",
          items: [
            {
              id: "item-1",
              quantity: 1,
              unitPrice: 499,
              productVariant: {
                sku: "CFC-900ML-001",
                title: null,
                compareAtPrice: null,
                inventory: {
                  quantity: 20,
                  reserved: 0,
                  safetyStock: 0,
                },
                product: {
                  name: "Citrus Floor Cleaner",
                  slug: "citrus-floor-cleaner-900ml",
                  category: {
                    slug: "home-care",
                  },
                },
              },
            },
          ],
        };
      }

      return {
        id: "cart-existing",
        token: "guest-token",
        userId: null,
        status: "ACTIVE",
      };
    });

    const { addCartItemForContext } = await import("@/features/cart");

    await expect(
      addCartItemForContext(
        {
          guestToken: "guest-token",
        },
        {
          productSlug: "citrus-floor-cleaner-900ml",
          quantity: 1,
        },
      ),
    ).resolves.toMatchObject({
      id: "cart-existing",
      itemCount: 1,
      subtotal: 499,
    });

    expect(mockDb.category.upsert).not.toHaveBeenCalled();
    expect(mockDb.product.upsert).not.toHaveBeenCalled();
    expect(mockDb.productVariant.upsert).not.toHaveBeenCalled();
    expect(mockDb.inventory.upsert).not.toHaveBeenCalled();
  });
});
