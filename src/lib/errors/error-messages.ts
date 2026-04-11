import { AppError } from "./app-error";

const DEFAULT_ERROR_MESSAGE = "Something went wrong on our side. Please try again in a moment.";

export function toUserMessage(error: unknown) {
  if (error instanceof AppError && error.message.trim().length > 0) {
    return error.message;
  }

  return DEFAULT_ERROR_MESSAGE;
}

export { DEFAULT_ERROR_MESSAGE };
