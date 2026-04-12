import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { logger } from "@/lib/logger";

import { AppError } from "./app-error";
import { DEFAULT_ERROR_MESSAGE, toUserMessage, VALIDATION_ERROR_MESSAGE } from "./error-messages";

type NormalizeErrorOptions = {
  code?: string;
  exposeMessage?: boolean;
  message?: string;
  statusCode?: number;
  userMessage?: string;
};

type CaptureErrorOptions = NormalizeErrorOptions & {
  headers?: HeadersInit;
  meta?: Record<string, unknown>;
};

export function createValidationAppError(
  error: ZodError,
  message = "Request validation failed.",
): AppError {
  return new AppError(message, "VALIDATION_ERROR", {
    cause: error,
    exposeMessage: false,
    statusCode: 400,
    userMessage: VALIDATION_ERROR_MESSAGE,
  });
}

export function toAppError(error: unknown, options: NormalizeErrorOptions = {}): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return createValidationAppError(error, options.message);
  }

  if (error instanceof Error) {
    return new AppError(
      error.message || options.message || "Unexpected server error.",
      options.code ?? "INTERNAL_ERROR",
      {
        cause: error,
        exposeMessage: options.exposeMessage ?? false,
        statusCode: options.statusCode ?? 500,
        userMessage: options.userMessage,
      },
    );
  }

  return new AppError(
    options.message ?? "Unexpected server error.",
    options.code ?? "INTERNAL_ERROR",
    {
      cause: error,
      exposeMessage: options.exposeMessage ?? false,
      statusCode: options.statusCode ?? 500,
      userMessage: options.userMessage,
    },
  );
}

export function captureServerError(
  error: unknown,
  context: string,
  options: CaptureErrorOptions = {},
): AppError {
  const appError = toAppError(error, options);
  const logMethod = appError.statusCode && appError.statusCode < 500 ? logger.warn : logger.error;

  logMethod(`${context}: request failed`, {
    code: appError.code,
    err: error,
    statusCode: appError.statusCode,
    ...options.meta,
  });

  return appError;
}

export function toActionErrorState(
  error: unknown,
  context: string,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
  options: CaptureErrorOptions = {},
): { errors: string[] } {
  const appError = captureServerError(error, context, {
    ...options,
    userMessage: options.userMessage ?? fallbackMessage,
  });

  return {
    errors: [toUserMessage(appError)],
  };
}

export function createRouteHandlerErrorResponse(
  error: unknown,
  context: string,
  options: CaptureErrorOptions = {},
): NextResponse {
  const appError = captureServerError(error, context, options);

  return NextResponse.json(
    {
      code: appError.code,
      error: toUserMessage(appError),
    },
    {
      ...(options.headers ? { headers: options.headers } : {}),
      status: appError.statusCode ?? 500,
    },
  );
}
