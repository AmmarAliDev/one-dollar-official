"use client";

import { PageShell } from "@/components/layout/page-shell";
import { PageErrorFallback } from "@/components/ui/page-error-fallback";

export default function BlogPostErrorPage({
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
        title="We could not load this article"
        description="Try loading this page again. If the issue continues, return to the blog listing."
        onRetry={retry}
        retryLabel="Retry article load"
        fullPage={false}
      />
    </PageShell>
  );
}
