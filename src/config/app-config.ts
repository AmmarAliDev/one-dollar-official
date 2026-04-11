import type { EnvSource, RuntimeEnv } from "./env";
import { loadRuntimeEnv } from "./env";
import { loadFeatureFlags } from "./feature-flags";
import { routes } from "./routes";
import { loadSiteConfig } from "./site";

export type AppConfig = Readonly<{
  env: RuntimeEnv;
  featureFlags: ReturnType<typeof loadFeatureFlags>;
  routes: typeof routes;
  site: ReturnType<typeof loadSiteConfig>;
}>;

/**
 * Loads all shared application config from a validated environment snapshot.
 * Use this in future server modules to keep config access centralized and safe.
 */
export function loadAppConfig(rawEnv: EnvSource = process.env): AppConfig {
  const runtimeEnv = loadRuntimeEnv(rawEnv);

  return {
    env: runtimeEnv,
    featureFlags: loadFeatureFlags(runtimeEnv),
    routes,
    site: loadSiteConfig(runtimeEnv),
  };
}

export const appConfig = loadAppConfig();
