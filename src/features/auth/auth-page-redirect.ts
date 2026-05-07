import { routes } from "@/config/routes";

const AUTH_ENTRY_PAGE_PATHS = new Set<string>([routes.auth.signIn, routes.auth.signUp]);

export const AUTHENTICATED_AUTH_PAGE_REDIRECT_PATH = routes.storefront.accountProfile;

export function shouldRedirectAuthenticatedUserFromAuthPage(pathname: string) {
  return AUTH_ENTRY_PAGE_PATHS.has(pathname);
}

export function getAuthenticatedUserAuthPageRedirect(pathname: string, userId: string | null | undefined) {
  if (!userId) {
    return null;
  }

  return shouldRedirectAuthenticatedUserFromAuthPage(pathname)
    ? AUTHENTICATED_AUTH_PAGE_REDIRECT_PATH
    : null;
}
