import { PageShell } from "@/components/layout/page-shell";
import { LoadingState } from "@/components/ui/loading-state";

export default function CartLoadingPage() {
  return (
    <PageShell>
      <LoadingState
        title="Loading your cart"
        description="Please wait while we fetch your latest cart items and totals."
      />
    </PageShell>
  );
}
