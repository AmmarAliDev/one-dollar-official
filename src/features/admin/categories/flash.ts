import { AppError } from "@/lib/errors/app-error";

export const CATEGORY_NOTICE_MESSAGES = {
  created: "Category created.",
  updated: "Category updated.",
  deleted: "Category deleted.",
} as const;

export const CATEGORY_ERROR_MESSAGES = {
  invalidInput: "Invalid category input.",
  missingId: "Category ID is missing.",
  slugTaken: "This slug is already used by another category.",
  hasProducts: "Move products out of this category before deleting it.",
  hasRelatedRecords: "This category has related records preventing deletion. Remove or reassign them before deleting.",
  notFound: "The selected category no longer exists.",
  createFailed: "Could not create category.",
  updateFailed: "Could not update category.",
  deleteFailed: "Could not delete category.",
  unexpected: "Something went wrong. Please try again.",
} as const;

export type CategoryNoticeCode = keyof typeof CATEGORY_NOTICE_MESSAGES;
export type CategoryErrorCode = keyof typeof CATEGORY_ERROR_MESSAGES;

export function getCategoryNoticeMessage(code?: string): string | null {
  if (!code) {
    return null;
  }

  return CATEGORY_NOTICE_MESSAGES[code as CategoryNoticeCode] ?? "Action completed.";
}

export function getCategoryErrorMessage(code?: string): string | null {
  if (!code) {
    return null;
  }

  return CATEGORY_ERROR_MESSAGES[code as CategoryErrorCode] ?? CATEGORY_ERROR_MESSAGES.unexpected;
}

export function getCategoryErrorCode(error: AppError, fallback: CategoryErrorCode): CategoryErrorCode {
  switch (error.code) {
    case "CATEGORY_SLUG_TAKEN":
      return "slugTaken";
    case "CATEGORY_HAS_PRODUCTS":
      return "hasProducts";
    case "CATEGORY_HAS_RELATED_RECORDS":
      return "hasRelatedRecords";
    case "CATEGORY_NOT_FOUND":
      return "notFound";
    case "VALIDATION_ERROR":
      return "invalidInput";
    default:
      return fallback;
  }
}
