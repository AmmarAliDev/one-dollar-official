import type { AppError } from "@/lib/errors/app-error";

export type AdminOrderErrorCode =
  | "invalidInput"
  | "missingId"
  | "notFound"
  | "transitionInvalid"
  | "unchanged"
  | "updateFailed"
  | "noteFailed";

export type AdminOrderNoticeCode = "statusUpdated" | "noteSaved";

const noticeMessages: Record<AdminOrderNoticeCode, string> = {
  statusUpdated: "Order status updated successfully.",
  noteSaved: "Internal note saved successfully.",
};

const errorMessages: Record<AdminOrderErrorCode, string> = {
  invalidInput: "Please review the form and try again.",
  missingId: "The selected order is missing or no longer available.",
  notFound: "The selected order could not be found.",
  transitionInvalid: "That status change is not allowed for this order.",
  unchanged: "The order is already in that status.",
  updateFailed: "The order status could not be updated. Please try again.",
  noteFailed: "The internal note could not be saved. Please try again.",
};

export function getAdminOrderNoticeMessage(code: string | undefined) {
  if (!code) {
    return null;
  }

  return noticeMessages[code as AdminOrderNoticeCode] ?? null;
}

export function getAdminOrderErrorMessage(code: string | undefined, fallback: string | null = null) {
  if (!code) {
    return null;
  }

  return errorMessages[code as AdminOrderErrorCode] ?? fallback;
}

export function getAdminOrderErrorCode(error: AppError, fallback: AdminOrderErrorCode): AdminOrderErrorCode {
  switch (error.code) {
    case "ORDER_NOT_FOUND":
      return "notFound";
    case "ORDER_STATUS_TRANSITION_INVALID":
      return "transitionInvalid";
    case "ORDER_STATUS_UNCHANGED":
      return "unchanged";
    default:
      return fallback;
  }
}
