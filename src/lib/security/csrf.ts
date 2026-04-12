import { headers } from "next/headers";

import { getTrustedOrigins } from "@/config/security";
import { AppError } from "@/lib/errors/app-error";

const SAFE_HTTP_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
export const CSRF_ERROR_MESSAGE =
  "We could not verify your request. Refresh the page and try again.";

export interface CsrfValidationResult {
  success: boolean;
  requestOrigin: string | null;
  allowedOrigins: string[];
}

function normalizeOrigin(value: string | undefined | null): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value.trim()).origin;
  } catch {
    return null;
  }
}

function getDerivedHostOrigin(input: {
  host?: string | null;
  forwardedHost?: string | null;
  forwardedProto?: string | null;
}): string | null {
  const host = input.forwardedHost?.split(",").at(-1)?.trim() ?? input.host?.trim();

  if (!host) {
    return null;
  }

  const protocol =
    input.forwardedProto?.split(",").at(0)?.trim() ??
    (process.env.NODE_ENV === "production" ? "https" : "http");

  return normalizeOrigin(`${protocol}://${host}`);
}

export function validateRequestOrigin(input: {
  method?: string;
  origin?: string | null;
  referer?: string | null;
  host?: string | null;
  forwardedHost?: string | null;
  forwardedProto?: string | null;
  rawEnv?: Readonly<Record<string, string | undefined>>;
  allowMissingOriginInDevelopment?: boolean;
}): CsrfValidationResult {
  const rawEnv = input.rawEnv ?? process.env;
  const method = (input.method ?? "POST").toUpperCase();
  const allowedOrigins = new Set<string>(getTrustedOrigins(rawEnv));
  const hostOrigin = getDerivedHostOrigin(input);

  if (hostOrigin) {
    allowedOrigins.add(hostOrigin);
  }

  if (SAFE_HTTP_METHODS.has(method)) {
    return {
      success: true,
      requestOrigin: null,
      allowedOrigins: [...allowedOrigins],
    };
  }

  const requestOrigin = normalizeOrigin(input.origin) ?? normalizeOrigin(input.referer);

  if (!requestOrigin) {
    return {
      success: Boolean(input.allowMissingOriginInDevelopment) && rawEnv.NODE_ENV !== "production",
      requestOrigin: null,
      allowedOrigins: [...allowedOrigins],
    };
  }

  return {
    success: allowedOrigins.has(requestOrigin),
    requestOrigin,
    allowedOrigins: [...allowedOrigins],
  };
}

function throwCsrfError(action: string): never {
  throw new AppError(`${action} failed request-origin validation.`, "FORBIDDEN", {
    exposeMessage: false,
    statusCode: 403,
    userMessage: CSRF_ERROR_MESSAGE,
  });
}

export async function assertTrustedOrigin(
  options: {
    action?: string;
    method?: string;
    allowMissingOriginInDevelopment?: boolean;
  } = {},
): Promise<CsrfValidationResult> {
  const headerList = await headers();
  const result = validateRequestOrigin({
    method: options.method ?? "POST",
    origin: headerList.get("origin"),
    referer: headerList.get("referer"),
    host: headerList.get("host"),
    forwardedHost: headerList.get("x-forwarded-host"),
    forwardedProto: headerList.get("x-forwarded-proto"),
    allowMissingOriginInDevelopment: options.allowMissingOriginInDevelopment ?? true,
  });

  if (!result.success) {
    throwCsrfError(options.action ?? "Server action");
  }

  return result;
}

export function assertTrustedRouteHandlerRequest(
  request: Request,
  options: {
    action?: string;
    allowMissingOriginInDevelopment?: boolean;
  } = {},
): CsrfValidationResult {
  const result = validateRequestOrigin({
    method: request.method,
    origin: request.headers.get("origin"),
    referer: request.headers.get("referer"),
    host: request.headers.get("host"),
    forwardedHost: request.headers.get("x-forwarded-host"),
    forwardedProto: request.headers.get("x-forwarded-proto"),
    allowMissingOriginInDevelopment: options.allowMissingOriginInDevelopment ?? false,
  });

  if (!result.success) {
    throwCsrfError(options.action ?? "Route handler");
  }

  return result;
}

export function getClientIp(headerList: Pick<Headers, "get">): string {
  const rawIp =
    headerList.get("x-real-ip")?.trim() ??
    headerList.get("x-forwarded-for")?.split(",").at(-1)?.trim() ??
    "unknown";

  return rawIp.slice(0, 64);
}
