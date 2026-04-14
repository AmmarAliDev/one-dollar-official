"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { requireRouteAccess } from "@/lib/auth/guards";
import { rbacPermissions } from "@/lib/auth/rbac";
import { captureServerError } from "@/lib/errors/handling";
import { assertTrustedOrigin } from "@/lib/security/csrf";

import {
  createAdminCategory,
  deleteAdminCategory,
  updateAdminCategory,
} from "./service";
import {
  validateCategoryCreateInput,
  validateCategoryUpdateInput,
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

function appendFlash(path: string, key: "notice" | "error", message: string) {
  const encoded = encodeURIComponent(message);
  const separator = path.includes("?") ? "&" : "?";

  return `${path}${separator}${key}=${encoded}`;
}

function readCategoryPayload(formData: FormData) {
  return {
    name: `${formData.get("name") ?? ""}`,
    slug: `${formData.get("slug") ?? ""}`,
    description: `${formData.get("description") ?? ""}`,
    status: `${formData.get("status") ?? ""}`,
    seoTitle: `${formData.get("seoTitle") ?? ""}`,
    seoDescription: `${formData.get("seoDescription") ?? ""}`,
  };
}

async function requireCategoryWriteAccess() {
  const { role, session } = await requireRouteAccess({
    permissions: [rbacPermissions.adminAccess, rbacPermissions.catalogWrite],
    from: routes.admin.categories,
  });

  return {
    actorId: session.user.id,
    actorRole: role,
  };
}

export async function createAdminCategoryAction(formData: FormData) {
  const returnTo = getReturnTo(formData, routes.admin.categories);

  try {
    await assertTrustedOrigin({ action: "admin:category:create" });
    const actor = await requireCategoryWriteAccess();

    const parsed = validateCategoryCreateInput(readCategoryPayload(formData));
    if (!parsed.success) {
      redirect(appendFlash(returnTo, "error", parsed.errors[0] ?? "Invalid category input."));
    }

    await createAdminCategory({
      data: parsed.data,
      actor,
    });
  } catch (error) {
    const appError = captureServerError(error, "admin:category:create");
    redirect(appendFlash(returnTo, "error", appError.userMessage ?? "Could not create category."));
  }

  revalidatePath(routes.admin.categories);
  redirect(appendFlash(returnTo, "notice", "Category created."));
}

export async function updateAdminCategoryAction(formData: FormData) {
  const fallback = routes.admin.categories;
  const returnTo = getReturnTo(formData, fallback);

  try {
    await assertTrustedOrigin({ action: "admin:category:update" });
    const actor = await requireCategoryWriteAccess();

    const parsed = validateCategoryUpdateInput({
      id: `${formData.get("id") ?? ""}`,
      ...readCategoryPayload(formData),
    });

    if (!parsed.success) {
      redirect(appendFlash(returnTo, "error", parsed.errors[0] ?? "Invalid category input."));
    }

    await updateAdminCategory({
      data: parsed.data,
      actor,
    });
  } catch (error) {
    const appError = captureServerError(error, "admin:category:update");
    redirect(appendFlash(returnTo, "error", appError.userMessage ?? "Could not update category."));
  }

  revalidatePath(routes.admin.categories);
  redirect(appendFlash(routes.admin.categories, "notice", "Category updated."));
}

export async function deleteAdminCategoryAction(formData: FormData) {
  const returnTo = getReturnTo(formData, routes.admin.categories);
  const categoryId = `${formData.get("categoryId") ?? ""}`.trim();

  if (categoryId.length === 0) {
    redirect(appendFlash(returnTo, "error", "Category ID is missing."));
  }

  try {
    await assertTrustedOrigin({ action: "admin:category:delete" });
    const actor = await requireCategoryWriteAccess();

    await deleteAdminCategory({
      categoryId,
      actor,
    });
  } catch (error) {
    const appError = captureServerError(error, "admin:category:delete");
    redirect(appendFlash(returnTo, "error", appError.userMessage ?? "Could not delete category."));
  }

  revalidatePath(routes.admin.categories);
  redirect(appendFlash(returnTo, "notice", "Category deleted."));
}
