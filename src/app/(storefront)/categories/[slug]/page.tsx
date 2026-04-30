import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";
import { buildMetadata } from "@/config/metadata";
import {
  CategoryInfiniteProductGrid,
  CategoryListingFilters,
  getCatalogCategory,
  getCatalogCategoryListing,
  getCatalogCategorySlugs,
} from "@/features/catalog";

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
          <CategoryInfiniteProductGrid listing={listing} />
        </div>
      </div>
    </PageShell>
  );
}
