import { beforeEach, describe, expect, it, vi } from "vitest";

const signOutMock = vi.hoisted(() => vi.fn());
const assertTrustedOriginMock = vi.hoisted(() => vi.fn());
const cookiesMock = vi.hoisted(() => vi.fn());
const setCartTokenCookieMock = vi.hoisted(() => vi.fn());
const getOrCreateGuestCartTokenMock = vi.hoisted(() => vi.fn());

vi.mock("@/auth", () => ({
  signOut: signOutMock,
}));

vi.mock("@/lib/security/csrf", () => ({
  assertTrustedOrigin: assertTrustedOriginMock,
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/features/cart", () => ({
  getOrCreateGuestCartToken: getOrCreateGuestCartTokenMock,
  setCartTokenCookie: setCartTokenCookieMock,
}));

import { routes } from "@/config/routes";
import { prepareSignOutAction, signOutAction } from "@/features/auth/actions/sign-out";

describe("prepareSignOutAction", () => {
  beforeEach(() => {
    const cookieStore = {
      set: vi.fn(),
    };

    assertTrustedOriginMock.mockReset().mockResolvedValue(undefined);
    cookiesMock.mockReset().mockResolvedValue(cookieStore);
    setCartTokenCookieMock.mockReset().mockReturnValue(undefined);
    getOrCreateGuestCartTokenMock.mockReset().mockResolvedValue("guest-token-after-signout");
  });

  it("validates request origin and prepares guest cart token", async () => {
    const cookieStore = { set: vi.fn() };
    cookiesMock.mockResolvedValue(cookieStore);

    await prepareSignOutAction();

    expect(assertTrustedOriginMock).toHaveBeenCalledWith({ action: "auth:sign-out" });
    expect(getOrCreateGuestCartTokenMock).toHaveBeenCalledTimes(1);
    expect(setCartTokenCookieMock).toHaveBeenCalledWith(cookieStore, "guest-token-after-signout");
  });
});

describe("signOutAction", () => {
  beforeEach(() => {
    const cookieStore = {
      set: vi.fn(),
    };

    signOutMock.mockReset().mockResolvedValue(undefined);
    assertTrustedOriginMock.mockReset().mockResolvedValue(undefined);
    cookiesMock.mockReset().mockResolvedValue(cookieStore);
    setCartTokenCookieMock.mockReset().mockReturnValue(undefined);
    getOrCreateGuestCartTokenMock.mockReset().mockResolvedValue("guest-token-after-signout");
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

  it("resets the cart cookie to a fresh guest token before sign-out", async () => {
    const cookieStore = { set: vi.fn() };
    cookiesMock.mockResolvedValue(cookieStore);

    await signOutAction();

    const tokenCallOrder = getOrCreateGuestCartTokenMock.mock.invocationCallOrder[0];
    const writeCookieCallOrder = setCartTokenCookieMock.mock.invocationCallOrder[0];
    const logoutCallOrder = signOutMock.mock.invocationCallOrder[0];

    expect(getOrCreateGuestCartTokenMock).toHaveBeenCalledTimes(1);
    expect(setCartTokenCookieMock).toHaveBeenCalledWith(cookieStore, "guest-token-after-signout");
    expect((tokenCallOrder ?? 0) < (writeCookieCallOrder ?? 0)).toBe(true);
    expect((writeCookieCallOrder ?? 0) < (logoutCallOrder ?? 0)).toBe(true);
  });
});
