import { type RoleKey } from "@prisma/client";

import { routes } from "@/config/routes";
import { getRoleLabel, hasPermission, type RbacPermission, rbacPermissions } from "@/lib/auth/rbac";

export type AdminNavigationItem = {
  label: string;
  href: string;
  description: string;
  requiredPermission?: RbacPermission;
};

export const adminNavigationItems: readonly AdminNavigationItem[] = [
  {
    label: "Dashboard",
    href: routes.admin.dashboard,
    description: "Overview of daily operations and shortcuts.",
  },
  {
    label: "Orders",
    href: routes.admin.orders,
    description: "Track order intake and fulfillment status.",
    requiredPermission: rbacPermissions.ordersRead,
  },
  {
    label: "Revenue",
    href: routes.admin.revenue,
    description: "Review revenue trends and summaries.",
    requiredPermission: rbacPermissions.ordersRead,
  },
  {
    label: "Inventory",
    href: routes.admin.inventory,
    description: "Monitor low stock and product health.",
    requiredPermission: rbacPermissions.catalogRead,
  },
  {
    label: "Recent Activity",
    href: routes.admin.activity,
    description: "View team and system activity history.",
    requiredPermission: rbacPermissions.usersRead,
  },
  {
    label: "Settings",
    href: routes.admin.settings,
    description: "Manage admin workspace settings.",
    requiredPermission: rbacPermissions.settingsManage,
  },
] as const;

export function getVisibleAdminNavigation(role: RoleKey | null | undefined): AdminNavigationItem[] {
  return adminNavigationItems.filter((item) => {
    if (!item.requiredPermission) {
      return true;
    }

    return hasPermission(role, item.requiredPermission);
  });
}

export function getAdminRoleSummary(role: RoleKey | null | undefined) {
  const label = getRoleLabel(role);
  return `Signed in as ${label}`;
}
