import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Prisma mock — simulates Cart and AbandonedCartEvent tables
// ---------------------------------------------------------------------------

const prismaMock = vi.hoisted(() => ({
  cart: {
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  abandonedCartEvent: {
    create: vi.fn(),
  },
}));

vi.mock("@/server/db", () => ({
  getPrismaClient: () => prismaMock,
}));

vi.mock("@/lib/prisma", () => ({
  getPrismaClient: () => prismaMock,
}));

import {
  markCartAbandoned,
  markCartRecovered,
  recordCartActivity,
} from "@/features/cart/abandoned-cart-events";

const baseMetadata = {
  itemCount: 2,
  subtotalPaisa: 10000,
  firstProductName: "Test Product",
};

describe("recordCartActivity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.abandonedCartEvent.create.mockResolvedValue({ id: "event-1" });
  });

  it("records a CART_CREATED event when isFirstItem is true", async () => {
    await recordCartActivity({
      cartId: "cart-1",
      cartToken: "abc123",
      metadata: baseMetadata,
      isFirstItem: true,
    });

    expect(prismaMock.abandonedCartEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          cartId: "cart-1",
          cartToken: "abc123",
          eventType: "CART_CREATED",
        }),
      }),
    );
  });

  it("records a CART_UPDATED event when isFirstItem is false", async () => {
    await recordCartActivity({
      cartId: "cart-1",
      cartToken: "abc123",
      metadata: baseMetadata,
      isFirstItem: false,
    });

    expect(prismaMock.abandonedCartEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ eventType: "CART_UPDATED" }),
      }),
    );
  });

  it("includes userId and email in the event when provided", async () => {
    await recordCartActivity({
      cartId: "cart-1",
      cartToken: "abc123",
      userId: "user-42",
      email: "buyer@example.com",
      metadata: baseMetadata,
      isFirstItem: false,
    });

    expect(prismaMock.abandonedCartEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-42",
          email: "buyer@example.com",
        }),
      }),
    );
  });

  it("does NOT throw when the database write fails (non-fatal)", async () => {
    prismaMock.abandonedCartEvent.create.mockRejectedValue(
      new Error("Connection refused"),
    );

    // Should resolve without throwing
    await expect(
      recordCartActivity({
        cartId: "cart-1",
        cartToken: "abc123",
        metadata: baseMetadata,
        isFirstItem: true,
      }),
    ).resolves.toBeUndefined();
  });
});

describe("markCartAbandoned", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.cart.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.abandonedCartEvent.create.mockResolvedValue({ id: "event-2" });
  });

  it("sets status to ABANDONED and records a CART_EXPIRED event", async () => {
    await markCartAbandoned("cart-1", "abc123");

    expect(prismaMock.cart.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "cart-1", status: "ACTIVE" },
        data: expect.objectContaining({ status: "ABANDONED" }),
      }),
    );

    expect(prismaMock.abandonedCartEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          cartId: "cart-1",
          eventType: "CART_EXPIRED",
        }),
      }),
    );
  });

  it("skips the event when the cart was already in a non-ACTIVE state (updateMany count=0)", async () => {
    prismaMock.cart.updateMany.mockResolvedValue({ count: 0 });

    await markCartAbandoned("cart-1", "abc123");

    expect(prismaMock.abandonedCartEvent.create).not.toHaveBeenCalled();
  });
});

describe("markCartRecovered", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.cart.update.mockResolvedValue({ id: "cart-1" });
    prismaMock.abandonedCartEvent.create.mockResolvedValue({ id: "event-3" });
  });

  it("clears abandonment markers and records a CART_RECOVERED event", async () => {
    await markCartRecovered("cart-1", "abc123", "user-42", "buyer@example.com");

    expect(prismaMock.cart.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "cart-1" },
        data: { abandonedAt: null, recoveryToken: null },
      }),
    );

    expect(prismaMock.abandonedCartEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          cartId: "cart-1",
          eventType: "CART_RECOVERED",
          userId: "user-42",
          email: "buyer@example.com",
        }),
      }),
    );
  });

  it("does NOT throw when the database write fails (non-fatal)", async () => {
    prismaMock.cart.update.mockRejectedValue(new Error("DB error"));

    await expect(
      markCartRecovered("cart-1", "abc123"),
    ).resolves.toBeUndefined();
  });
});
