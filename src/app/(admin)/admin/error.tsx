"use client";

import { useEffect } from "react";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { PageErrorFallback } from "@/components/ui/page-error-fallback";
import { logger } from "@/lib/logger";

export default function AdminErrorPage({
  error,
  unstable_retry,
  reset,
}: {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Admin route error boundary triggered", {
      digest: error.digest,
      message: error.message,
    });
  }, [error]);

  const retry = unstable_retry ?? reset;

  return (
    <PageShell>
      <PageErrorFallback
        error={error}
        title="The admin workspace hit an issue"
        description="Please try again. If this continues, contact your technical support contact."
        action={
          <Button variant="outline" onClick={() => retry()}>
            Reload admin page
          </Button>
        }
        fullPage={false}
      />
    </PageShell>
  );
}
