import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Card, CardContent } from "./card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed", className)} role="status">
      <CardContent className="flex flex-col items-start gap-4 p-6 sm:p-8">
        <div className="bg-primary/10 text-primary rounded-2xl p-3" aria-hidden="true">
          <Icon className="size-5" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="text-muted-foreground max-w-2xl text-sm">{description}</p>
        </div>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
