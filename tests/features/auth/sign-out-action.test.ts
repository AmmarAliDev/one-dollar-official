import { beforeEach, describe, expect, it, vi } from "vitest";

const signOutMock = vi.hoisted(() => vi.fn());
const assertTrustedOriginMock = vi.hoisted(() => vi.fn());

vi.mock("@/auth", () => ({
  signOut: signOutMock,
}));

vi.mock("@/lib/security/csrf", () => ({
  assertTrustedOrigin: assertTrustedOriginMock,
}));

import { routes } from "@/config/routes";
import { signOutAction } from "@/features/auth/actions/sign-out";

describe("signOutAction", () => {
  beforeEach(() => {
    signOutMock.mockReset().mockResolvedValue(undefined);
    assertTrustedOriginMock.mockReset().mockResolvedValue(undefined);
  });

  it("validates request origin before clearing the session", async () => {
    await signOutAction();

    const csrfCallOrder = assertTrustedOriginMock.mock.invocationCallOrder[0];
    const logoutCallOrder = signOutMock.mock.invocationCallOrder[0];

    expect(assertTrustedOriginMock).toHaveBeenCalledWith({ action: "auth:sign-out" });
    expect(csrfCallOrder).toBeDefined();
    expect(logoutCallOrder).toBeDefined();
    expect(csrfCallOrder ?? 0).toBeLessThan(logoutCallOrder ?? 0);
  });

  it("redirects signed-out users to the storefront home", async () => {
    await signOutAction();

    expect(signOutMock).toHaveBeenCalledWith({
      redirectTo: routes.storefront.home,
    });
  });
});
