/**
 * Rate-limit foundation for auth routes.
 *
 * Current implementation: in-memory sliding window (development/single-instance).
 * Production path: swap the store for a Redis-backed implementation.
 *
 * Redis upgrade path (Prompt 2.5):
 *  1. Add `ioredis` or `@upstash/ratelimit` dependency.
 *  2. Replace `MemoryStore` with a Redis store using the same interface.
 *  3. No changes needed in callers — `checkRateLimit` signature is stable.
 *
 * NOTE: The in-memory store is NOT shared across Vercel/serverless instances.
 *       It is suitable for development and provides the right abstraction
 *       boundary for a Redis upgrade. Do NOT use in horizontally-scaled prod.
 */

export interface RateLimitOptions {
  /** Unique identifier for the requester (e.g. IP, email, user ID). */
  identifier: string;
  /** Action name used as a namespace key (e.g. "auth:sign-in"). */
  action: string;
  /** Maximum requests allowed within the window. Default: 5. */
  limit?: number;
  /** Time window in milliseconds. Default: 60 000 (1 minute). */
  windowMs?: number;
}

export interface RateLimitResult {
  /** `true` if the request is within limit; `false` if it should be blocked. */
  success: boolean;
  /** Requests remaining in the current window. */
  remaining: number;
  /** Timestamp when the current window resets. */
  reset: Date;
}

/** In-memory store — replaced by Redis in production (see upgrade path above). */
interface MemoryEntry {
  count: number;
  resetAt: number; // Unix ms timestamp
}

const memoryStore = new Map<string, MemoryEntry>();

/**
 * Check whether an action by the given identifier is within rate limits.
 *
 * @example
 * const result = await checkRateLimit({ identifier: ip, action: "auth:sign-in" });
 * if (!result.success) return { error: "Too many attempts. Please wait." };
 */
export async function checkRateLimit({
  identifier,
  action,
  limit = 5,
  windowMs = 60_000,
}: RateLimitOptions): Promise<RateLimitResult> {
  const key = `${action}:${identifier}`;
  const now = Date.now();
  const entry = memoryStore.get(key);

  // Window expired or first request — start a fresh window.
  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    memoryStore.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, reset: new Date(resetAt) };
  }

  // Window is active and limit reached.
  if (entry.count >= limit) {
    return { success: false, remaining: 0, reset: new Date(entry.resetAt) };
  }

  // Increment and allow.
  entry.count += 1;
  return { success: true, remaining: limit - entry.count, reset: new Date(entry.resetAt) };
}
