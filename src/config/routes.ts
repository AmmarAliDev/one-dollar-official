export const routes = {
  storefront: {
    home: "/",
    preview: "/preview",
  },
  admin: {
    dashboard: "/admin",
  },
  auth: {
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    error: "/auth/error",
    forgotPassword: "/auth/forgot-password",
  },
  docs: {
    architecture: "/docs/architecture",
  },
} as const;
