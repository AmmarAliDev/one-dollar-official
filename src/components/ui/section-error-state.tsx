import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import { ErrorState } from "./error-state";

type SectionErrorStateProps = {
  title?: string;
  description: string;
  action?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
};

export function SectionErrorState({
  title = "This section is temporarily unavailable",
  description,
  action,
  onRetry,
  retryLabel = "Try again",
  className,
}: SectionErrorStateProps) {
  const actions = action || onRetry ? (
    <>
      {action}
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </>
  ) : undefined;

  return (
    <ErrorState
      title={title}
      description={description}
      action={actions}
      className={cn("border-dashed shadow-none", className)}
    />
  );
}
