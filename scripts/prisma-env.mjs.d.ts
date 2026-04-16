export type MigrateDevSafetyCheck = {
  allowed: boolean;
  reason: string;
};

export function parseEnvFile(fileContent: string): Record<string, string>;
export function loadPrismaEnvFiles(cwd?: string): Record<string, string>;
export function resolvePrismaEnv(
  rawEnv?: NodeJS.ProcessEnv,
  cwd?: string,
): {
  env: NodeJS.ProcessEnv;
  usedNonPoolingFallback: boolean;
};
export function buildPrismaProcessEnv(rawEnv?: NodeJS.ProcessEnv, cwd?: string): NodeJS.ProcessEnv;
export function looksLikeHostedDatabaseUrl(databaseUrl?: string): boolean;
export function getMigrateDevSafetyCheck(
  rawEnv?: NodeJS.ProcessEnv,
  cwd?: string,
): MigrateDevSafetyCheck;
