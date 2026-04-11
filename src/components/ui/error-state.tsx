import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Badge } from "./badge";
import { Card, CardContent } from "./card";

type ErrorStateProps = {
  title?: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  className,
}: ErrorStateProps) {
  return (
    <Card className={cn(className)} role="alert">
      <CardContent className="flex flex-col gap-4 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="bg-warning/15 text-warning rounded-2xl p-3" aria-hidden="true">
            <AlertTriangle className="size-5" />
          </div>
          <div className="space-y-1">
            <Badge variant="warning">Needs attention</Badge>
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">{description}</p>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
