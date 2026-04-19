import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";
import {
  createAdminProductAction,
  getProductErrorMessage,
  getProductNoticeMessage,
  listAdminProductCategories,
  listAdminRelatedProducts,
} from "@/features/admin/products";
import { AdminPageHeader } from "@/features/admin/components/admin-page-patterns";
import { AdminProductForm } from "@/features/admin/products/components/admin-product-form";
import { requireRouteAccess } from "@/lib/auth/guards";
import { rbacPermissions } from "@/lib/auth/rbac";

type NewAdminProductPageProps = {
  searchParams?: Promise<{ error?: string; notice?: string }>;
};

export const metadata = buildMetadata({
  title: "Create Product",
  path: routes.admin.productCreate,
  description: "Create a new storefront product with pricing, stock, variants, and SEO fields.",
});

export default async function NewAdminProductPage({ searchParams }: NewAdminProductPageProps) {
  await requireRouteAccess({
    permissions: [rbacPermissions.adminAccess, rbacPermissions.catalogWrite],
    from: routes.admin.products,
  });

  const query = (await searchParams) ?? {};
  const categories = await listAdminProductCategories();
  const relatedProducts = await listAdminRelatedProducts();
  const noticeMessage = getProductNoticeMessage(query.notice);
  const errorMessage = getProductErrorMessage(query.error, "The product could not be created. Please try again.");

  return (
    <PageShell className="gap-8">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Create product"
        description="Add a simple product or switch on variants for sizes, colors, and other combinations."
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

      {categories.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 p-6 text-sm">
            <p className="font-medium">Create a category first</p>
            <p className="text-muted-foreground">Products need a category so the storefront and SEO links stay organized.</p>
            <Link href={routes.admin.categories} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Go to categories
            </Link>
          </CardContent>
        </Card>
      ) : (
        <AdminProductForm
          mode="create"
          action={createAdminProductAction}
          returnTo={routes.admin.productCreate}
          submitLabel="Save product"
          categories={categories}
          relatedProducts={relatedProducts}
        />
      )}
    </PageShell>
  );
}
