import Link from "next/link";
import type { RoleKey } from "@prisma/client";
import type { ReactNode } from "react";
import type { Session } from "next-auth";
import { ChevronDown, LogOut, Store } from "lucide-react";

import { routes } from "@/config/routes";
import { signOutAction } from "@/features/auth/actions/sign-out";
import { AdminBreadcrumb } from "@/features/admin/components/admin-breadcrumb";
import { AdminSidebarNav } from "@/features/admin/components/admin-sidebar-nav";
import { getAdminRoleSummary, getVisibleAdminNavigation } from "@/features/admin/navigation";

import { ThemeToggle } from "../theme-toggle";
import { Badge } from "../ui/badge";
import { buttonVariants } from "../ui/button";
import { PageContainer } from "../ui/page-container";

type AdminShellProps = {
  children: ReactNode;
  role: RoleKey | null;
  user: NonNullable<Session["user"]>;
};

export function AdminShell({ children, role, user }: AdminShellProps) {
  const visibleNav = getVisibleAdminNavigation(role);

  return (
    <div className="bg-muted/25 min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-384 lg:grid-cols-[280px_1fr]">
        <aside className="border-border/70 bg-card/95 flex flex-col gap-6 border-b p-4 shadow-(--shadow-soft) lg:border-r lg:border-b-0 lg:p-6">
          <div className="space-y-2">
            <Badge variant="info">Admin workspace</Badge>
            <div>
              <Link href={routes.admin.dashboard} className="text-lg font-semibold tracking-tight">
                One Dollar Ops
              </Link>
              <p className="text-muted-foreground text-sm">
                Friendly operations panel for day-to-day store management.
              </p>
            </div>
          </div>

          <AdminSidebarNav items={visibleNav} />

          <div className="bg-muted/60 rounded-(--radius-card) p-4 text-sm">
            <p className="font-medium">{getAdminRoleSummary(role)}</p>
            <p className="text-muted-foreground mt-1">Menu items are shown based on what this role can access.</p>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="border-border/70 bg-background/85 sticky top-0 z-30 border-b backdrop-blur">
            <PageContainer className="flex flex-wrap items-start justify-between gap-3 py-4">
              <div className="space-y-2">
                <AdminBreadcrumb navItems={visibleNav} />
                <p className="text-sm font-medium">Operations workspace</p>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Link href={routes.storefront.home} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  <Store className="size-4" />
                  View storefront
                </Link>

                <details className="group relative">
                  <summary className={buttonVariants({ variant: "outline", size: "sm" })}>
                    {user.name ?? user.email ?? "Admin user"}
                    <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                  </summary>

                  <div className="border-border/70 bg-card absolute right-0 z-40 mt-2 w-56 rounded-xl border p-2 shadow-(--shadow-soft)">
                    <p className="px-2 py-1.5 text-xs text-muted-foreground">{user.email ?? "No email available"}</p>
                    <Link
                      href={routes.storefront.accountProfile}
                      className="hover:bg-accent hover:text-foreground block rounded-lg px-2 py-1.5 text-sm text-muted-foreground"
                    >
                      My profile
                    </Link>
                    <form action={signOutAction} className="mt-1">
                      <button
                        type="submit"
                        className="hover:bg-accent hover:text-foreground flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-muted-foreground"
                      >
                        <LogOut className="size-4" />
                        Sign out
                      </button>
                    </form>
                  </div>
                </details>
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
