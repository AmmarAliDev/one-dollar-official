import { describe, expect, it } from "vitest";

import {
  validateCategoryCreateInput,
  validateCategoryUpdateInput,
} from "@/features/admin/categories";

describe("admin category validation", () => {
  it("accepts valid category payloads", () => {
    const parsed = validateCategoryCreateInput({
      name: "Home Care",
      slug: "home-care",
      description: "Daily cleaning essentials.",
      categoryCardImageUrl: "https://cdn.example.com/categories/home-care.jpg",
      status: "PUBLISHED",
      seoTitle: "Home Care Products",
      seoDescription: "Browse home care essentials in Karachi.",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects malformed slugs", () => {
    const parsed = validateCategoryCreateInput({
      name: "Home Care",
      slug: "Home Care",
      description: "x",
      status: "DRAFT",
      seoTitle: "",
      seoDescription: "",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.errors.join(" ")).toMatch(/Slug must use lowercase letters/);
    }
  });

  it("requires id when updating", () => {
    const parsed = validateCategoryUpdateInput({
      name: "Home Care",
      slug: "home-care",
      status: "DRAFT",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.errors.join(" ")).toMatch(/Category ID is required/);
    }
  });

  it("accepts relative category card image paths", () => {
    const parsed = validateCategoryCreateInput({
      name: "Groceries",
      slug: "groceries",
      status: "DRAFT",
      categoryCardImageUrl: "/images/categories/groceries.jpg",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects unsafe category card image URLs", () => {
    const parsed = validateCategoryCreateInput({
      name: "Groceries",
      slug: "groceries",
      status: "DRAFT",
      categoryCardImageUrl: "javascript:alert(1)",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.errors.join(" ")).toMatch(/Category card image must be a valid full URL or start with/);
    }
  });
});
