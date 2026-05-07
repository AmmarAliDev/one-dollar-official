import { getRuntimeDatabaseSafetyCheck, isDeploymentRuntime, resolvePrismaEnv } from "./prisma-env.mjs";

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

function isTruthy(value) {
  return TRUE_VALUES.has((value ?? "").trim().toLowerCase());
}

const { env } = resolvePrismaEnv();
const isDeployContext = isDeploymentRuntime(env);
const allowLocalDeployBuild = isTruthy(env.PRISMA_ALLOW_LOCAL_DEPLOY_BUILD);

if (!isDeployContext && !allowLocalDeployBuild) {
  console.error(
    "Refusing to run build:deploy outside deployment context. Use pnpm build for local builds and pnpm prisma:migrate:dev for local migrations. Set PRISMA_ALLOW_LOCAL_DEPLOY_BUILD=true only for intentional local deploy-pipeline rehearsal.",
  );
  process.exit(1);
}

const runtimeSafetyCheck = getRuntimeDatabaseSafetyCheck(env);

if (!runtimeSafetyCheck.allowed) {
  console.error(runtimeSafetyCheck.reason);
  process.exit(1);
}
