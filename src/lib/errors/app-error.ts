type AppErrorOptions = {
  cause?: unknown;
  exposeMessage?: boolean;
  statusCode?: number;
  userMessage?: string;
};

export class AppError extends Error {
  readonly code: string;
  readonly exposeMessage: boolean;
  readonly statusCode: number | undefined;
  readonly userMessage: string | undefined;

  constructor(message: string, code = "APP_ERROR", options?: AppErrorOptions) {
    super(message, options);
    this.name = new.target.name;
    this.code = code;
    this.exposeMessage = options?.exposeMessage ?? true;
    this.statusCode = options?.statusCode;
    this.userMessage = options?.userMessage;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
