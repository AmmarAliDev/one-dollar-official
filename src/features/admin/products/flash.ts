import type { AppError } from "@/lib/errors/app-error";

export type ProductErrorCode =
  | "createFailed"
  | "updateFailed"
  | "invalidInput"
  | "missingId"
  | "notFound"
  | "slugTaken"
  | "skuTaken"
  | "invalidCategory"
  | "invalidRelated"
  | "productInUse";

export type ProductNoticeCode = "created" | "updated";

const noticeMessages: Record<ProductNoticeCode, string> = {
  created: "Product saved successfully.",
  updated: "Product changes saved successfully.",
};

const errorMessages: Record<ProductErrorCode, string> = {
  createFailed: "The product could not be created. Please try again.",
  updateFailed: "The product could not be updated. Please try again.",
  invalidInput: "Please review the form and fix the highlighted information.",
  missingId: "The selected product is missing or no longer available.",
  notFound: "The selected product could not be found.",
  slugTaken: "That product URL is already in use. Update the slug so the page address stays unique.",
  skuTaken: "This SKU is already being used by another product or variant.",
  invalidCategory: "Choose a valid category before saving the product.",
  invalidRelated: "One or more related products are no longer available.",
  productInUse: "This product has linked records that prevent that save pattern. Review variants and try again.",
};

export function getProductNoticeMessage(code: string | undefined) {
  if (!code) {
    return null;
  }

  return noticeMessages[code as ProductNoticeCode] ?? null;
}

export function getProductErrorMessage(code: string | undefined, fallback: string | null = null) {
  if (!code) {
    return null;
  }

  return errorMessages[code as ProductErrorCode] ?? fallback;
}

export function getProductErrorCode(error: AppError, fallback: ProductErrorCode): ProductErrorCode {
  switch (error.code) {
    case "PRODUCT_NOT_FOUND":
      return "notFound";
    case "PRODUCT_SLUG_TAKEN":
      return "slugTaken";
    case "PRODUCT_SKU_TAKEN":
      return "skuTaken";
    case "PRODUCT_CATEGORY_INVALID":
      return "invalidCategory";
    case "PRODUCT_RELATED_INVALID":
      return "invalidRelated";
    case "PRODUCT_IN_USE":
      return "productInUse";
    default:
      return fallback;
  }
}
