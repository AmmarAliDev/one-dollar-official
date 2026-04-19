"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import { routes } from "@/config/routes";
import { updateOrderStatus } from "@/features/orders";
import { requireRouteAccess } from "@/lib/auth/guards";
import { rbacPermissions } from "@/lib/auth/rbac";
import { captureServerError } from "@/lib/errors/handling";
import { assertTrustedOrigin } from "@/lib/security/csrf";

import { type AdminOrderErrorCode, getAdminOrderErrorCode } from "./flash";
import { saveAdminOrderInternalNote } from "./service";
import { validateAdminOrderInternalNoteInput, validateAdminOrderStatusUpdateInput } from "./validation";

function isSafeRelativePath(value: string) {
  const candidate = value.trim();

  if (!candidate.startsWith("/")) {
    return false;
  }

  if (candidate.startsWith("//") || candidate.includes("://") || candidate.includes("\\")) {
    return false;
  }

  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(candidate.slice(1)) || /[\r\n]/.test(candidate)) {
    return false;
  }

  return true;
}

function getReturnTo(formData: FormData, fallbackPath: string) {
  const value = `${formData.get("returnTo") ?? ""}`;

  return isSafeRelativePath(value) ? value.trim() : fallbackPath;
}

function appendFlash(path: string, key: "notice" | "error", code: string) {
  const encoded = encodeURIComponent(code);
  const separator = path.includes("?") ? "&" : "?";

  return `${path}${separator}${key}=${encoded}`;
}

async function requireOrderWriteAccess() {
  const { role, session } = await requireRouteAccess({
    permissions: [rbacPermissions.adminAccess, rbacPermissions.ordersWrite],
    from: routes.admin.orders,
  });

  return {
    actorId: session.user.id,
    actorRole: role,
  };
}

export async function updateAdminOrderStatusAction(formData: FormData) {
  const orderNumber = `${formData.get("orderNumber") ?? ""}`.trim();
  const fallbackPath = orderNumber ? routes.admin.orderDetail(orderNumber) : routes.admin.orders;
  const returnTo = getReturnTo(formData, fallbackPath);
  let errorCode: AdminOrderErrorCode | null = null;

  try {
    await assertTrustedOrigin({ action: "admin:order:status:update" });
    const actor = await requireOrderWriteAccess();

    const parsed = validateAdminOrderStatusUpdateInput({
      orderId: `${formData.get("orderId") ?? ""}`,
      nextStatus: `${formData.get("nextStatus") ?? ""}`,
    });

    if (!parsed.success) {
      errorCode = "invalidInput";
    } else {
      await updateOrderStatus({
        ...parsed.data,
        actorId: actor.actorId,
      });
    }
  } catch (error) {
    unstable_rethrow(error);

    const appError = captureServerError(error, "admin:order:status:update");
    errorCode = getAdminOrderErrorCode(appError, "updateFailed");
  }

  if (errorCode) {
    redirect(appendFlash(returnTo, "error", errorCode));
  }

  revalidatePath(routes.admin.orders);
  if (orderNumber) {
    revalidatePath(routes.admin.orderDetail(orderNumber));
  }

  redirect(appendFlash(returnTo, "notice", "statusUpdated"));
}

export async function updateAdminOrderInternalNoteAction(formData: FormData) {
  const orderNumber = `${formData.get("orderNumber") ?? ""}`.trim();
  const fallbackPath = orderNumber ? routes.admin.orderDetail(orderNumber) : routes.admin.orders;
  const returnTo = getReturnTo(formData, fallbackPath);
  let errorCode: AdminOrderErrorCode | null = null;

  try {
    await assertTrustedOrigin({ action: "admin:order:internal-note:update" });
    const actor = await requireOrderWriteAccess();

    const parsed = validateAdminOrderInternalNoteInput({
      orderId: `${formData.get("orderId") ?? ""}`,
      note: `${formData.get("note") ?? ""}`,
    });

    if (!parsed.success) {
      errorCode = "invalidInput";
    } else {
      await saveAdminOrderInternalNote({
        orderId: parsed.data.orderId,
        ...(parsed.data.note !== undefined ? { note: parsed.data.note } : {}),
        actor,
      });
    }
  } catch (error) {
    unstable_rethrow(error);

    const appError = captureServerError(error, "admin:order:internal-note:update");
    errorCode = getAdminOrderErrorCode(appError, "noteFailed");
  }

  if (errorCode) {
    redirect(appendFlash(returnTo, "error", errorCode));
  }

  revalidatePath(routes.admin.orders);
  if (orderNumber) {
    revalidatePath(routes.admin.orderDetail(orderNumber));
  }

  redirect(appendFlash(returnTo, "notice", "noteSaved"));
}
