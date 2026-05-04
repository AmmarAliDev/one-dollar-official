import type { AppError } from "@/lib/errors/app-error";

export type HomepageContentErrorCode =
  | "createFailed"
  | "deleteFailed"
  | "updateFailed"
  | "invalidInput"
  | "missingId"
  | "notFound"
  | "alreadySeeded";

export type HomepageContentNoticeCode = "created" | "updated" | "deleted" | "seeded";

const noticeMessages: Record<HomepageContentNoticeCode, string> = {
  created: "Homepage content saved successfully.",
  updated: "Homepage content changes saved successfully.",
  deleted: "Homepage content removed successfully.",
  seeded: "Homepage defaults copied from the storefront fallback content.",
};

const errorMessages: Record<HomepageContentErrorCode, string> = {
  createFailed: "The homepage item could not be created. Please try again.",
  deleteFailed: "The homepage item could not be removed. Please try again.",
  updateFailed: "The homepage item could not be updated. Please try again.",
  invalidInput: "Please review the content details and fix the highlighted information.",
  missingId: "The selected homepage item is missing or no longer available.",
  notFound: "The selected homepage item could not be found.",
  alreadySeeded: "Homepage defaults are already available for editing.",
};

export function getHomepageContentNoticeMessage(code: string | undefined) {
  if (!code) {
    return null;
  }

  return noticeMessages[code as HomepageContentNoticeCode] ?? null;
}

export function getHomepageContentErrorMessage(code: string | undefined, fallback: string | null = null) {
  if (!code) {
    return null;
  }

  return errorMessages[code as HomepageContentErrorCode] ?? fallback;
}

export function getHomepageContentErrorCode(
  error: AppError,
  fallback: HomepageContentErrorCode,
): HomepageContentErrorCode {
  switch (error.code) {
    case "HOMEPAGE_CONTENT_NOT_FOUND":
      return "notFound";
    default:
      return fallback;
  }
}
