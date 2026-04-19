import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(async (callback: (tx: typeof prismaMock) => Promise<unknown>) => callback(prismaMock)),
  category: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  product: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  productVariant: {
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
  productImage: {
    createMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  productSpecification: {
    createMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  inventory: {
    deleteMany: vi.fn(),
    create: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
}));

vi.mock("@/server/db", () => ({
  getPrismaClient: () => prismaMock,
}));

import {
  createAdminProduct,
  listAdminProducts,
  updateAdminProduct,
} from "@/features/admin/products";

describe("admin product service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies query and status filters when listing products", async () => {
    prismaMock.product.findMany.mockResolvedValue([]);

    await listAdminProducts({
      query: "wash",
      status: "PUBLISHED",
      type: "SIMPLE",
    });

    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "PUBLISHED",
          OR: expect.any(Array),
        }),
      }),
    );
  });

  it("creates a simple product with inventory and audit logging", async () => {
    prismaMock.category.findUnique.mockResolvedValue({ id: "category-1", name: "Skincare" });
    prismaMock.product.findMany.mockResolvedValue([]);
    prismaMock.product.create.mockResolvedValue({
      id: "product-1",
      name: "Daily Face Wash",
      slug: "daily-face-wash",
      shortDescription: "Gentle cleanser",
      description: "Longer description",
      status: "PUBLISHED",
      masterSku: "FACE-WASH-001",
      seoTitle: "Daily Face Wash",
      seoDescription: "Gentle cleanser for daily use",
      seoImageUrl: null,
      metadata: { variantsEnabled: false, relatedProductIds: [] },
      category: { id: "category-1", name: "Skincare", slug: "skincare" },
      variants: [],
      images: [],
      specifications: [],
      createdAt: new Date("2026-04-17T10:00:00.000Z"),
      updatedAt: new Date("2026-04-17T10:00:00.000Z"),
    });
    prismaMock.productVariant.create.mockResolvedValue({ id: "variant-1" });
    prismaMock.inventory.create.mockResolvedValue({ id: "inventory-1" });
    prismaMock.productImage.createMany.mockResolvedValue({ count: 1 });
    prismaMock.productSpecification.createMany.mockResolvedValue({ count: 1 });
    prismaMock.auditLog.create.mockResolvedValue({ id: "audit-1" });

    await createAdminProduct({
      data: {
        title: "Daily Face Wash",
        slug: "daily-face-wash",
        shortDescription: "Gentle cleanser",
        description: "Longer description",
        categoryId: "category-1",
        status: "PUBLISHED",
        sku: "FACE-WASH-001",
        price: 499,
        comparePrice: 599,
        stock: 20,
        variantsEnabled: false,
        variants: [],
        images: [{ url: "https://example.com/image.jpg", alt: "Hero image" }],
        specifications: [{ key: "Size", value: "200ml" }],
        relatedProductIds: [],
        seoTitle: "Daily Face Wash",
        seoDescription: "Gentle cleanser for daily use",
        seoImageUrl: undefined,
      },
      actor: {
        actorId: "admin-1",
        actorRole: "PRODUCT_MANAGER",
      },
    });

    expect(prismaMock.product.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.productVariant.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          productId: "product-1",
          sku: "FACE-WASH-001",
          price: 499,
          compareAtPrice: 599,
          isDefault: true,
        }),
      }),
    );
    expect(prismaMock.inventory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          productVariantId: "variant-1",
          quantity: 20,
        }),
      }),
    );
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "product.created",
          model: "Product",
          modelId: "product-1",
        }),
      }),
    );
  });

  it("creates a variant product and preserves SEO fields", async () => {
    prismaMock.category.findUnique.mockResolvedValue({ id: "category-1", name: "Apparel" });
    prismaMock.product.findMany.mockResolvedValue([{ id: "product-9" }]);
    prismaMock.product.create.mockResolvedValue({ id: "product-2" });
    prismaMock.product.findUnique.mockResolvedValue({
      id: "product-2",
      name: "Classic Tee",
      slug: "classic-tee",
      shortDescription: "Soft tee",
      description: "Soft tee with multiple sizes",
      status: "PUBLISHED",
      masterSku: "TEE-CLASSIC",
      seoTitle: "Classic Tee | One Dollar",
      seoDescription: "Soft cotton tee in multiple sizes.",
      seoImageUrl: "https://example.com/tee-seo.jpg",
      metadata: { variantsEnabled: true, relatedProductIds: ["product-9"] },
      category: { id: "category-1", name: "Apparel", slug: "apparel" },
      variants: [
        {
          id: "variant-1",
          title: "Small / Blue",
          sku: "TEE-S-BLU",
          options: { Size: "Small", Color: "Blue" },
          price: 799,
          compareAtPrice: 999,
          isDefault: true,
          inventory: { quantity: 5 },
        },
        {
          id: "variant-2",
          title: "Medium / Blue",
          sku: "TEE-M-BLU",
          options: { Size: "Medium", Color: "Blue" },
          price: 799,
          compareAtPrice: null,
          isDefault: false,
          inventory: { quantity: 8 },
        },
      ],
      images: [],
      specifications: [],
      createdAt: new Date("2026-04-17T10:00:00.000Z"),
      updatedAt: new Date("2026-04-17T10:00:00.000Z"),
    });
    prismaMock.productVariant.create
      .mockResolvedValueOnce({ id: "variant-1" })
      .mockResolvedValueOnce({ id: "variant-2" });
    prismaMock.inventory.create
      .mockResolvedValueOnce({ id: "inventory-1" })
      .mockResolvedValueOnce({ id: "inventory-2" });
    prismaMock.auditLog.create.mockResolvedValue({ id: "audit-variant" });

    const created = await createAdminProduct({
      data: {
        title: "Classic Tee",
        slug: "classic-tee",
        shortDescription: "Soft tee",
        description: "Soft tee with multiple sizes",
        categoryId: "category-1",
        status: "PUBLISHED",
        sku: "TEE-CLASSIC",
        price: 0,
        comparePrice: undefined,
        stock: 0,
        variantsEnabled: true,
        variants: [
          {
            title: "Small / Blue",
            sku: "TEE-S-BLU",
            price: 799,
            comparePrice: 999,
            stock: 5,
            options: { Size: "Small", Color: "Blue" },
            isDefault: true,
          },
          {
            title: "Medium / Blue",
            sku: "TEE-M-BLU",
            price: 799,
            comparePrice: undefined,
            stock: 8,
            options: { Size: "Medium", Color: "Blue" },
            isDefault: false,
          },
        ],
        images: [],
        specifications: [],
        relatedProductIds: ["product-9"],
        seoTitle: "Classic Tee | One Dollar",
        seoDescription: "Soft cotton tee in multiple sizes.",
        seoImageUrl: "https://example.com/tee-seo.jpg",
      },
      actor: {
        actorId: "admin-2",
        actorRole: "SUPER_ADMIN",
      },
    });

    expect(prismaMock.productVariant.create).toHaveBeenCalledTimes(2);
    expect(prismaMock.inventory.create).toHaveBeenCalledTimes(2);
    expect(created.variantsEnabled).toBe(true);
    expect(created.seoTitle).toBe("Classic Tee | One Dollar");
    expect(created.seoDescription).toBe("Soft cotton tee in multiple sizes.");
    expect(created.seoImageUrl).toBe("https://example.com/tee-seo.jpg");
  });

  it("updates a variant product and writes before/after audit data", async () => {
    prismaMock.category.findUnique.mockResolvedValue({ id: "category-1", name: "Apparel" });
    prismaMock.product.findMany.mockResolvedValue([{ id: "product-9" }]);
    prismaMock.product.findUnique
      .mockResolvedValueOnce({
        id: "product-1",
        name: "Classic Tee",
        slug: "classic-tee",
        status: "DRAFT",
        masterSku: "TEE-CLASSIC",
        metadata: { variantsEnabled: false, relatedProductIds: [] },
      })
      .mockResolvedValueOnce({
        id: "product-1",
        name: "Classic Tee",
        slug: "classic-tee",
        shortDescription: "Soft tee",
        description: "Soft tee with multiple sizes",
        status: "PUBLISHED",
        masterSku: "TEE-CLASSIC",
        seoTitle: "Classic Tee",
        seoDescription: "Soft tee",
        seoImageUrl: null,
        metadata: { variantsEnabled: true, relatedProductIds: ["product-9"] },
        category: { id: "category-1", name: "Apparel", slug: "apparel" },
        variants: [],
        images: [],
        specifications: [],
        createdAt: new Date("2026-04-17T10:00:00.000Z"),
        updatedAt: new Date("2026-04-17T12:00:00.000Z"),
      });
    prismaMock.product.update.mockResolvedValue({ id: "product-1" });
    prismaMock.productVariant.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.inventory.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.productImage.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.productSpecification.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.productVariant.create.mockResolvedValue({ id: "variant-2" });
    prismaMock.inventory.create.mockResolvedValue({ id: "inventory-2" });
    prismaMock.auditLog.create.mockResolvedValue({ id: "audit-2" });

    await updateAdminProduct({
      data: {
        id: "product-1",
        title: "Classic Tee",
        slug: "classic-tee",
        shortDescription: "Soft tee",
        description: "Soft tee with multiple sizes",
        categoryId: "category-1",
        status: "PUBLISHED",
        sku: "TEE-CLASSIC",
        price: 0,
        comparePrice: undefined,
        stock: 0,
        variantsEnabled: true,
        variants: [
          {
            title: "Small / Blue",
            sku: "TEE-S-BLU",
            price: 799,
            comparePrice: 999,
            stock: 5,
            options: { Size: "Small", Color: "Blue" },
            isDefault: true,
          },
        ],
        images: [],
        specifications: [],
        relatedProductIds: ["product-9"],
        seoTitle: "Classic Tee",
        seoDescription: "Soft tee",
        seoImageUrl: undefined,
      },
      actor: {
        actorId: "admin-1",
        actorRole: "SUPER_ADMIN",
      },
    });

    expect(prismaMock.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "product-1" },
        data: expect.objectContaining({
          name: "Classic Tee",
          slug: "classic-tee",
          status: "PUBLISHED",
        }),
      }),
    );
    expect(prismaMock.productVariant.deleteMany).toHaveBeenCalledWith({
      where: { productId: "product-1" },
    });
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "product.updated",
          modelId: "product-1",
          changes: expect.objectContaining({
            before: expect.objectContaining({
              status: "DRAFT",
            }),
            after: expect.objectContaining({
              status: "PUBLISHED",
            }),
          }),
        }),
      }),
    );
  });
});
