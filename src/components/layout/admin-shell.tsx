import Link from "next/link";
import type { ReactNode } from "react";

import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

import { ThemeToggle } from "../theme-toggle";
import { Badge } from "../ui/badge";
import { buttonVariants } from "../ui/button";
import { PageContainer } from "../ui/page-container";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="bg-muted/25 min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[96rem] lg:grid-cols-[280px_1fr]">
        <aside className="border-border/70 bg-card/95 flex flex-col gap-6 border-b p-4 shadow-[var(--shadow-soft)] lg:border-r lg:border-b-0 lg:p-6">
          <div className="space-y-2">
            <Badge variant="info">Admin preview</Badge>
            <div>
              <Link href={routes.admin.dashboard} className="text-lg font-semibold tracking-tight">
                {siteConfig.name} Ops
              </Link>
              <p className="text-muted-foreground text-sm">
                Shared placeholder shell for catalog, order, and content workflows.
              </p>
            </div>
          </div>

          <nav aria-label="Admin sections" className="grid gap-2">
            {siteConfig.adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:bg-accent hover:text-accent-foreground rounded-xl px-3 py-2 transition-colors"
              >
                <p className="text-sm font-medium">{item.title}</p>
                {item.description ? (
                  <p className="text-muted-foreground text-xs">{item.description}</p>
                ) : null}
              </Link>
            ))}
          </nav>

          <div className="bg-muted/60 rounded-[var(--radius-card)] p-4 text-sm">
            <p className="font-medium">Deferred on purpose</p>
            <p className="text-muted-foreground mt-1">
              Real data, RBAC, and CRUD tools arrive in later prompts on top of this shell.
            </p>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="border-border/70 bg-background/85 sticky top-0 z-30 border-b backdrop-blur">
            <PageContainer className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="text-sm font-medium">Operations workspace</p>
                <p className="text-muted-foreground text-sm">
                  Responsive admin foundation with sidebar, topbar, and reusable page spacing.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Link href={routes.storefront.home} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  View storefront
                </Link>
              </div>
            </PageContainer>
          </header>

          <main id="main-content" className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
