type LogLevel = "debug" | "info" | "warn" | "error";

const REDACTED_VALUE = "[REDACTED]";
const MAX_DEPTH = 4;
const sensitiveKeyPattern = /(pass(word)?|token|secret|authorization|cookie|session|api[-_]?key)/i;

export function sanitizeForLogging(value: unknown, depth = 0): unknown {
  if (value == null || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Error) {
    const serializedError: Record<string, unknown> = {
      name: value.name,
      message: value.message,
    };

    if ("code" in value && typeof value.code === "string") {
      serializedError.code = value.code;
    }

    if (process.env.NODE_ENV === "development" && value.stack) {
      serializedError.stack = value.stack;
    }

    return serializedError;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLogging(item, depth + 1));
  }

  if (typeof value === "object") {
    if (depth >= MAX_DEPTH) {
      return "[MaxDepthExceeded]";
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        sensitiveKeyPattern.test(key)
          ? REDACTED_VALUE
          : sanitizeForLogging(nestedValue, depth + 1),
      ]),
    );
  }

  return String(value);
}

function writeLog(level: LogLevel, scope: string, message: string, meta?: unknown) {
  const method = console[level] ?? console.log;
  const prefix = `[${scope}] ${message}`;

  if (meta === undefined) {
    method(prefix);
    return;
  }

  method(prefix, sanitizeForLogging(meta));
}

export function createLogger(scope: string) {
  return {
    debug(message: string, meta?: unknown) {
      writeLog("debug", scope, message, meta);
    },
    info(message: string, meta?: unknown) {
      writeLog("info", scope, message, meta);
    },
    warn(message: string, meta?: unknown) {
      writeLog("warn", scope, message, meta);
    },
    error(message: string, meta?: unknown) {
      writeLog("error", scope, message, meta);
    },
    child(childScope: string) {
      return createLogger(`${scope}:${childScope}`);
    },
  };
}

export const logger = createLogger(typeof window === "undefined" ? "server" : "client");
