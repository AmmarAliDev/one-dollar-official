import { PageShell } from "@/components/layout/page-shell";
import { ProductDetailSkeleton } from "@/features/catalog/components/product-detail-skeleton";

export default function ProductLoading() {
  return (
    <PageShell className="gap-14">
      <ProductDetailSkeleton />
    </PageShell>
  );
}
