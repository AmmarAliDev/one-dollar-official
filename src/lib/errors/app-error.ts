export class AppError extends Error {
  readonly code: string;

  constructor(message: string, code = "APP_ERROR", options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AppError";
    this.code = code;
  }
}
