"use client";

import { useEffect } from "react";

import { PageErrorFallback } from "@/components/ui/page-error-fallback";
import { createLogger } from "@/lib/logger";

const globalErrorLogger = createLogger("global-error-boundary");

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    globalErrorLogger.error("Global error boundary triggered", {
      error,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground flex min-h-screen items-center justify-center px-4 py-10">
        <PageErrorFallback
          error={error}
          title="The app needs a fresh retry"
          onRetry={reset}
          retryLabel="Reload experience"
          fullPage={false}
          className="max-w-xl px-0 py-0"
        />
      </body>
    </html>
  );
}
