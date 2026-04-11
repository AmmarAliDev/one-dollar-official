"use client";

import { Button } from "@/components/ui/button";
import { toUserMessage } from "@/lib/errors/error-messages";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground flex min-h-screen items-center justify-center px-4">
        <div className="border-border bg-card max-w-xl space-y-4 rounded-xl border p-6 shadow-sm">
          <p className="text-primary text-sm font-medium">Global error boundary</p>
          <h2 className="text-2xl font-semibold tracking-tight">The app needs a fresh retry.</h2>
          <p className="text-muted-foreground">{toUserMessage(error)}</p>
          <Button onClick={() => reset()}>Reload experience</Button>
          {process.env.NODE_ENV === "development" ? (
            <pre className="bg-muted text-muted-foreground overflow-x-auto rounded-md p-3 text-xs">
              {error.message}
            </pre>
          ) : null}
        </div>
      </body>
    </html>
  );
}
