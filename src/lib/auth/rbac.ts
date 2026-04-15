import { RoleKey } from "@/lib/auth/roles";

/**
 * Central RBAC model for the admin foundation.
 *
 * The database stores the role relation, while this file provides the typed
 * role/permission matrix used by route guards and future admin modules.
 */
export const rbacPermissions = {
  adminAccess: "admin:access",
  catalogRead: "catalog:read",
  catalogWrite: "catalog:write",
  ordersRead: "orders:read",
  ordersWrite: "orders:write",
  usersRead: "users:read",
  settingsManage: "settings:manage",
} as const;

export type RbacPermission = (typeof rbacPermissions)[keyof typeof rbacPermissions];

export const adminRoleKeys = [RoleKey.SUPER_ADMIN, RoleKey.PRODUCT_MANAGER, RoleKey.ORDER_MANAGER] as const;
export type AdminRoleKey = (typeof adminRoleKeys)[number];

const allPermissions = Object.values(rbacPermissions) as readonly RbacPermission[];
const roleKeyValues = new Set<string>(Object.values(RoleKey));

export const roleLabels: Record<RoleKey, string> = {
  [RoleKey.SUPER_ADMIN]: "Super admin",
  [RoleKey.PRODUCT_MANAGER]: "Product manager",
  [RoleKey.ORDER_MANAGER]: "Order manager",
  [RoleKey.CUSTOMER]: "Customer",
  [RoleKey.GUEST]: "Guest",
};

export const rolePermissionMatrix: Record<RoleKey, readonly RbacPermission[]> = {
  [RoleKey.SUPER_ADMIN]: allPermissions,
  [RoleKey.PRODUCT_MANAGER]: [
    rbacPermissions.adminAccess,
    rbacPermissions.catalogRead,
    rbacPermissions.catalogWrite,
    rbacPermissions.ordersRead,
  ],
  [RoleKey.ORDER_MANAGER]: [
    rbacPermissions.adminAccess,
    rbacPermissions.ordersRead,
    rbacPermissions.ordersWrite,
    rbacPermissions.usersRead,
  ],
  [RoleKey.CUSTOMER]: [],
  [RoleKey.GUEST]: [],
};

export type AccessDenialReason = "unauthorized" | "forbidden";

export interface RouteAccessEvaluationInput {
  isAuthenticated: boolean;
  role?: RoleKey | string | null | undefined;
  roles?: readonly RoleKey[] | undefined;
  permissions?: readonly RbacPermission[] | undefined;
}

export type RouteAccessEvaluation =
  | {
      isAllowed: true;
      role: RoleKey | null;
    }
  | {
      isAllowed: false;
      reason: AccessDenialReason;
      role: RoleKey | null;
      message: string;
    };

export function isRoleKey(value: unknown): value is RoleKey {
  return typeof value === "string" && roleKeyValues.has(value);
}

export function normalizeRole(role: RoleKey | string | null | undefined): RoleKey | null {
  return isRoleKey(role) ? role : null;
}

export function getRoleLabel(role: RoleKey | string | null | undefined): string {
  const normalizedRole = normalizeRole(role);
  return normalizedRole ? roleLabels[normalizedRole] : "Unknown role";
}

export function isAdminRole(role: RoleKey | string | null | undefined): role is AdminRoleKey {
  const normalizedRole = normalizeRole(role);
  return normalizedRole !== null && (adminRoleKeys as readonly RoleKey[]).includes(normalizedRole);
}

export function getPermissionsForRole(role: RoleKey | string | null | undefined): readonly RbacPermission[] {
  const normalizedRole = normalizeRole(role);
  return normalizedRole ? rolePermissionMatrix[normalizedRole] : [];
}

export function hasPermission(
  role: RoleKey | string | null | undefined,
  permission: RbacPermission,
): boolean {
  return getPermissionsForRole(role).includes(permission);
}

export function hasAnyPermission(
  role: RoleKey | string | null | undefined,
  permissions: readonly RbacPermission[],
): boolean {
  return permissions.length === 0 || permissions.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(
  role: RoleKey | string | null | undefined,
  permissions: readonly RbacPermission[],
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Shared access evaluation used by server-component and route-handler guards.
 * Unauthenticated users are treated separately from signed-in users whose role
 * lacks the required role/permission grants.
 */
export function evaluateRouteAccess({
  isAuthenticated,
  role,
  roles = [],
  permissions = [],
}: RouteAccessEvaluationInput): RouteAccessEvaluation {
  const normalizedRole = normalizeRole(role);

  if (!isAuthenticated) {
    return {
      isAllowed: false,
      reason: "unauthorized",
      role: normalizedRole,
      message: "Please sign in with an authorized account to continue.",
    };
  }

  if (roles.length > 0 && (!normalizedRole || !roles.includes(normalizedRole))) {
    return {
      isAllowed: false,
      reason: "forbidden",
      role: normalizedRole,
      message: "Your account does not currently have the required role for this area.",
    };
  }

  if (permissions.length > 0 && !hasAllPermissions(normalizedRole, permissions)) {
    return {
      isAllowed: false,
      reason: "forbidden",
      role: normalizedRole,
      message: "Your account does not currently have permission to access this area.",
    };
  }

  return {
    isAllowed: true,
    role: normalizedRole,
  };
}
