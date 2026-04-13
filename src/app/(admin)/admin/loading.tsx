import { PageShell } from "@/components/layout/page-shell";
import { LoadingState } from "@/components/ui/loading-state";
import { TableSkeleton } from "@/components/ui/skeleton";

export default function AdminLoadingPage() {
  return (
    <PageShell>
      <LoadingState
        title="Loading admin workspace"
        description="Preparing dashboard data and navigation for you."
      >
        <TableSkeleton rows={5} columns={4} className="border-none shadow-none" />
      </LoadingState>
    </PageShell>
  );
}
