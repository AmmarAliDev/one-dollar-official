"use client";

import { PageShell } from "@/components/layout/page-shell";
import { PageErrorFallback } from "@/components/ui/page-error-fallback";

export default function BlogErrorPage({
  error,
  unstable_retry,
  reset,
}: {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
  reset: () => void;
}) {
  const retry = unstable_retry ?? reset;

  return (
    <PageShell>
      <PageErrorFallback
        error={error}
        title="We could not load the blog"
        description="Try loading the page again. If the issue continues, please return later."
        onRetry={retry}
        retryLabel="Retry blog load"
        fullPage={false}
      />
    </PageShell>
  );
}
