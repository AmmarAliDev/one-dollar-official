import { createHash, randomBytes } from "node:crypto";

const EMAIL_VERIFICATION_TOKEN_BYTES = 32;
export const EMAIL_VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export function hashEmailVerificationToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function createEmailVerificationTokenPair(now = new Date()) {
  const token = randomBytes(EMAIL_VERIFICATION_TOKEN_BYTES).toString("base64url");

  return {
    token,
    tokenHash: hashEmailVerificationToken(token),
    expiresAt: new Date(now.getTime() + EMAIL_VERIFICATION_TOKEN_TTL_MS),
  };
}

export function isEmailVerificationTokenExpired(expiresAt: Date, now = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}

export function buildEmailVerificationUrl(appUrl: string, path: string, token: string): string {
  const url = new URL(path, appUrl);
  url.searchParams.set("token", token);
  return url.toString();
}
