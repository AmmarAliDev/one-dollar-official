import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

type CardSkeletonProps = SkeletonProps & {
  lines?: number;
  showImage?: boolean;
};

type PageSkeletonProps = SkeletonProps & {
  cards?: number;
};

type TableSkeletonProps = SkeletonProps & {
  rows?: number;
  columns?: number;
};

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div aria-hidden="true" className={cn("bg-muted animate-pulse rounded-md", className)} {...props} />;
}

export function CardSkeleton({ className, lines = 4, showImage = false }: CardSkeletonProps) {
  return (
    <div
      className={cn(
        "border-border/70 bg-card rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <div className="space-y-3">
        {showImage ? <Skeleton className="mb-4 aspect-[4/3] w-full rounded-xl" /> : null}
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={`card-skeleton-line-${index}`}
            className={cn(
              index === 1 ? "h-7" : "h-4",
              index === 0 && "w-24",
              index === 1 && "w-2/3",
              index > 1 ? (index % 2 === 0 ? "w-full" : "w-5/6") : undefined,
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton({ cards = 3, className }: PageSkeletonProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3", className)}>
      {Array.from({ length: cards }).map((_, index) => (
        <CardSkeleton key={`page-skeleton-card-${index}`} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 4, columns = 4, className }: TableSkeletonProps) {
  return (
    <div
      className={cn(
        "border-border/70 bg-card overflow-hidden rounded-[var(--radius-card)] border shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <div className="grid gap-3 border-b border-border/70 p-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`table-skeleton-header-${index}`} className="h-4 w-3/4" />
        ))}
      </div>

      <div className="space-y-3 p-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`table-skeleton-row-${rowIndex}`}
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <Skeleton key={`table-skeleton-cell-${rowIndex}-${columnIndex}`} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
