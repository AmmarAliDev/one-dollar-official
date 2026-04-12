export const routes = {
  storefront: {
    home: "/",
    categories: "/categories",
    category: (slug: string) => `/categories/${slug}`,
    preview: "/preview",
    search: "/search",
    account: "/account",
    wishlist: "/wishlist",
    cart: "/cart",
    about: "/about",
    contact: "/contact",
    privacy: "/privacy",
    terms: "/terms",
    shippingPolicy: "/shipping-policy",
    returnPolicy: "/return-policy",
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
  system: {
    unauthorized: "/unauthorized",
    forbidden: "/forbidden",
  },
  docs: {
    architecture: "/docs/architecture",
  },
} as const;
