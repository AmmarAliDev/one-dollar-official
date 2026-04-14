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
});
