import { PageShell } from "@/components/layout/page-shell";
import { LoadingState } from "@/components/ui/loading-state";

export default function BlogLoadingPage() {
  return (
    <PageShell>
      <LoadingState
        title="Loading articles"
        description="Please wait while we prepare the latest blog posts."
      />
    </PageShell>
  );
}
