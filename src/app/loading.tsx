export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-4 w-40 animate-pulse rounded bg-muted" />
      <div className="h-10 w-80 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-xl border border-border bg-card" />
        <div className="h-40 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    </div>
  );
}
