import { PageShell } from "@/components/layout/page-shell";
import { LoadingState } from "@/components/ui/loading-state";

export default function BlogPostLoadingPage() {
  return (
    <PageShell>
      <LoadingState
        title="Loading article"
        description="Please wait while we fetch the full blog post."
      />
    </PageShell>
  );
}
