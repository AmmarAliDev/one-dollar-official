import fs from "node:fs";
import path from "node:path";

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const HOSTED_DATABASE_HINTS = ["pooler.supabase.com", ".supabase.co", "pgbouncer=true"];

function isTruthy(value) {
  return TRUE_VALUES.has((value ?? "").trim().toLowerCase());
}

function stripWrappingQuotes(value) {
  if (value.length >= 2) {
    const firstCharacter = value[0];
    const lastCharacter = value.at(-1);

    if (
      (firstCharacter === '"' && lastCharacter === '"') ||
      (firstCharacter === "'" && lastCharacter === "'")
    ) {
      return value.slice(1, -1);
    }
  }

  return value;
}

export function parseEnvFile(fileContent) {
  const env = {};

  for (const line of fileContent.split(/\r?\n/u)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const normalizedLine = trimmedLine.startsWith("export ")
      ? trimmedLine.slice("export ".length)
      : trimmedLine;
    const separatorIndex = normalizedLine.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = normalizedLine.slice(0, separatorIndex).trim();
    const rawValue = normalizedLine.slice(separatorIndex + 1).trim();
    const valueWithoutInlineComment = rawValue.startsWith('"') || rawValue.startsWith("'")
      ? rawValue
      : rawValue.split(/\s+#/u, 1)[0].trim();

    env[key] = stripWrappingQuotes(valueWithoutInlineComment);
  }

  return env;
}

export function loadPrismaEnvFiles(cwd = process.cwd()) {
  const env = {};

  for (const fileName of [".env", ".env.local"]) {
    const filePath = path.join(cwd, fileName);

    if (!fs.existsSync(filePath)) {
      continue;
    }

    Object.assign(env, parseEnvFile(fs.readFileSync(filePath, "utf8")));
  }

  return env;
}

export function resolvePrismaEnv(rawEnv = process.env, cwd = process.cwd()) {
  const env = {
    ...loadPrismaEnvFiles(cwd),
    ...rawEnv,
  };

  let usedNonPoolingFallback = false;

  if (!env.POSTGRES_URL_NON_POOLING && env.DATABASE_URL) {
    env.POSTGRES_URL_NON_POOLING = env.DATABASE_URL;
    usedNonPoolingFallback = true;
  }

  return {
    env,
    usedNonPoolingFallback,
  };
}

export function isDeploymentRuntime(rawEnv = process.env) {
  const nodeEnv = (rawEnv.NODE_ENV ?? "").trim().toLowerCase();
  return nodeEnv === "production" || isTruthy(rawEnv.CI) || isTruthy(rawEnv.VERCEL);
}

export function buildPrismaProcessEnv(rawEnv = process.env, cwd = process.cwd()) {
  return resolvePrismaEnv(rawEnv, cwd).env;
}

export function looksLikeHostedDatabaseUrl(databaseUrl = "") {
  const normalizedUrl = databaseUrl.toLowerCase();
  return HOSTED_DATABASE_HINTS.some((hint) => normalizedUrl.includes(hint));
}

export function getMigrateDevSafetyCheck(rawEnv = process.env, cwd = process.cwd()) {
  const { env } = resolvePrismaEnv(rawEnv, cwd);
  const databaseUrl = env.DATABASE_URL?.trim() ?? "";
  const allowHostedOverride = isTruthy(env.PRISMA_ALLOW_HOSTED_MIGRATE_DEV);

  if (!databaseUrl) {
    return {
      allowed: false,
      reason: "DATABASE_URL is required for Prisma commands. Add it to .env or .env.local before running migrations.",
    };
  }

  if (allowHostedOverride) {
    return {
      allowed: true,
      reason: "Hosted migrate dev override enabled via PRISMA_ALLOW_HOSTED_MIGRATE_DEV.",
    };
  }

  if ((env.NODE_ENV ?? "").trim().toLowerCase() === "production") {
    return {
      allowed: false,
      reason: "Refusing to run prisma migrate dev while NODE_ENV is set to production.",
    };
  }

  if (looksLikeHostedDatabaseUrl(databaseUrl)) {
    return {
      allowed: false,
      reason:
        "Refusing to run prisma migrate dev against an obvious hosted production-like database URL. Use a local PostgreSQL DATABASE_URL for development, or use prisma migrate deploy for deployment environments.",
    };
  }

  return {
    allowed: true,
    reason: "Database URL looks safe for local Prisma Migrate usage.",
  };
}

export function getMigrateDeploySafetyCheck(rawEnv = process.env, cwd = process.cwd()) {
  const { env, usedNonPoolingFallback } = resolvePrismaEnv(rawEnv, cwd);
  const databaseUrl = env.DATABASE_URL?.trim() ?? "";
  const nonPoolingUrl = env.POSTGRES_URL_NON_POOLING?.trim() ?? "";
  const isHostedDatabase = looksLikeHostedDatabaseUrl(databaseUrl);
  const allowPooledOverride = isTruthy(env.PRISMA_ALLOW_POOLED_MIGRATE_DEPLOY);

  if (!databaseUrl) {
    return {
      allowed: false,
      reason:
        "DATABASE_URL is required for prisma migrate deploy. Add it to the deployment environment before building.",
    };
  }

  if (isHostedDatabase && usedNonPoolingFallback && !allowPooledOverride) {
    return {
      allowed: false,
      reason:
        "Refusing to run prisma migrate deploy against a hosted pooled DATABASE_URL without POSTGRES_URL_NON_POOLING. Set POSTGRES_URL_NON_POOLING to the provider's direct (non-pooling) URL for migration safety.",
    };
  }

  if (isHostedDatabase && databaseUrl === nonPoolingUrl && !allowPooledOverride) {
    return {
      allowed: false,
      reason:
        "Refusing to run prisma migrate deploy because DATABASE_URL and POSTGRES_URL_NON_POOLING are identical while the URL looks hosted/pooling-based. Use a direct non-pooling URL for POSTGRES_URL_NON_POOLING.",
    };
  }

  return {
    allowed: true,
    reason: "Migration deploy safety checks passed.",
  };
}

function getUrlSearchParam(databaseUrl, key) {
  try {
    return new URL(databaseUrl).searchParams.get(key);
  } catch {
    return null;
  }
}

export function getRuntimeDatabaseSafetyCheck(rawEnv = process.env, cwd = process.cwd()) {
  const { env } = resolvePrismaEnv(rawEnv, cwd);
  const databaseUrl = env.DATABASE_URL?.trim() ?? "";
  const nonPoolingUrl = env.POSTGRES_URL_NON_POOLING?.trim() ?? "";
  const deployLikeRuntime = isDeploymentRuntime(env);

  if (!databaseUrl) {
    return {
      allowed: false,
      reason: "DATABASE_URL is required for runtime database access.",
    };
  }

  if (!deployLikeRuntime) {
    return {
      allowed: true,
      reason: "Runtime safety checks skipped outside deployment-like environments.",
    };
  }

  const normalizedUrl = databaseUrl.toLowerCase();
  const isHostedDatabase = looksLikeHostedDatabaseUrl(databaseUrl);
  const isSupabasePooler = normalizedUrl.includes("pooler.supabase.com");
  const isSupabaseDirect = normalizedUrl.includes(".supabase.co") && !isSupabasePooler;

  if (isSupabaseDirect) {
    return {
      allowed: false,
      reason:
        "DATABASE_URL looks like a direct Supabase host (.supabase.co). In deployment runtime, use the pooled Supabase pooler URL for DATABASE_URL and keep the direct URL in POSTGRES_URL_NON_POOLING for migrations.",
    };
  }

  if (isHostedDatabase && !normalizedUrl.includes("pgbouncer=true")) {
    return {
      allowed: false,
      reason:
        "DATABASE_URL looks hosted but is missing pgbouncer=true. Use the pooled runtime URL for serverless/edge-like environments.",
    };
  }

  if (isHostedDatabase && getUrlSearchParam(databaseUrl, "connection_limit") !== "1") {
    return {
      allowed: true,
      reason:
        "DATABASE_URL looks hosted and does not include connection_limit=1. Deploy is allowed, but setting connection_limit=1 is strongly recommended for Prisma + PgBouncer compatibility in deployment runtime.",
    };
  }

  if (isHostedDatabase && nonPoolingUrl && nonPoolingUrl === databaseUrl) {
    return {
      allowed: false,
      reason:
        "DATABASE_URL and POSTGRES_URL_NON_POOLING are identical in deployment-like runtime. Keep DATABASE_URL pooled and POSTGRES_URL_NON_POOLING direct for migrations.",
    };
  }

  return {
    allowed: true,
    reason: "Runtime database URL safety checks passed.",
  };
}
