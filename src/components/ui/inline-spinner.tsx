import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const spinnerSizes = {
  sm: "size-4",
  default: "size-5",
  lg: "size-6",
} as const;

type InlineSpinnerProps = {
  label?: string;
  srOnlyLabel?: string;
  size?: keyof typeof spinnerSizes;
  className?: string;
};

export function InlineSpinner({
  label,
  srOnlyLabel = "Loading",
  size = "default",
  className,
}: InlineSpinnerProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}
      role="status"
      aria-live="polite"
    >
      <LoaderCircle className={cn("text-primary animate-spin", spinnerSizes[size])} aria-hidden="true" />
      {label ? <span>{label}</span> : <span className="sr-only">{srOnlyLabel}</span>}
    </span>
  );
}
