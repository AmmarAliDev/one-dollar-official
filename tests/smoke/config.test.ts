import { describe, expect, it } from "vitest";

import { featureFlags } from "../../src/config/feature-flags";
import { buildMetadata } from "../../src/config/metadata";
import { routes } from "../../src/config/routes";

describe("architecture scaffold", () => {
  it("builds consistent metadata for top-level pages", () => {
    const metadata = buildMetadata({ title: "Admin" });

    expect(metadata.title).toBe("Admin | One Dollar");
    expect(metadata.applicationName).toBe("One Dollar");
  });

  it("exposes shared placeholder routes", () => {
    expect(routes.storefront.home).toBe("/");
    expect(routes.admin.dashboard).toBe("/admin");
    expect(routes.auth.signIn).toBe("/auth/sign-in");
  });

  it("keeps unfinished commerce features off by default", () => {
    expect(featureFlags.checkout).toBe(false);
    expect(featureFlags.payments).toBe(false);
  });
});
