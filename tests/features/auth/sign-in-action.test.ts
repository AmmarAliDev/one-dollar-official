import { beforeEach, describe, expect, it, vi } from "vitest";

const signInMock = vi.hoisted(() => vi.fn());
const headersMock = vi.hoisted(() => vi.fn());
const checkRateLimitMock = vi.hoisted(() => vi.fn());
const assertTrustedOriginMock = vi.hoisted(() => vi.fn());
const getClientIpMock = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("next-auth", () => ({
  AuthError: class AuthError extends Error {
    type: string;

    constructor(type: string) {
      super(type);
      this.type = type;
    }
  },
}));

vi.mock("@/auth", () => ({
  signIn: signInMock,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: checkRateLimitMock,
}));

vi.mock("@/lib/security/csrf", () => ({
  assertTrustedOrigin: assertTrustedOriginMock,
  getClientIp: getClientIpMock,
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { routes } from "@/config/routes";
import { signInAction } from "@/features/auth/actions/sign-in";

function createSignInFormData(redirectTo: string) {
  const formData = new FormData();

  formData.set("email", "user@example.com");
  formData.set("password", "correct-password");
  formData.set("redirectTo", redirectTo);

  return formData;
}

describe("signInAction redirect validation", () => {
  beforeEach(() => {
    signInMock.mockReset().mockResolvedValue(undefined);
    headersMock.mockReset().mockResolvedValue(new Headers());
    checkRateLimitMock.mockReset().mockResolvedValue({ success: true });
    assertTrustedOriginMock.mockReset().mockResolvedValue(undefined);
    getClientIpMock.mockReset().mockReturnValue("127.0.0.1");
  });

  it("falls back to the storefront home for encoded open-redirect input", async () => {
    await signInAction(null, createSignInFormData("/%2f%2fevil.example"));

    expect(signInMock).toHaveBeenCalledWith(
      "credentials",
      expect.objectContaining({
        redirectTo: routes.storefront.home,
      }),
    );
  });

  it("falls back to the storefront home for malformed percent-encoding", async () => {
    await signInAction(null, createSignInFormData("/%E0%A4%A"));

    expect(signInMock).toHaveBeenCalledWith(
      "credentials",
      expect.objectContaining({
        redirectTo: routes.storefront.home,
      }),
    );
  });

  it("preserves a safe raw relative path when validation passes", async () => {
    await signInAction(null, createSignInFormData(" /account/orders?filter=open "));

    expect(signInMock).toHaveBeenCalledWith(
      "credentials",
      expect.objectContaining({
        redirectTo: "/account/orders?filter=open",
      }),
    );
  });
});