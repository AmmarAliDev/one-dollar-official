import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  getMigrateDeploySafetyCheck,
  getMigrateDevSafetyCheck,
  isDeploymentRuntime,
  resolvePrismaEnv,
} from "./prisma-env.mjs";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: node scripts/prisma-cli.mjs <prisma command>");
  process.exit(1);
}

const { env, usedNonPoolingFallback } = resolvePrismaEnv();
const isMigrateDevCommand = args[0] === "migrate" && args[1] === "dev";
const isMigrateDeployCommand = args[0] === "migrate" && args[1] === "deploy";

if (usedNonPoolingFallback && !isMigrateDeployCommand) {
  console.warn(
    "[prisma] POSTGRES_URL_NON_POOLING is not set. Falling back to DATABASE_URL for this command.",
  );
}

if (isMigrateDevCommand) {
  const safetyCheck = getMigrateDevSafetyCheck(env);

  if (!safetyCheck.allowed) {
    console.error(safetyCheck.reason);

    if (!env.SHADOW_DATABASE_URL && env.POSTGRES_URL_NON_POOLING !== env.DATABASE_URL) {
      console.error(
        "Tip: SHADOW_DATABASE_URL is optional for local PostgreSQL, but may be required when developing against a separate hosted development database.",
      );
    }

    process.exit(1);
  }
}

if (isMigrateDeployCommand) {
  const safetyCheck = getMigrateDeploySafetyCheck(env);

  if (!safetyCheck.allowed) {
    console.error(safetyCheck.reason);

    if (isDeploymentRuntime(env)) {
      console.error(
        "Tip: in production deployments, configure DATABASE_URL as pooled and POSTGRES_URL_NON_POOLING as the direct database URL.",
      );
    } else {
      console.error(
        "Tip: use pnpm prisma:migrate:dev for local schema changes; reserve pnpm prisma:migrate:deploy for CI/production deployment workflows.",
      );
    }

    process.exit(1);
  }
}

const prismaCliEntrypoint = path.join(process.cwd(), "node_modules", "prisma", "build", "index.js");
const result = spawnSync(process.execPath, [prismaCliEntrypoint, ...args], {
  stdio: "inherit",
  env,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
