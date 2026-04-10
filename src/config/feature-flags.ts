import type { FeatureFlags } from "@/types/app";

export const featureFlags: FeatureFlags = {
  adminPreview: true,
  authPreview: true,
  checkout: false,
  payments: false,
};

export type FeatureFlagName = keyof typeof featureFlags;

export function isFeatureEnabled(name: FeatureFlagName) {
  return featureFlags[name];
}
