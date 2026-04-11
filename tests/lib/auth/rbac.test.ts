import { createElement } from "react";
import { RoleKey } from "@prisma/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import ForbiddenPage from "../../../src/app/forbidden/page";
import { createAdminAuditEntry } from "../../../src/lib/audit/admin-actions";
import { buildAccessDeniedResponse, getAccessDeniedPath } from "../../../src/lib/auth/guards";
import {
  evaluateRouteAccess,
  hasPermission,
  isAdminRole,
  rbacPermissions,
} from "../../../src/lib/auth/rbac";

describe("rbac foundation", () => {
  it("blocks non-admin users from the admin surface", () => {
    const result = evaluateRouteAccess({
      isAuthenticated: true,
      role: RoleKey.CUSTOMER,
      permissions: [rbacPermissions.adminAccess],
    });

    expect(result).toMatchObject({
      isAllowed: false,
      reason: "forbidden",
      role: RoleKey.CUSTOMER,
    });
    expect(isAdminRole(RoleKey.CUSTOMER)).toBe(false);
  });

  it("allows valid admin roles and resolves their permissions", () => {
    const allowedRoles = [RoleKey.SUPER_ADMIN, RoleKey.PRODUCT_MANAGER, RoleKey.ORDER_MANAGER];

    for (const role of allowedRoles) {
      expect(isAdminRole(role)).toBe(true);
      expect(hasPermission(role, rbacPermissions.adminAccess)).toBe(true);
      expect(
        evaluateRouteAccess({
          isAuthenticated: true,
          role,
          permissions: [rbacPermissions.adminAccess],
        }),
      ).toMatchObject({ isAllowed: true, role });
    }
  });

  it("builds a clear forbidden route-handler response", async () => {
    const response = buildAccessDeniedResponse("forbidden");

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      code: "FORBIDDEN",
      message: expect.stringContaining("permission"),
    });
  });

  it("ignores unsafe external redirect targets in access-denied paths", () => {
    expect(getAccessDeniedPath("forbidden", "https://evil.example")).toBe("/forbidden");
    expect(getAccessDeniedPath("unauthorized", "//evil.example")).toBe("/unauthorized");
    expect(getAccessDeniedPath("forbidden", "/admin/orders")).toBe(
      "/forbidden?from=%2Fadmin%2Forders",
    );
  });

  it("creates an audit-log-ready payload for admin actions", () => {
    const entry = createAdminAuditEntry({
      action: "orders.update-status",
      actorId: "user_123",
      actorRole: RoleKey.ORDER_MANAGER,
      targetType: "order",
      targetId: "order_123",
      status: "success",
      summary: "Updated the order status to confirmed.",
      metadata: { nextStatus: "CONFIRMED" },
    });

    expect(entry).toMatchObject({
      actorId: "user_123",
      actorRole: RoleKey.ORDER_MANAGER,
      action: "orders.update-status",
      model: "order",
      modelId: "order_123",
      status: "success",
    });
    expect(entry.createdAt).toBeInstanceOf(Date);
  });

  it("renders the forbidden page with a helpful recovery message", () => {
    const html = renderToStaticMarkup(createElement(ForbiddenPage));

    expect(html).toContain("Access restricted");
    expect(html).toContain("Go back home");
  });
});
