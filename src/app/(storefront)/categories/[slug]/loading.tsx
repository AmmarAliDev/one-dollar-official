import { PageShell } from "@/components/layout/page-shell";
import { CategoryListingSkeleton } from "@/features/catalog";

export default function CategoryLoading() {
  return (
    <PageShell>
      <CategoryListingSkeleton />
    </PageShell>
  );
}
