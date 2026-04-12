import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="space-y-12">
      {/* Top hero: gallery + panel */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery skeleton */}
        <div className="flex gap-3 flex-row-reverse">
          <Skeleton className="flex-1 min-h-[320px] rounded-[var(--radius-card)]" />
          <div className="flex flex-col gap-2 w-20">
            <Skeleton className="h-20 w-20 rounded-lg" />
            <Skeleton className="h-20 w-20 rounded-lg" />
            <Skeleton className="h-20 w-20 rounded-lg" />
          </div>
        </div>

        {/* Product panel skeleton */}
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <div className="space-y-2 border-t pt-5">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-20 rounded-lg" />
              <Skeleton className="h-10 w-20 rounded-lg" />
              <Skeleton className="h-10 w-20 rounded-lg" />
            </div>
          </div>
          <div className="border-t pt-5">
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Specifications skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-0 rounded-[var(--radius-card)] border border-border/70 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`spec-skel-${i}`} className="flex gap-8 px-5 py-3 border-b border-border/70 last:border-0">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </div>
      </div>

      {/* Reviews skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <div className="space-y-3">
            <Skeleton className="h-14 w-28" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={`rev-bar-${i}`} className="h-3 w-full" />
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={`rev-skel-${i}`} className="rounded-[var(--radius-card)] border p-5 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related products skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-8 w-44" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`rel-skel-${i}`} className="rounded-[var(--radius-card)] border overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
