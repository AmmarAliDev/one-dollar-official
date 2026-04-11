import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Card, CardContent } from "./card";

type LoadingStateProps = {
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export function LoadingState({
  title = "Loading content",
  description = "Please wait while we prepare the page.",
  children,
  className,
}: LoadingStateProps) {
  return (
    <Card className={cn(className)} aria-busy="true" aria-live="polite">
      <CardContent className="flex flex-col gap-4 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <LoaderCircle className="text-primary size-5 animate-spin" />
          <div>
            <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
