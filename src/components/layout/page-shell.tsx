import type { HTMLAttributes, ReactNode } from "react";

import { PageContainer } from "@/components/ui/page-container";
import { cn } from "@/lib/utils";

type PageShellProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function PageShell({ children, className, ...props }: PageShellProps) {
  return (
    <PageContainer
      as="section"
      className={cn("flex w-full flex-1 flex-col gap-6 py-[var(--space-section)]", className)}
      {...props}
    >
      {children}
    </PageContainer>
  );
}
