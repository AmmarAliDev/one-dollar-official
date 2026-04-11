import type { ReactNode } from "react";

import { PageContainer } from "@/components/ui/page-container";
import { cn } from "@/lib/utils";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <PageContainer
      as="section"
      className={cn("flex w-full flex-1 flex-col gap-6 py-[var(--space-section)]", className)}
    >
      {children}
    </PageContainer>
  );
}
