import Link from "next/link";
import { Pencil } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";
import { listAdminCategories } from "@/features/admin/categories";
import { createAdminCategoryAction } from "@/features/admin/categories/actions";
import { AdminCategoryFiltersForm } from "@/features/admin/categories/components/admin-category-filters-form";
import { AdminCategoryForm } from "@/features/admin/categories/components/admin-category-form";
import { DeleteCategoryButton } from "@/features/admin/categories/components/delete-category-button";
import { getCategoryErrorMessage, getCategoryNoticeMessage } from "@/features/admin/categories/flash";
import { AdminPageHeader, AdminTablePattern } from "@/features/admin/components/admin-page-patterns";
import { requireRouteAccess } from "@/lib/auth/guards";
import { rbacPermissions } from "@/lib/auth/rbac";

type CategoryStatusFilter = "ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED";

type AdminCategoriesPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    notice?: string;
    error?: string;
  }>;
};

const statusLabelMap: Record<CategoryStatusFilter, string> = {
  ALL: "All",
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

const statusBadgeVariantMap: Record<Exclude<CategoryStatusFilter, "ALL">, "secondary" | "info" | "warning"> = {
  DRAFT: "secondary",
  PUBLISHED: "info",
  ARCHIVED: "warning",
};

function normalizeStatusFilter(value?: string): CategoryStatusFilter {
  if (value === "DRAFT" || value === "PUBLISHED" || value === "ARCHIVED") {
    return value;
  }

  return "ALL";
}

export const metadata = buildMetadata({
  title: "Admin Categories",
  path: routes.admin.categories,
  description: "Manage storefront categories, status, and SEO metadata.",
});

export default async function AdminCategoriesPage({ searchParams }: AdminCategoriesPageProps) {
  await requireRouteAccess({
    permissions: [rbacPermissions.adminAccess, rbacPermissions.catalogRead],
    from: routes.admin.categories,
  });

  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";
  const status = normalizeStatusFilter(params.status);

  const categories = await listAdminCategories({
    query,
    status,
  });

  const returnTo = `${routes.admin.categories}?q=${encodeURIComponent(query)}&status=${status}`;
  const noticeMessage = getCategoryNoticeMessage(params.notice);
  const errorMessage = getCategoryErrorMessage(params.error);

  return (
    <PageShell className="gap-8">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Create, update, and retire simple storefront categories with SEO controls."
      />

      {noticeMessage ? (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900">
          {noticeMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Create category</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminCategoryForm action={createAdminCategoryAction} returnTo={returnTo} submitLabel="Create category" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category list</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdminCategoryFiltersForm query={query} status={status} />

          {categories.length === 0 ? (
            <AdminTablePattern
              state="empty"
              emptyTitle="No categories found"
              emptyDescription="Create your first category or adjust search and filters."
              errorDescription="Could not load categories."
            />
          ) : (
            <div className="overflow-auto rounded-md border">
              <table className="min-w-full divide-y divide-muted-foreground/20 text-sm">
                <thead className="bg-muted/40 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Slug</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">SEO</th>
                    <th className="px-4 py-3 font-medium">Updated</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted-foreground/10">
                  {categories.map((category) => (
                    <tr key={category.id} className="align-top">
                      <td className="px-4 py-3">
                        <p className="font-medium">{category.name}</p>
                        <p className="text-muted-foreground mt-1 text-xs">{category.description ?? "No description"}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{category.slug}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadgeVariantMap[category.status]}>{statusLabelMap[category.status]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <p>{category.seoTitle ?? "No SEO title"}</p>
                        <p className="mt-1">{category.seoDescription ?? "No SEO description"}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {category.updatedAt.toLocaleString("en-PK", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={routes.admin.categoryEdit(category.id)} className={buttonVariants({ variant: "outline", size: "sm" })}>
                            <Pencil className="size-4" />
                            Edit
                          </Link>

                          <DeleteCategoryButton categoryId={category.id} categoryName={category.name} returnTo={returnTo} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
