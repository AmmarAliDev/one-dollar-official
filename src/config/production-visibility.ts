import { env, type RuntimeEnv } from "@/config/env";

export type ProductionGuardSurface =
  | "homepageFallbackIndicator"
  | "storefrontPreviewRoute"
  | "footerPreviewLink"
  | "footerNewsletterPlaceholder"
  | "returnPolicyPlaceholderPage"
  | "aboutInterimNarrativeNote"
  | "notFoundAdminPlaceholderAction";

const HIDDEN_IN_PRODUCTION: ReadonlySet<ProductionGuardSurface> = new Set([
  "homepageFallbackIndicator",
  "storefrontPreviewRoute",
  "footerPreviewLink",
  "footerNewsletterPlaceholder",
  "returnPolicyPlaceholderPage",
  "aboutInterimNarrativeNote",
  "notFoundAdminPlaceholderAction",
]);

export function isProductionRuntime(runtimeEnv: RuntimeEnv = env): boolean {
  return runtimeEnv.nodeEnv === "production";
}

/**
 * Centralized rule for development-only placeholder and preview surfaces.
 *
 * In production, listed surfaces are suppressed so incomplete UI and internal
 * preview paths do not leak to customers. In non-production, all surfaces stay
 * visible to preserve staging/development diagnostics.
 */
export function shouldRenderGuardedSurface(
  surface: ProductionGuardSurface,
  runtimeEnv: RuntimeEnv = env,
): boolean {
  if (!isProductionRuntime(runtimeEnv)) {
    return true;
  }

  return !HIDDEN_IN_PRODUCTION.has(surface);
}
