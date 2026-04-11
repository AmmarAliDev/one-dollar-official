"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
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
      <body className="bg-background text-foreground flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl space-y-4">
          <ErrorState
            title="The app needs a fresh retry"
            description={toUserMessage(error)}
            action={<Button onClick={() => reset()}>Reload experience</Button>}
          />
          {process.env.NODE_ENV === "development" ? (
            <pre className="bg-muted text-muted-foreground overflow-x-auto rounded-[var(--radius)] p-3 text-xs">
              {error.message}
            </pre>
          ) : null}
        </div>
      </body>
    </html>
  );
}
