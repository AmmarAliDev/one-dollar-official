import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageContainerProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "main" | "article";
  children: ReactNode;
};

export function PageContainer({
  as: Component = "div",
  children,
  className,
  ...props
}: PageContainerProps) {
  return (
    <Component
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
