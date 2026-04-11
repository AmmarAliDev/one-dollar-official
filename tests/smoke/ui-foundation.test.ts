import { describe, expect, it } from "vitest";

import { loadSiteConfig } from "@/config/site";
import { themeOptions } from "@/config/theme";
import { formatPrice } from "@/lib/currency";
import type { AppTheme } from "@/types/app";

describe("ui foundation", () => {
  it("supports light, dark, and system theme selection", () => {
    expect(themeOptions.map((option: { value: AppTheme }) => option.value)).toEqual([
      "system",
      "light",
      "dark",
    ]);
  });

  it("exposes reusable storefront and admin navigation structures", () => {
    const site = loadSiteConfig();

    expect(site.storefrontNav.length).toBeGreaterThan(0);
    expect(site.adminNav.length).toBeGreaterThan(0);
  });

  it("formats PKR values for reusable price display components", () => {
    expect(formatPrice(1299)).toBe("PKR 1,299");
  });

  it("returns a detectable placeholder for invalid amounts", () => {
    expect(formatPrice("not-a-number")).toBe("--");
  });
});
