import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";
import {
  createAdminBlogPostAction,
  getBlogErrorMessage,
  getBlogNoticeMessage,
  listAdminBlogPosts,
} from "@/features/admin/blog";
import { AdminBlogFiltersForm } from "@/features/admin/blog/components/admin-blog-filters-form";
import { AdminBlogForm } from "@/features/admin/blog/components/admin-blog-form";
import { AdminBlogTable } from "@/features/admin/blog/components/admin-blog-table";
import { AdminPageHeader } from "@/features/admin/components/admin-page-patterns";
import { requireRouteAccess } from "@/lib/auth/guards";
import { rbacPermissions } from "@/lib/auth/rbac";

type BlogStatusFilter = "ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED";

type AdminBlogPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    notice?: string;
    error?: string;
  }>;
};

function normalizeStatusFilter(value?: string): BlogStatusFilter {
  if (value === "DRAFT" || value === "PUBLISHED" || value === "ARCHIVED") {
    return value;
  }

  return "ALL";
}

export const metadata = buildMetadata({
  title: "Admin Blog",
  path: routes.admin.blog,
  description: "Manage storefront blog posts, publication status, and SEO metadata.",
});

export default async function AdminBlogPage({ searchParams }: AdminBlogPageProps) {
  await requireRouteAccess({
    permissions: [rbacPermissions.adminAccess, rbacPermissions.catalogRead],
    from: routes.admin.blog,
  });

  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";
  const status = normalizeStatusFilter(params.status);

  const posts = await listAdminBlogPosts({ query, status });

  const returnTo = `${routes.admin.blog}?q=${encodeURIComponent(query)}&status=${status}`;
  const noticeMessage = getBlogNoticeMessage(params.notice);
  const errorMessage = getBlogErrorMessage(params.error);

  return (
    <PageShell className="gap-8">
      <AdminPageHeader
        eyebrow="Content"
        title="Blog posts"
        description="Create, update, and publish storefront blog posts with SEO controls."
      />

      {noticeMessage ? (
        <div
          role="status"
          className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900"
        >
          {noticeMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Create blog post</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminBlogForm
            mode="create"
            action={createAdminBlogPostAction}
            returnTo={returnTo}
            submitLabel="Create post"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blog post list</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdminBlogFiltersForm query={query} status={status} />
          <AdminBlogTable posts={posts} returnTo={returnTo} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
