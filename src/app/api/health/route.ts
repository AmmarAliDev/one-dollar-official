/**
 * Health / readiness endpoint — GET /api/health
 *
 * Returns a lightweight JSON status document that Vercel health checks,
 * load balancers, uptime monitors, and deployment pipelines can poll.
 *
 * Response shape:
 *   200 OK   — { status: "ok", uptime, timestamp, version, checks: { db, env } }
 *   503      — same shape with status "degraded" when a critical check fails
 *
 * Checks performed:
 *   • env  — validates required environment variables are present
 *   • db   — issues a lightweight `SELECT 1` against PostgreSQL to confirm
 *             the connection pool is alive
 *
 * This endpoint is intentionally public (no auth guard). It must not expose
 * internal error details to callers — only a pass/fail signal per check.
 *
 * Deployment note: Add `/api/health` as the health-check path in Vercel
 * or any upstream load balancer. A non-200 response signals a bad instance.
 */

import { NextResponse } from "next/server";

import { createLogger } from "@/lib/logger";
import { getPrismaClient } from "@/server/db/client";

// Prevent this route from being statically cached — it must always be dynamic.
export const dynamic = "force-dynamic";

const logger = createLogger("api:health");

/** Shape of a single check result. */
interface CheckResult {
  status: "pass" | "fail";
  /** Human-readable detail, only included on failure. */
  detail?: string;
}

/** Full response body. */
interface HealthResponse {
  status: "ok" | "degraded";
  /** Process uptime in seconds. */
  uptime: number;
  /** ISO 8601 timestamp of this response. */
  timestamp: string;
  /** Value of NEXT_PUBLIC_APP_URL — identifies the deployment target. */
  appUrl: string;
  checks: {
    env: CheckResult;
    db: CheckResult;
  };
}

/**
 * Verify that the minimum set of environment variables required for the app
 * to function are present. This is a fast string-presence check — the full
 * Zod validation runs at startup and is not repeated here.
 */
function checkEnv(): CheckResult {
  const required = ["DATABASE_URL", "AUTH_SECRET"] as const;
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.error("Health check — required environment variables missing", { missing });
    return { status: "fail", detail: "Environment configuration incomplete" };
  }

  return { status: "pass" };
}

/**
 * Ping the database with a raw `SELECT 1` query.
 * Uses the shared Prisma singleton so the connection pool is warmed.
 * Times out after 5 seconds to avoid blocking Vercel health checks.
 */
async function checkDatabase(): Promise<CheckResult> {
  const TIMEOUT_MS = 5_000;

  try {
    const prisma = getPrismaClient();

    await Promise.race([
      // Prisma's $queryRaw is the lightest possible probe — one round-trip, no table scan.
      prisma.$queryRaw`SELECT 1`,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("DB health check timed out")), TIMEOUT_MS),
      ),
    ]);

    return { status: "pass" };
  } catch (error) {
    // Never expose connection strings or internal error details to callers.
    logger.error("Health check — database probe failed", { error });
    return { status: "fail", detail: "Database unreachable" };
  }
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const [envCheck, dbCheck] = await Promise.all([
    Promise.resolve(checkEnv()),
    checkDatabase(),
  ]);

  const allPassed = envCheck.status === "pass" && dbCheck.status === "pass";
  const status: HealthResponse["status"] = allPassed ? "ok" : "degraded";

  const body: HealthResponse = {
    status,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "unknown",
    checks: {
      env: envCheck,
      db: dbCheck,
    },
  };

  if (!allPassed) {
    logger.warn("Health check returned degraded status", { checks: body.checks });
  }

  return NextResponse.json(body, { status: allPassed ? 200 : 503 });
}
