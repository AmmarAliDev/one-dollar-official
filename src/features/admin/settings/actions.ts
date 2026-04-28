"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import { routes } from "@/config/routes";
import { requireRouteAccess } from "@/lib/auth/guards";
import { rbacPermissions } from "@/lib/auth/rbac";
import { captureServerError } from "@/lib/errors/handling";
import { assertTrustedOrigin } from "@/lib/security/csrf";

import { getAdminStoreSettingsErrorCode } from "./flash";
import { saveAdminStoreSettings } from "./service";
import { validateAdminStoreSettingsInput } from "./validation";

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

function appendFlash(path: string, key: "notice" | "error", code: string) {
  const encoded = encodeURIComponent(code);
  const separator = path.includes("?") ? "&" : "?";

  return `${path}${separator}${key}=${encoded}`;
}

function getReturnTo(formData: FormData, fallbackPath: string) {
  const value = `${formData.get("returnTo") ?? ""}`;

  return isSafeRelativePath(value) ? value.trim() : fallbackPath;
}

function parseOptionalField(value: FormDataEntryValue | null) {
  return `${value ?? ""}`.trim();
}

function readStoreSettingsPayload(formData: FormData) {
  return {
    storeName: parseOptionalField(formData.get("storeName")),
    storeTagline: parseOptionalField(formData.get("storeTagline")),
    supportEmail: parseOptionalField(formData.get("supportEmail")),
    supportPhone: parseOptionalField(formData.get("supportPhone")),
    supportWhatsapp: parseOptionalField(formData.get("supportWhatsapp")),
    supportHours: parseOptionalField(formData.get("supportHours")),
    shippingOriginCity: parseOptionalField(formData.get("shippingOriginCity")),
    shippingFlatRate: parseOptionalField(formData.get("shippingFlatRate")),
    shippingFreeThreshold: parseOptionalField(formData.get("shippingFreeThreshold")),
    dispatchLeadTimeDays: parseOptionalField(formData.get("dispatchLeadTimeDays")),
    lowStockThreshold: parseOptionalField(formData.get("lowStockThreshold")),
    allowBackorders: formData.get("allowBackorders") !== null,
  };
}

async function requireSettingsManageAccess() {
  const { role, session } = await requireRouteAccess({
    permissions: [rbacPermissions.adminAccess, rbacPermissions.settingsManage],
    from: routes.admin.settings,
  });

  return {
    actorId: session.user.id,
    actorRole: role,
  };
}

export async function saveAdminStoreSettingsAction(formData: FormData) {
  const returnTo = getReturnTo(formData, routes.admin.settings);

  try {
    await assertTrustedOrigin({ action: "admin:settings:save" });
    const actor = await requireSettingsManageAccess();

    const parsed = validateAdminStoreSettingsInput(readStoreSettingsPayload(formData));
    if (!parsed.success) {
      redirect(appendFlash(returnTo, "error", "invalidInput"));
    }

    await saveAdminStoreSettings({ data: parsed.data, actor });

    revalidatePath(routes.admin.settings);
    redirect(appendFlash(returnTo, "notice", "saved"));
  } catch (error) {
    unstable_rethrow(error);

    const appError = captureServerError(error, "admin:settings:save");
    redirect(appendFlash(returnTo, "error", getAdminStoreSettingsErrorCode(appError, "saveFailed")));
  }
}
