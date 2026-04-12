"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AccountNavItem = {
  href: string;
  label: string;
};

type AccountShellProps = {
  title: string;
  description: string;
  navItems: readonly AccountNavItem[];
  children: ReactNode;
};

export function AccountShell({
  title,
  description,
  navItems,
  children,
}: AccountShellProps) {
  const pathname = usePathname();

  return (
    <PageShell className="gap-8">
      <header className="space-y-3">
        <Badge variant="secondary">Customer account</Badge>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Account sections" className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-border/60 text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </PageShell>
  );
}