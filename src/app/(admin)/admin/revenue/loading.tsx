import { PageShell } from "@/components/layout/page-shell";
import { LoadingState } from "@/components/ui/loading-state";
import { TableSkeleton } from "@/components/ui/skeleton";

export default function AdminRevenueLoadingPage() {
  return (
    <PageShell>
      <LoadingState
        title="Loading revenue report"
        description="Preparing revenue summaries and order totals from recent order data."
      >
        <TableSkeleton rows={6} columns={2} className="border-none shadow-none" />
      </LoadingState>
    </PageShell>
  );
}
