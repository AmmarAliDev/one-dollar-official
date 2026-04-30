import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";

export function CategoryListingSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div className="space-y-4">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <CardSkeleton lines={6} />
      </div>

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={`catalog-card-skeleton-${index}`} showImage lines={4} />
          ))}
        </div>
      </div>
    </div>
  );
}
