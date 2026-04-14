import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";
import { getAdminCategoryById, updateAdminCategoryAction } from "@/features/admin/categories";
import { getCategoryErrorMessage, getCategoryNoticeMessage } from "@/features/admin/categories/flash";
import { AdminPageHeader } from "@/features/admin/components/admin-page-patterns";
import { requireRouteAccess } from "@/lib/auth/guards";
import { rbacPermissions } from "@/lib/auth/rbac";

type EditAdminCategoryPageProps = {
  params: Promise<{ categoryId: string }>;
  searchParams?: Promise<{ error?: string; notice?: string }>;
};

export async function generateMetadata({ params }: EditAdminCategoryPageProps) {
  const { categoryId } = await params;

  return buildMetadata({
    title: "Edit Category",
    path: routes.admin.categoryEdit(categoryId),
    description: "Update category details and SEO fields.",
  });
}

export default async function EditAdminCategoryPage({ params, searchParams }: EditAdminCategoryPageProps) {
  await requireRouteAccess({
    permissions: [rbacPermissions.adminAccess, rbacPermissions.catalogWrite],
    from: routes.admin.categories,
  });

  const { categoryId } = await params;
  const query = (await searchParams) ?? {};

  const category = await getAdminCategoryById(categoryId);
  if (!category) {
    notFound();
  }

  const returnTo = routes.admin.categoryEdit(category.id);
  const noticeMessage = getCategoryNoticeMessage(query.notice);
  const errorMessage = getCategoryErrorMessage(query.error);

  return (
    <PageShell className="gap-8">
      <AdminPageHeader
        eyebrow="Catalog"
        title={`Edit ${category.name}`}
        description="Adjust category copy, SEO fields, and publication status."
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
          <CardTitle>Category details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateAdminCategoryAction} className="grid gap-4 md:grid-cols-2" noValidate>
            <input type="hidden" name="id" value={category.id} />
            <input type="hidden" name="returnTo" value={returnTo} />

            <div className="space-y-1.5">
              <label htmlFor="category-name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="category-name"
                name="name"
                defaultValue={category.name}
                minLength={2}
                maxLength={80}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="category-slug" className="text-sm font-medium">
                Slug
              </label>
              <Input
                id="category-slug"
                name="slug"
                defaultValue={category.slug}
                minLength={2}
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="category-description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="category-description"
                name="description"
                defaultValue={category.description ?? ""}
                maxLength={500}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-24 w-full rounded-[calc(var(--radius)-2px)] border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="category-status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="category-status"
                name="status"
                defaultValue={category.status}
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
              <Input
                id="category-seo-title"
                name="seoTitle"
                defaultValue={category.seoTitle ?? ""}
                maxLength={70}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="category-seo-description" className="text-sm font-medium">
                SEO description
              </label>
              <textarea
                id="category-seo-description"
                name="seoDescription"
                defaultValue={category.seoDescription ?? ""}
                maxLength={160}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-20 w-full rounded-[calc(var(--radius)-2px)] border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <Button type="submit">Save changes</Button>
              <Link href={routes.admin.categories} className={buttonVariants({ variant: "ghost" })}>
                Back to categories
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  );
}
