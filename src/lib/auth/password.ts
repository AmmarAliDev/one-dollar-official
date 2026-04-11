/**
 * Password hashing utilities using bcryptjs.
 *
 * bcryptjs is a pure-JS implementation — no native bindings, works in all
 * Node.js environments including Vercel edge/serverless functions.
 *
 * SALT_ROUNDS is set to 12 — a good balance between security and latency
 * (~300ms on a modern CPU). Increase to 13-14 for higher-security contexts.
 */

import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password with bcrypt.
 * Always await this — bcrypt is CPU-bound and takes ~300ms.
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

/**
 * Compare a plain-text password against a stored bcrypt hash.
 * Returns `true` if the password matches, `false` otherwise.
 * Constant-time comparison prevents timing attacks.
 */
export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}
