import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Badge } from "./badge";
import { Card, CardContent } from "./card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
  eyebrow?: string;
  align?: "start" | "center";
};

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
  className,
  eyebrow,
  align = "start",
}: EmptyStateProps) {
  const centered = align === "center";

  return (
    <Card className={cn("border-dashed", className)} role="status">
      <CardContent
        className={cn(
          "flex flex-col gap-4 p-6 sm:p-8",
          centered ? "items-center text-center" : "items-start",
        )}
      >
        <div className="bg-primary/10 text-primary rounded-2xl p-3" aria-hidden="true">
          <Icon className="size-5" />
        </div>
        <div className={cn("space-y-2", centered && "text-center")}>
          {eyebrow ? (
            <Badge variant="secondary" className={cn(centered && "mx-auto") }>
              {eyebrow}
            </Badge>
          ) : null}
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="text-muted-foreground max-w-2xl text-sm">{description}</p>
        </div>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
