import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";
import { buildMetadata } from "@/config/metadata";
import { CatalogSearchExperience } from "@/features/catalog";

export const metadata = buildMetadata({
  title: "Search",
  path: "/search",
  description: "Search products by name, category, and keyword with a fast debounced storefront experience.",
});

export default function SearchPage() {
  return (
    <PageShell className="gap-8">
      <SectionHeader
        eyebrow="Storefront"
        title="Find products fast"
        description="Search by product name, category, or common keyword. Results update quickly as you type."
      />

      <CatalogSearchExperience />
    </PageShell>
  );
}
