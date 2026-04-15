/**
 * App-level role keys kept in sync with the Prisma schema.
 *
 * Using a local shared definition avoids coupling UI/auth typing to the
 * generated Prisma enum export shape during fresh CI/Vercel builds.
 */
export const RoleKey = {
  SUPER_ADMIN: "SUPER_ADMIN",
  PRODUCT_MANAGER: "PRODUCT_MANAGER",
  ORDER_MANAGER: "ORDER_MANAGER",
  CUSTOMER: "CUSTOMER",
  GUEST: "GUEST",
} as const;

export type RoleKey = (typeof RoleKey)[keyof typeof RoleKey];
