"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import { routes } from "@/config/routes";
import { requireRouteAccess } from "@/lib/auth/guards";
import { rbacPermissions } from "@/lib/auth/rbac";
import { captureServerError } from "@/lib/errors/handling";
import { assertTrustedOrigin } from "@/lib/security/csrf";

import { getHomepageContentErrorCode } from "./flash";
import {
  createAdminBanner,
  createAdminDealCampaign,
  createAdminHomepageSection,
  seedAdminHomepageSections,
  updateAdminBanner,
  updateAdminDealCampaign,
  updateAdminHomepageSection,
} from "./service";
import {
  validateAdminBannerInput,
  validateAdminDealCampaignInput,
  validateAdminHomepageSectionInput,
} from "./validation";

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

async function requireHomepageManageAccess() {
  const { role, session } = await requireRouteAccess({
    permissions: [rbacPermissions.adminAccess, rbacPermissions.settingsManage],
    from: routes.admin.homepage,
  });

  return {
    actorId: session.user.id,
    actorRole: role,
  };
}

function readHomepageSectionPayload(formData: FormData) {
  return {
    id: `${formData.get("id") ?? ""}`.trim() || undefined,
    key: `${formData.get("key") ?? ""}`,
    title: `${formData.get("title") ?? ""}`,
    type: `${formData.get("type") ?? ""}`,
    position: `${formData.get("position") ?? ""}`,
    active: formData.get("active") !== null,
    startAt: `${formData.get("startAt") ?? ""}`,
    endAt: `${formData.get("endAt") ?? ""}`,
    content: `${formData.get("content") ?? ""}`,
  };
}

function readBannerPayload(formData: FormData) {
  return {
    id: `${formData.get("id") ?? ""}`.trim() || undefined,
    title: `${formData.get("title") ?? ""}`,
    imageUrl: `${formData.get("imageUrl") ?? ""}`,
    href: `${formData.get("href") ?? ""}`,
    position: `${formData.get("position") ?? ""}`,
    active: formData.get("active") !== null,
    startAt: `${formData.get("startAt") ?? ""}`,
    endAt: `${formData.get("endAt") ?? ""}`,
  };
}

function readDealCampaignPayload(formData: FormData) {
  return {
    id: `${formData.get("id") ?? ""}`.trim() || undefined,
    name: `${formData.get("name") ?? ""}`,
    description: `${formData.get("description") ?? ""}`,
    startsAt: `${formData.get("startsAt") ?? ""}`,
    endsAt: `${formData.get("endsAt") ?? ""}`,
    active: formData.get("active") !== null,
  };
}

function revalidateHomepageContentPaths() {
  revalidatePath(routes.storefront.home);
  revalidatePath(routes.admin.homepage);
  revalidatePath(routes.admin.homepageSections);
  revalidatePath(routes.admin.homepageBanners);
  revalidatePath(routes.admin.homepageCampaigns);
}

export async function seedAdminHomepageSectionsAction(formData: FormData) {
  const returnTo = getReturnTo(formData, routes.admin.homepageSections);

  try {
    await assertTrustedOrigin({ action: "admin:homepage:seed" });
    const actor = await requireHomepageManageAccess();

    const result = await seedAdminHomepageSections({ actor });

    revalidateHomepageContentPaths();
    redirect(appendFlash(returnTo, "notice", result.created ? "seeded" : "alreadySeeded"));
  } catch (error) {
    unstable_rethrow(error);

    redirect(appendFlash(returnTo, "error", "updateFailed"));
  }
}

export async function createAdminHomepageSectionAction(formData: FormData) {
  const returnTo = getReturnTo(formData, routes.admin.homepageSections);

  try {
    await assertTrustedOrigin({ action: "admin:homepage:section:create" });
    const actor = await requireHomepageManageAccess();

    const parsed = validateAdminHomepageSectionInput(readHomepageSectionPayload(formData));
    if (!parsed.success) {
      redirect(appendFlash(returnTo, "error", "invalidInput"));
    }

    await createAdminHomepageSection({ data: parsed.data, actor });

    revalidateHomepageContentPaths();
    redirect(appendFlash(returnTo, "notice", "created"));
  } catch (error) {
    unstable_rethrow(error);

    const appError = captureServerError(error, "admin:homepage:section:create");
    redirect(appendFlash(returnTo, "error", getHomepageContentErrorCode(appError, "createFailed")));
  }
}

export async function updateAdminHomepageSectionAction(formData: FormData) {
  const returnTo = getReturnTo(formData, routes.admin.homepageSections);

  try {
    await assertTrustedOrigin({ action: "admin:homepage:section:update" });
    const actor = await requireHomepageManageAccess();

    const parsed = validateAdminHomepageSectionInput(readHomepageSectionPayload(formData));
    if (!parsed.success || !parsed.data.id) {
      redirect(appendFlash(returnTo, "error", "invalidInput"));
    }

    await updateAdminHomepageSection({ data: parsed.data, actor });

    revalidateHomepageContentPaths();
    redirect(appendFlash(returnTo, "notice", "updated"));
  } catch (error) {
    unstable_rethrow(error);

    const appError = captureServerError(error, "admin:homepage:section:update");
    redirect(appendFlash(returnTo, "error", getHomepageContentErrorCode(appError, "updateFailed")));
  }
}

export async function createAdminBannerAction(formData: FormData) {
  const returnTo = getReturnTo(formData, routes.admin.homepageBanners);

  try {
    await assertTrustedOrigin({ action: "admin:homepage:banner:create" });
    const actor = await requireHomepageManageAccess();

    const parsed = validateAdminBannerInput(readBannerPayload(formData));
    if (!parsed.success) {
      redirect(appendFlash(returnTo, "error", "invalidInput"));
    }

    await createAdminBanner({ data: parsed.data, actor });

    revalidateHomepageContentPaths();
    redirect(appendFlash(returnTo, "notice", "created"));
  } catch (error) {
    unstable_rethrow(error);

    const appError = captureServerError(error, "admin:homepage:banner:create");
    redirect(appendFlash(returnTo, "error", getHomepageContentErrorCode(appError, "createFailed")));
  }
}

export async function updateAdminBannerAction(formData: FormData) {
  const returnTo = getReturnTo(formData, routes.admin.homepageBanners);

  try {
    await assertTrustedOrigin({ action: "admin:homepage:banner:update" });
    const actor = await requireHomepageManageAccess();

    const parsed = validateAdminBannerInput(readBannerPayload(formData));
    if (!parsed.success || !parsed.data.id) {
      redirect(appendFlash(returnTo, "error", "invalidInput"));
    }

    await updateAdminBanner({ data: parsed.data, actor });

    revalidateHomepageContentPaths();
    redirect(appendFlash(returnTo, "notice", "updated"));
  } catch (error) {
    unstable_rethrow(error);

    const appError = captureServerError(error, "admin:homepage:banner:update");
    redirect(appendFlash(returnTo, "error", getHomepageContentErrorCode(appError, "updateFailed")));
  }
}

export async function createAdminDealCampaignAction(formData: FormData) {
  const returnTo = getReturnTo(formData, routes.admin.homepageCampaigns);

  try {
    await assertTrustedOrigin({ action: "admin:homepage:campaign:create" });
    const actor = await requireHomepageManageAccess();

    const parsed = validateAdminDealCampaignInput(readDealCampaignPayload(formData));
    if (!parsed.success) {
      redirect(appendFlash(returnTo, "error", "invalidInput"));
    }

    await createAdminDealCampaign({ data: parsed.data, actor });

    revalidateHomepageContentPaths();
    redirect(appendFlash(returnTo, "notice", "created"));
  } catch (error) {
    unstable_rethrow(error);

    const appError = captureServerError(error, "admin:homepage:campaign:create");
    redirect(appendFlash(returnTo, "error", getHomepageContentErrorCode(appError, "createFailed")));
  }
}

export async function updateAdminDealCampaignAction(formData: FormData) {
  const returnTo = getReturnTo(formData, routes.admin.homepageCampaigns);

  try {
    await assertTrustedOrigin({ action: "admin:homepage:campaign:update" });
    const actor = await requireHomepageManageAccess();

    const parsed = validateAdminDealCampaignInput(readDealCampaignPayload(formData));
    if (!parsed.success || !parsed.data.id) {
      redirect(appendFlash(returnTo, "error", "invalidInput"));
    }

    await updateAdminDealCampaign({ data: parsed.data, actor });

    revalidateHomepageContentPaths();
    redirect(appendFlash(returnTo, "notice", "updated"));
  } catch (error) {
    unstable_rethrow(error);

    const appError = captureServerError(error, "admin:homepage:campaign:update");
    redirect(appendFlash(returnTo, "error", getHomepageContentErrorCode(appError, "updateFailed")));
  }
}
