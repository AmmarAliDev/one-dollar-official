import { PageShell } from "@/components/layout/page-shell";
import { LoadingState } from "@/components/ui/loading-state";
import { PageSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <PageShell>
      <LoadingState
        title="Loading the interface preview"
        description="Shared storefront and admin surfaces are being prepared."
      >
        <PageSkeleton />
      </LoadingState>
    </PageShell>
  );
}
