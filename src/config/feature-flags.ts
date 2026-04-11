import type { RuntimeEnv } from "@/config/env";
import type { FeatureFlags } from "@/types/app";

import { env } from "./env";

export function loadFeatureFlags(runtimeEnv: RuntimeEnv = env): FeatureFlags {
  return {
    adminPreview: runtimeEnv.enableAdminPreview,
    authPreview: runtimeEnv.enableAuthPreview,
    checkout: false,
    payments: false,
  };
}

export const featureFlags: FeatureFlags = loadFeatureFlags();

export type FeatureFlagName = keyof typeof featureFlags;

export function isFeatureEnabled(name: FeatureFlagName) {
  return featureFlags[name];
}
