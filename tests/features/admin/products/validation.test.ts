import { describe, expect, it } from "vitest";

import {
  validateAdminProductCreateInput,
  validateAdminProductUpdateInput,
} from "@/features/admin/products";

describe("admin product validation", () => {
  it("accepts a valid simple product payload", () => {
    const parsed = validateAdminProductCreateInput({
      title: "Daily Face Wash",
      slug: "daily-face-wash",
      shortDescription: "Gentle cleanser for everyday use.",
      description: "A friendly cleanser for morning and night routines.",
      categoryId: "category-1",
      status: "PUBLISHED",
      sku: "FACE-WASH-001",
      price: "499",
      comparePrice: "599",
      stock: "24",
      variantsEnabled: false,
      variants: [],
      images: [{ url: "https://example.com/face-wash.jpg", alt: "Bottle on sink" }],
      specifications: [{ key: "Size", value: "200ml" }],
      relatedProductIds: ["product-2"],
      seoTitle: "Daily Face Wash | One Dollar",
      seoDescription: "Gentle cleanser for fresh daily skincare.",
      seoImageUrl: "https://example.com/seo-face-wash.jpg",
    });

    expect(parsed.success).toBe(true);
  });

  it("accepts a valid variant product payload", () => {
    const parsed = validateAdminProductCreateInput({
      title: "Classic Tee",
      slug: "classic-tee",
      shortDescription: "Soft everyday basic.",
      description: "Comfortable cotton t-shirt with multiple sizes.",
      categoryId: "category-1",
      status: "DRAFT",
      sku: "TEE-CLASSIC",
      price: "0",
      comparePrice: "",
      stock: "0",
      variantsEnabled: true,
      variants: [
        {
          title: "Small / Blue",
          sku: "TEE-S-BLU",
          price: "799",
          comparePrice: "999",
          stock: "5",
          options: "Size: Small, Color: Blue",
          isDefault: true,
        },
        {
          title: "Medium / Blue",
          sku: "TEE-M-BLU",
          price: "799",
          comparePrice: "",
          stock: "8",
          options: "Size: Medium, Color: Blue",
          isDefault: false,
        },
      ],
      images: [],
      specifications: [],
      relatedProductIds: [],
      seoTitle: "Classic Tee",
      seoDescription: "Shop the classic tee in multiple sizes.",
      seoImageUrl: "",
    });

    expect(parsed.success).toBe(true);

    if (parsed.success) {
      expect(parsed.data.variantsEnabled).toBe(true);
      expect(parsed.data.variants).toHaveLength(2);
      expect(parsed.data.variants[0]?.options).toEqual({
        Size: "Small",
        Color: "Blue",
      });
    }
  });

  it("rejects variant products without usable variant rows", () => {
    const parsed = validateAdminProductCreateInput({
      title: "Bundle",
      slug: "bundle",
      shortDescription: "Starter bundle",
      description: "Starter bundle",
      categoryId: "category-1",
      status: "DRAFT",
      sku: "BUNDLE-1",
      price: "0",
      comparePrice: "",
      stock: "0",
      variantsEnabled: true,
      variants: [],
      images: [],
      specifications: [],
      relatedProductIds: [],
      seoTitle: "",
      seoDescription: "",
      seoImageUrl: "",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.errors.join(" ")).toMatch(/variant/i);
    }
  });

  it("requires an id for updates", () => {
    const parsed = validateAdminProductUpdateInput({
      title: "Daily Face Wash",
      slug: "daily-face-wash",
      categoryId: "category-1",
      status: "PUBLISHED",
      sku: "FACE-WASH-001",
      price: "499",
      stock: "12",
      variantsEnabled: false,
      variants: [],
      images: [],
      specifications: [],
      relatedProductIds: [],
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.errors.join(" ")).toMatch(/Product ID is required/i);
    }
  });
});
