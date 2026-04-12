import { PageShell } from "@/components/layout/page-shell";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function CategoriesLoading() {
  return (
    <PageShell className="gap-8">
      <div className="space-y-3">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <CardSkeleton key={`category-overview-skeleton-${index}`} lines={4} />
        ))}
      </div>
    </PageShell>
  );
}
