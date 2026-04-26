import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";
import {
  getAdminBlogPostById,
  getBlogErrorMessage,
  getBlogNoticeMessage,
  updateAdminBlogPostAction,
} from "@/features/admin/blog";
import { AdminBlogForm } from "@/features/admin/blog/components/admin-blog-form";
import { AdminPageHeader } from "@/features/admin/components/admin-page-patterns";
import { requireRouteAccess } from "@/lib/auth/guards";
import { rbacPermissions } from "@/lib/auth/rbac";

type EditAdminBlogPageProps = {
  params: Promise<{ postId: string }>;
  searchParams?: Promise<{ error?: string; notice?: string }>;
};

export async function generateMetadata({ params }: EditAdminBlogPageProps) {
  const { postId } = await params;

  return buildMetadata({
    title: "Edit Blog Post",
    path: routes.admin.blogEdit(postId),
    description: "Update blog content, publication status, and SEO metadata.",
  });
}

export default async function EditAdminBlogPage({ params, searchParams }: EditAdminBlogPageProps) {
  await requireRouteAccess({
    permissions: [rbacPermissions.adminAccess, rbacPermissions.catalogWrite],
    from: routes.admin.blog,
  });

  const { postId } = await params;
  const query = (await searchParams) ?? {};

  const post = await getAdminBlogPostById(postId);
  if (!post) {
    notFound();
  }

  const returnTo = routes.admin.blogEdit(post.id);
  const noticeMessage = getBlogNoticeMessage(query.notice);
  const errorMessage = getBlogErrorMessage(query.error, "The blog post could not be updated. Please try again.");

  return (
    <PageShell className="gap-8">
      <AdminPageHeader
        eyebrow="Content"
        title={`Edit ${post.title}`}
        description="Adjust publish state, article content, and SEO in one place."
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

      <AdminBlogForm
        mode="edit"
        action={updateAdminBlogPostAction}
        returnTo={returnTo}
        submitLabel="Save changes"
        post={post}
      />
    </PageShell>
  );
}
