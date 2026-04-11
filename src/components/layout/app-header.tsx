import Link from "next/link";
import { Store } from "lucide-react";

import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

import { ThemeToggle } from "../theme-toggle";
import { Badge } from "../ui/badge";
import { buttonVariants } from "../ui/button";
import { PageContainer } from "../ui/page-container";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <a
        href="#main-content"
        className="bg-background focus-visible:ring-ring sr-only absolute left-4 top-4 rounded-md px-3 py-2 focus:not-sr-only focus-visible:outline-none focus-visible:ring-2"
      >
        Skip to content
      </a>

      <PageContainer className="flex flex-col gap-3 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-2xl p-2.5" aria-hidden="true">
              <Store className="size-5" />
            </div>
            <div>
              <Link href={routes.storefront.home} className="text-base font-semibold tracking-tight">
                {siteConfig.name}
              </Link>
              <p className="text-muted-foreground text-xs">Karachi-first storefront foundation</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href={routes.auth.signIn}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Storefront" className="flex gap-1 overflow-x-auto pb-1">
            {siteConfig.storefrontNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-full px-3 py-2 text-sm transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="secondary">UI foundation</Badge>
            <span className="text-muted-foreground">
              Responsive shell • Theme switching • Accessible states
            </span>
          </div>
        </div>
      </PageContainer>
    </header>
  );
}
