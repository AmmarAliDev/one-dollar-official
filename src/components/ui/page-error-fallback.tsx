import type { ReactNode } from "react";

import { toUserMessage } from "@/lib/errors/error-messages";
import { cn } from "@/lib/utils";

import { Button } from "./button";
import { ErrorState } from "./error-state";

type PageErrorFallbackProps = {
  error: unknown;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  action?: ReactNode;
  className?: string;
  fullPage?: boolean;
  showDetails?: boolean;
};

export function PageErrorFallback({
  error,
  title = "Something interrupted this page",
  description,
  onRetry,
  retryLabel = "Try again",
  action,
  className,
  fullPage = true,
  showDetails = false,
}: PageErrorFallbackProps) {
  const safeDescription = description ?? toUserMessage(error);
  const debugMessage = error instanceof Error ? error.message : null;

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8 sm:px-6",
        fullPage && "min-h-[60vh] items-center justify-center",
        className,
      )}
    >
      <ErrorState
        title={title}
        description={safeDescription}
        action={
          action ??
          (onRetry ? <Button onClick={() => onRetry()}>{retryLabel}</Button> : undefined)
        }
        className="w-full"
      />

      {showDetails && debugMessage ? (
        <pre className="bg-muted text-muted-foreground overflow-x-auto rounded-(--radius) p-3 text-xs">
          {debugMessage}
        </pre>
      ) : null}
    </div>
  );
}
