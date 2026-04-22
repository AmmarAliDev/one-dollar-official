import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PackageSearch } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { buildMetadata } from "@/config/metadata";
import {
  CatalogPagination,
  CategoryListingFilters,
  getCatalogCategory,
  getCatalogCategoryListing,
  getCatalogCategorySlugs,
  ProductGridCard,
} from "@/features/catalog";
import { testIds } from "@/lib/test-selectors";

export const revalidate = 900;

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateStaticParams() {
  const slugs = await getCatalogCategorySlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: Pick<CategoryPageProps, "params">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCatalogCategory(slug);

  if (!category) {
    return buildMetadata({
      title: "Category",
      path: `/categories/${slug}`,
      description: "Product listing category page.",
    });
  }

  return buildMetadata({
    title: category.seoTitle ?? category.name,
    path: `/categories/${category.slug}`,
    description: category.seoDescription ?? category.description,
  });
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, rawSearchParams] = await Promise.all([params, searchParams]);
  const listing = await getCatalogCategoryListing({ slug, searchParams: rawSearchParams });

  if (!listing) {
    notFound();
  }

  return (
    <PageShell className="gap-8">
      <SectionHeader
        eyebrow="Category listing"
        title={listing.category.name}
        description={listing.category.description}
        actions={
          <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
            <span>{listing.filteredProductCount} matching products</span>
            <span>{listing.totalProductCount} total in category</span>
          </div>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <CategoryListingFilters listing={listing} />
        </aside>

        <div className="space-y-6">
          {listing.products.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No products match these filters"
              description="Try adjusting your filters to see more products."
              eyebrow="Empty state"
            />
          ) : (
            <div
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
              data-testid={testIds.storefront.productGrid}
            >
              {listing.products.map((product) => (
                <ProductGridCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <CatalogPagination listing={listing} />
        </div>
      </div>
    </PageShell>
  );
}
