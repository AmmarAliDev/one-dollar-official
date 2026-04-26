import type { AppError } from "@/lib/errors/app-error";

export type AdminStoreSettingsErrorCode = "saveFailed" | "invalidInput";

export type AdminStoreSettingsNoticeCode = "saved";

const noticeMessages: Record<AdminStoreSettingsNoticeCode, string> = {
  saved: "Store settings saved successfully.",
};

const errorMessages: Record<AdminStoreSettingsErrorCode, string> = {
  saveFailed: "Store settings could not be saved. Please try again.",
  invalidInput: "Please review the settings fields and fix the highlighted values.",
};

export function getAdminStoreSettingsNoticeMessage(code: string | undefined) {
  if (!code) {
    return null;
  }

  return noticeMessages[code as AdminStoreSettingsNoticeCode] ?? null;
}

export function getAdminStoreSettingsErrorMessage(code: string | undefined, fallback: string | null = null) {
  if (!code) {
    return null;
  }

  return errorMessages[code as AdminStoreSettingsErrorCode] ?? fallback;
}

export function getAdminStoreSettingsErrorCode(
  _error: AppError,
  fallback: AdminStoreSettingsErrorCode,
): AdminStoreSettingsErrorCode {
  return fallback;
}
