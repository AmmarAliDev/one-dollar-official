import { describe, expect, it } from "vitest";

import { validateProductImageInput } from "@/server/db/validators";

describe("validateProductImageInput", () => {
  it("throws when both productId and productVariantId are absent", () => {
    expect(() => validateProductImageInput({})).toThrow(
      "ProductImage must reference at least one of productId or productVariantId",
    );
  });

  it("throws when both are explicitly null", () => {
    expect(() =>
      validateProductImageInput({ productId: null, productVariantId: null }),
    ).toThrow("ProductImage must reference at least one of productId or productVariantId");
  });

  it("passes when productId is provided", () => {
    expect(() =>
      validateProductImageInput({ productId: "product-1" }),
    ).not.toThrow();
  });

  it("passes when productVariantId is provided", () => {
    expect(() =>
      validateProductImageInput({ productVariantId: "variant-1" }),
    ).not.toThrow();
  });

  it("passes when both are provided", () => {
    expect(() =>
      validateProductImageInput({ productId: "product-1", productVariantId: "variant-1" }),
    ).not.toThrow();
  });
});
