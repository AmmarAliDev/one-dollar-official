import { createHash, randomBytes } from "node:crypto";

const RESET_TOKEN_BYTES = 32;
export const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function createPasswordResetTokenPair(now = new Date()) {
  const token = randomBytes(RESET_TOKEN_BYTES).toString("base64url");

  return {
    token,
    tokenHash: hashPasswordResetToken(token),
    expiresAt: new Date(now.getTime() + PASSWORD_RESET_TOKEN_TTL_MS),
  };
}

export function isPasswordResetTokenExpired(expiresAt: Date, now = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}

export function buildPasswordResetUrl(appUrl: string, path: string, token: string): string {
  const url = new URL(path, appUrl);
  url.searchParams.set("token", token);
  return url.toString();
}
