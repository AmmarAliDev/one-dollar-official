import { Layers3 } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { buildMetadata } from "@/config/metadata";
import { CategoryOverviewCard, getCatalogCategories } from "@/features/catalog";

export const metadata = buildMetadata({
  title: "Categories",
  path: "/categories",
  description: "SEO-friendly category routes with scalable product listing foundations.",
});

export default async function CategoriesPage() {
  const categories = await getCatalogCategories();

  return (
    <PageShell className="gap-8">
      <SectionHeader
        eyebrow="Catalog"
        title="Browse simple categories"
        description="Category landing pages now use clean slugs and a shared listing foundation that can scale into real catalog persistence later."
      />

      {categories.length === 0 ? (
        <EmptyState
          icon={Layers3}
          title="No categories available yet"
          description="Catalog categories will appear here once the product catalog is connected to real data."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <CategoryOverviewCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
