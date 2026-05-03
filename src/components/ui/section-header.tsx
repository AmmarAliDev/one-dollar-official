import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Badge } from "./badge";

type SectionHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
  titleAs?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  titleId?: string;
};

export function SectionHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
  titleAs = "h2",
  titleId,
}: SectionHeaderProps) {
  const TitleTag = titleAs;

  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="space-y-3">
        {eyebrow ? <Badge variant="secondary">{eyebrow}</Badge> : null}
        <div className="space-y-2">
          <TitleTag
            id={titleId}
            className="text-2xl text-foreground font-semibold tracking-tight text-balance sm:text-3xl"
          >
            {title}
          </TitleTag>
          {description ? <p className="text-primary max-w-2xl text-sm sm:text-base">{description}</p> : null}
        </div>
      </div>

      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
