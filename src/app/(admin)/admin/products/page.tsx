import Link from "next/link";
import { PackageSearch, Plus } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";
import { AdminPageHeader } from "@/features/admin/components/admin-page-patterns";
import { getProductErrorMessage, getProductNoticeMessage, listAdminProducts } from "@/features/admin/products";
import { AdminProductFiltersForm } from "@/features/admin/products/components/admin-product-filters-form";
import { AdminProductsTable } from "@/features/admin/products/components/admin-products-table";
import { requireRouteAccess } from "@/lib/auth/guards";
import { rbacPermissions } from "@/lib/auth/rbac";

type ProductStatusFilter = "ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED";
type ProductTypeFilter = "ALL" | "SIMPLE" | "VARIANT";

type AdminProductsPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    type?: string;
    page?: string;
    notice?: string;
    error?: string;
  }>;
};

function normalizeStatusFilter(value?: string): ProductStatusFilter {
  if (value === "DRAFT" || value === "PUBLISHED" || value === "ARCHIVED") {
    return value;
  }

  return "ALL";
}

function normalizeTypeFilter(value?: string): ProductTypeFilter {
  if (value === "SIMPLE" || value === "VARIANT") {
    return value;
  }

  return "ALL";
}

function normalizePageParam(value?: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

export const metadata = buildMetadata({
  title: "Admin Products",
  path: routes.admin.products,
  description: "Manage catalog products, variants, stock, and SEO metadata.",
});

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  await requireRouteAccess({
    permissions: [rbacPermissions.adminAccess, rbacPermissions.catalogRead],
    from: routes.admin.products,
  });

  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";
  const status = normalizeStatusFilter(params.status);
  const type = normalizeTypeFilter(params.type);
  const page = normalizePageParam(params.page);

  const products = await listAdminProducts({
    query,
    status,
    type,
    page,
    pageSize: 20,
  });

  const noticeMessage = getProductNoticeMessage(params.notice);
  const errorMessage = getProductErrorMessage(params.error);

  return (
    <PageShell className="gap-8">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Products"
        description="Manage simple and variant-based products with plain-language fields, stock details, and SEO controls."
        actions={
          <Link href={routes.admin.productCreate} className={buttonVariants({ size: "sm" })}>
            <Plus className="size-4" />
            Add product
          </Link>
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

      <Card>
        <CardHeader>
          <CardTitle>Search and filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdminProductFiltersForm query={query} status={status} type={type} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product list</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminProductsTable
            products={products}
            emptyTitle="No products found"
            emptyDescription="Create your first product or adjust the current filters."
          />
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-muted-foreground">
          <PackageSearch className="mt-0.5 size-4" />
          <p>
            Content tip: keep titles specific, short descriptions benefit-led, and variant names shopper-friendly such as Small / Blue instead of internal shorthand.
          </p>
        </CardContent>
      </Card>
    </PageShell>
  );
}
