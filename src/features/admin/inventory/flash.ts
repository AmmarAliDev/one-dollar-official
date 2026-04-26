import type { AppError } from "@/lib/errors/app-error";

export const adminInventoryNoticeMessages = {
  updated: "Inventory updated successfully.",
} as const;

export const adminInventoryErrorMessages = {
  invalidInput: "Please check the adjustment details and try again.",
  invalidQuantity: "The requested quantity change is not allowed for this inventory record.",
  notFound: "This inventory record could not be found. It may have been removed.",
  concurrencyConflict: "This inventory row was updated by another user. Refresh and try again.",
  updateFailed: "Inventory could not be updated right now. Please try again.",
} as const;

export type AdminInventoryNoticeCode = keyof typeof adminInventoryNoticeMessages;
export type AdminInventoryErrorCode = keyof typeof adminInventoryErrorMessages;

export function getAdminInventoryNoticeMessage(code: string | undefined) {
  if (!code) {
    return null;
  }

  return adminInventoryNoticeMessages[code as AdminInventoryNoticeCode] ?? null;
}

export function getAdminInventoryErrorMessage(code: string | undefined) {
  if (!code) {
    return null;
  }

  return adminInventoryErrorMessages[code as AdminInventoryErrorCode] ?? null;
}

export function getAdminInventoryErrorCode(
  error: AppError,
  fallback: AdminInventoryErrorCode,
): AdminInventoryErrorCode {
  switch (error.code) {
    case "INVENTORY_NOT_FOUND":
      return "notFound";
    case "INVENTORY_INVALID_QUANTITY":
      return "invalidQuantity";
    case "INVENTORY_UPDATE_CONFLICT":
      return "concurrencyConflict";
    default:
      return fallback;
  }
}
