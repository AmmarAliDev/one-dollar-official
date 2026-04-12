import { ZodError } from "zod";

import { AppError } from "./app-error";

const DEFAULT_ERROR_MESSAGE = "Something went wrong on our side. Please try again in a moment.";
const NETWORK_ERROR_MESSAGE =
  "We could not reach the service right now. Please check your connection and try again.";
const VALIDATION_ERROR_MESSAGE =
  "Some details are missing or invalid. Please review them and try again.";

const safeMessagesByCode: Record<string, string> = {
  AUTH_REQUIRED: "Please sign in to continue",
  CONFIG_ERROR: "This part of the app is not configured correctly yet. Please try again later.",
  FORBIDDEN: "You do not have permission to perform that action.",
  INTERNAL_ERROR: DEFAULT_ERROR_MESSAGE,
  NETWORK_ERROR: NETWORK_ERROR_MESSAGE,
  NOT_FOUND: "The requested item could not be found.",
  RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
  VALIDATION_ERROR: VALIDATION_ERROR_MESSAGE,
};

function dedupeMessages(messages: string[]) {
  return [...new Set(messages.map((message) => message.trim()).filter(Boolean))];
}

function collectFormMessages(input: unknown): string[] {
  if (!input) {
    return [];
  }

  if (typeof input === "string") {
    return [input];
  }

  if (input instanceof AppError) {
    return [toUserMessage(input)];
  }

  if (input instanceof ZodError) {
    return input.issues.map((issue) => issue.message);
  }

  if (input instanceof Error) {
    return input.message.trim() ? [input.message] : [DEFAULT_ERROR_MESSAGE];
  }

  if (Array.isArray(input)) {
    return input.flatMap((value) => collectFormMessages(value));
  }

  if (typeof input === "object") {
    return Object.values(input as Record<string, unknown>).flatMap((value) =>
      collectFormMessages(value),
    );
  }

  return [];
}

export function getFormErrorMessages(errors: unknown) {
  return dedupeMessages(collectFormMessages(errors));
}

export function toUserMessage(error: unknown) {
  if (error instanceof AppError) {
    const safeUserMessage = error.userMessage?.trim();
    const safeMessageByCode = safeMessagesByCode[error.code];

    if (safeUserMessage) {
      return safeUserMessage;
    }

    if (safeMessageByCode) {
      return safeMessageByCode;
    }

    if (error.exposeMessage && error.message.trim().length > 0) {
      return error.message;
    }
  }

  if (error instanceof ZodError) {
    return VALIDATION_ERROR_MESSAGE;
  }

  const rawMessage =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";

  if (
    /(failed to fetch|network ?error|network request|load failed|fetch failed)/i.test(rawMessage)
  ) {
    return NETWORK_ERROR_MESSAGE;
  }

  return DEFAULT_ERROR_MESSAGE;
}

export { DEFAULT_ERROR_MESSAGE, NETWORK_ERROR_MESSAGE, VALIDATION_ERROR_MESSAGE };
