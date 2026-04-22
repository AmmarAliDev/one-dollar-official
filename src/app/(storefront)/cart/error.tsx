"use client";

import { PageShell } from "@/components/layout/page-shell";
import { PageErrorFallback } from "@/components/ui/page-error-fallback";

export default function CartErrorPage({
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
        title="We could not load your cart"
        description="Try reloading this page. If the issue continues, please return to shopping and try again."
        onRetry={retry}
        retryLabel="Retry cart load"
        fullPage={false}
      />
    </PageShell>
  );
}
