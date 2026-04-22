"use client";

import { useEffect } from "react";

import { PageErrorFallback } from "@/components/ui/page-error-fallback";
import { createLogger } from "@/lib/logger";

const routeErrorLogger = createLogger("route-error-boundary");

export default function Error({
  error,
  unstable_retry,
  reset,
}: {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
  reset: () => void;
}) {
  useEffect(() => {
    routeErrorLogger.error("Route error boundary triggered", {
      error,
      digest: error.digest,
    });
  }, [error]);

  const retry = unstable_retry ?? reset;

  return <PageErrorFallback error={error} title="We hit a recoverable error" onRetry={retry} />;
}
