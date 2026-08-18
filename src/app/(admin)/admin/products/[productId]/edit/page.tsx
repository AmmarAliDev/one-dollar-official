import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";
import { AdminPageHeader } from "@/features/admin/components/admin-page-patterns";
import {
  getAdminProductById,
  getProductErrorMessage,
  getProductNoticeMessage,
  listAdminProductCategories,
  updateAdminProductAction,
} from "@/features/admin/products";
import { AdminProductForm } from "@/features/admin/products/components/admin-product-form";
import { DeleteProductButton } from "@/features/admin/products/components/delete-product-button";
import { requireRouteAccess } from "@/lib/auth/guards";
import { rbacPermissions } from "@/lib/auth/rbac";

type EditAdminProductPageProps = {
  params: Promise<{ productId: string }>;
  searchParams?: Promise<{ error?: string; notice?: string }>;
};

export async function generateMetadata({ params }: EditAdminProductPageProps) {
  const { productId } = await params;

  return buildMetadata({
    title: "Edit Product",
    path: routes.admin.productEdit(productId),
    description: "Update product content, SEO, and inventory details.",
  });
}

export default async function EditAdminProductPage({ params, searchParams }: EditAdminProductPageProps) {
  await requireRouteAccess({
    permissions: [rbacPermissions.adminAccess, rbacPermissions.catalogWrite],
    from: routes.admin.products,
  });

  const { productId } = await params;
  const query = (await searchParams) ?? {};

  const [product, categories] = await Promise.all([
    getAdminProductById(productId),
    listAdminProductCategories(),
  ]);

  if (!product) {
    notFound();
  }

  const noticeMessage = getProductNoticeMessage(query.notice);
  const errorMessage = getProductErrorMessage(query.error, "The product could not be updated. Please try again.");

  return (
    <PageShell className="gap-8">
      <AdminPageHeader
        eyebrow="Catalog"
        title={`Edit ${product.title}`}
        description="Adjust content, pricing, inventory, related items, and SEO in one place."
        actions={
          <DeleteProductButton
            productId={product.id}
            productTitle={product.title}
            returnTo={routes.admin.productEdit(product.id)}
          />
        }
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

      <AdminProductForm
        mode="edit"
        action={updateAdminProductAction}
        returnTo={routes.admin.productEdit(product.id)}
        submitLabel="Save changes"
        categories={categories}
        product={product}
      />
    </PageShell>
  );
}
