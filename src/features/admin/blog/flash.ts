import type { AppError } from "@/lib/errors/app-error";

export type BlogNoticeCode = "created" | "updated" | "deleted";
export type BlogErrorCode =
  | "createFailed"
  | "updateFailed"
  | "deleteFailed"
  | "invalidInput"
  | "missingId"
  | "notFound"
  | "slugTaken";

const noticeMessages: Record<BlogNoticeCode, string> = {
  created: "Blog post created.",
  updated: "Blog post updated.",
  deleted: "Blog post deleted.",
};

const errorMessages: Record<BlogErrorCode, string> = {
  createFailed: "Could not create blog post. Please try again.",
  updateFailed: "Could not update blog post. Please try again.",
  deleteFailed: "Could not delete blog post. Please try again.",
  invalidInput: "Please review the form and fix the highlighted details.",
  missingId: "The selected blog post is missing.",
  notFound: "The selected blog post no longer exists.",
  slugTaken: "That blog URL is already in use. Choose a unique slug.",
};

export function getBlogNoticeMessage(code: string | undefined) {
  if (!code) {
    return null;
  }

  return noticeMessages[code as BlogNoticeCode] ?? null;
}

export function getBlogErrorMessage(code: string | undefined, fallback: string | null = null) {
  if (!code) {
    return null;
  }

  return errorMessages[code as BlogErrorCode] ?? fallback;
}

export function getBlogErrorCode(error: AppError, fallback: BlogErrorCode): BlogErrorCode {
  switch (error.code) {
    case "BLOG_POST_NOT_FOUND":
      return "notFound";
    case "BLOG_POST_SLUG_TAKEN":
      return "slugTaken";
    case "VALIDATION_ERROR":
      return "invalidInput";
    default:
      return fallback;
  }
}
