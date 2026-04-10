"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-primary">Global error boundary</p>
          <h2 className="text-2xl font-semibold tracking-tight">The app needs a fresh retry.</h2>
          <p className="text-muted-foreground">
            A top-level failure was caught safely so the UI can recover without exposing internals.
          </p>
          <Button onClick={() => reset()}>Reload experience</Button>
          {process.env.NODE_ENV === "development" ? (
            <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
              {error.message}
            </pre>
          ) : null}
        </div>
      </body>
    </html>
  );
}
