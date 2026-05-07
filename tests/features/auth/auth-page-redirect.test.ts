import { describe, expect, it } from "vitest";

import { routes } from "@/config/routes";
import {
  AUTHENTICATED_AUTH_PAGE_REDIRECT_PATH,
  getAuthenticatedUserAuthPageRedirect,
  shouldRedirectAuthenticatedUserFromAuthPage,
} from "@/features/auth/auth-page-redirect";

describe("auth entry page redirects", () => {
  it("marks only sign-in and sign-up as redirect targets", () => {
    expect(shouldRedirectAuthenticatedUserFromAuthPage(routes.auth.signIn)).toBe(true);
    expect(shouldRedirectAuthenticatedUserFromAuthPage(routes.auth.signUp)).toBe(true);
    expect(shouldRedirectAuthenticatedUserFromAuthPage(routes.auth.forgotPassword)).toBe(false);
    expect(shouldRedirectAuthenticatedUserFromAuthPage(routes.auth.resetPassword)).toBe(false);
    expect(shouldRedirectAuthenticatedUserFromAuthPage(routes.auth.verifyEmail)).toBe(false);
    expect(shouldRedirectAuthenticatedUserFromAuthPage(routes.auth.error)).toBe(false);
  });

  it("returns the account redirect for authenticated users on sign-in/sign-up", () => {
    expect(getAuthenticatedUserAuthPageRedirect(routes.auth.signIn, "user-1")).toBe(
      AUTHENTICATED_AUTH_PAGE_REDIRECT_PATH,
    );
    expect(getAuthenticatedUserAuthPageRedirect(routes.auth.signUp, "user-1")).toBe(
      AUTHENTICATED_AUTH_PAGE_REDIRECT_PATH,
    );
  });

  it("does not return a redirect for unauthenticated users or exempt auth pages", () => {
    expect(getAuthenticatedUserAuthPageRedirect(routes.auth.signIn, null)).toBeNull();
    expect(getAuthenticatedUserAuthPageRedirect(routes.auth.signUp, "")).toBeNull();
    expect(getAuthenticatedUserAuthPageRedirect(routes.auth.forgotPassword, "user-1")).toBeNull();
    expect(getAuthenticatedUserAuthPageRedirect(routes.auth.resetPassword, "user-1")).toBeNull();
    expect(getAuthenticatedUserAuthPageRedirect(routes.auth.verifyEmail, "user-1")).toBeNull();
    expect(getAuthenticatedUserAuthPageRedirect(routes.auth.error, "user-1")).toBeNull();
  });
});
