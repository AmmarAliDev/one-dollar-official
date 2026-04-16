import fs from "node:fs";
import path from "node:path";

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const HOSTED_DATABASE_HINTS = ["pooler.supabase.com", ".supabase.co", "pgbouncer=true"];

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
  const allowHostedOverride = TRUE_VALUES.has(
    (env.PRISMA_ALLOW_HOSTED_MIGRATE_DEV ?? "").trim().toLowerCase(),
  );

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
