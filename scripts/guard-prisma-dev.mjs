import { getMigrateDevSafetyCheck } from "./prisma-env.mjs";

const safetyCheck = getMigrateDevSafetyCheck();

if (!safetyCheck.allowed) {
  console.error(safetyCheck.reason);
  process.exit(1);
}
