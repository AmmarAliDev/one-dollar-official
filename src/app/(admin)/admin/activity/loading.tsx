import { PageShell } from "@/components/layout/page-shell";
import { LoadingState } from "@/components/ui/loading-state";
import { TableSkeleton } from "@/components/ui/skeleton";

export default function AdminActivityLoadingPage() {
  return (
    <PageShell>
      <LoadingState
        title="Loading activity feed"
        description="Collecting recent team and system actions for this page."
      >
        <TableSkeleton rows={6} columns={2} className="border-none shadow-none" />
      </LoadingState>
    </PageShell>
  );
}
