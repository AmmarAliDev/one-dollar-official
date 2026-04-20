import type { AppError } from "@/lib/errors/app-error";

export const adminReviewNoticeMessages = {
  updated: "Review moderation was updated successfully.",
} as const;

export const adminReviewErrorMessages = {
  invalidInput: "Please review the moderation request and try again.",
  invalidAction: "That moderation action is not supported.",
  migrationRequired: "Review moderation needs the latest database migration. Please apply migrations and refresh this page.",
  notFound: "This review could not be found. It may already have been removed.",
  updateFailed: "The review could not be updated right now. Please try again.",
} as const;

export type AdminReviewNoticeCode = keyof typeof adminReviewNoticeMessages;
export type AdminReviewErrorCode = keyof typeof adminReviewErrorMessages;

export function getAdminReviewNoticeMessage(code: string | undefined) {
  if (!code) {
    return null;
  }

  return adminReviewNoticeMessages[code as AdminReviewNoticeCode] ?? null;
}

export function getAdminReviewErrorMessage(code: string | undefined) {
  if (!code) {
    return null;
  }

  return adminReviewErrorMessages[code as AdminReviewErrorCode] ?? null;
}

export function getAdminReviewErrorCode(error: AppError, fallback: AdminReviewErrorCode): AdminReviewErrorCode {
  switch (error.code) {
    case "REVIEW_NOT_FOUND":
      return "notFound";
    case "REVIEW_INVALID_STATUS":
      return "invalidAction";
    case "REVIEW_INVALID_ID":
      return "invalidInput";
    case "REVIEW_SCHEMA_OUTDATED":
      return "migrationRequired";
    default:
      return fallback;
  }
}
