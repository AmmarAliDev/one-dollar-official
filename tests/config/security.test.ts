import { describe, expect, it } from "vitest";

import { buildContentSecurityPolicy, getSecurityHeaders } from "@/config/security";

function getDirectiveValue(policy: string, directiveName: string): string {
  const directive = policy
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${directiveName} `));

  return directive ?? "";
}

describe("security config CSP", () => {
  it("keeps GA external script source disabled when GA env is not configured", () => {
    const policy = buildContentSecurityPolicy({ NODE_ENV: "production" });
    const scriptSrc = getDirectiveValue(policy, "script-src");

    expect(scriptSrc).toContain("'self'");
    expect(scriptSrc).toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
    expect(scriptSrc).not.toContain("https://www.googletagmanager.com");
  });

  it("allows Google Tag Manager script origin only when GA env is configured", () => {
    const policy = buildContentSecurityPolicy({
      NODE_ENV: "production",
      NEXT_PUBLIC_GA_ID: "G-TEST123456",
    });
    const scriptSrc = getDirectiveValue(policy, "script-src");

    expect(scriptSrc).toContain("https://www.googletagmanager.com");
  });

  it("does not allow Google Tag Manager script origin for blank GA env values", () => {
    const policy = buildContentSecurityPolicy({
      NODE_ENV: "production",
      NEXT_PUBLIC_GA_ID: "   ",
    });
    const scriptSrc = getDirectiveValue(policy, "script-src");

    expect(scriptSrc).not.toContain("https://www.googletagmanager.com");
  });

  it("exposes CSP header with GA script source when enabled", () => {
    const cspHeader = getSecurityHeaders({
      NODE_ENV: "production",
      NEXT_PUBLIC_GA_ID: "G-TEST123456",
    }).find((header) => header.key === "Content-Security-Policy");

    expect(cspHeader?.value).toContain("script-src");
    expect(cspHeader?.value).toContain("https://www.googletagmanager.com");
  });
});
