import Link from "next/link";
import { Pencil, Search } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";
import { deleteAdminCategoryAction, listAdminCategories } from "@/features/admin/categories";
import { createAdminCategoryAction } from "@/features/admin/categories/actions";
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

  return (
    <PageShell className="gap-8">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Create, update, and retire simple storefront categories with SEO controls."
      />

      {params.notice ? (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900">
          {params.notice}
        </div>
      ) : null}

      {params.error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {params.error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Create category</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createAdminCategoryAction} className="grid gap-4 md:grid-cols-2" noValidate>
            <input type="hidden" name="returnTo" value={returnTo} />

            <div className="space-y-1.5">
              <label htmlFor="category-name" className="text-sm font-medium">
                Name
              </label>
              <Input id="category-name" name="name" placeholder="Home Care" required minLength={2} maxLength={80} />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="category-slug" className="text-sm font-medium">
                Slug
              </label>
              <Input id="category-slug" name="slug" placeholder="home-care" required minLength={2} maxLength={100} />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="category-description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="category-description"
                name="description"
                maxLength={500}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-24 w-full rounded-[calc(var(--radius)-2px)] border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                placeholder="Short summary shown in admin and listings."
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="category-status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="category-status"
                name="status"
                defaultValue="DRAFT"
                className="border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-[calc(var(--radius)-2px)] border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="category-seo-title" className="text-sm font-medium">
                SEO title
              </label>
              <Input id="category-seo-title" name="seoTitle" maxLength={70} placeholder="Shop Home Care Essentials" />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="category-seo-description" className="text-sm font-medium">
                SEO description
              </label>
              <textarea
                id="category-seo-description"
                name="seoDescription"
                maxLength={160}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-20 w-full rounded-[calc(var(--radius)-2px)] border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                placeholder="Search snippet summary for this category page."
              />
            </div>

            <div className="md:col-span-2">
              <Button type="submit">Create category</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category list</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form method="get" className="grid gap-3 md:grid-cols-[1fr_180px_auto] md:items-end">
            <div className="space-y-1.5">
              <label htmlFor="categories-search" className="text-sm font-medium">
                Search
              </label>
              <div className="relative">
                <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  id="categories-search"
                  name="q"
                  defaultValue={query}
                  placeholder="Name, slug, or description"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="categories-status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="categories-status"
                name="status"
                defaultValue={status}
                className="border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-[calc(var(--radius)-2px)] border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <option value="ALL">All statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" variant="outline">
                Apply
              </Button>
              <Link href={routes.admin.categories} className={buttonVariants({ variant: "ghost" })}>
                Reset
              </Link>
            </div>
          </form>

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

                          <form action={deleteAdminCategoryAction}>
                            <input type="hidden" name="categoryId" value={category.id} />
                            <input type="hidden" name="returnTo" value={returnTo} />
                            <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              Delete
                            </Button>
                          </form>
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
