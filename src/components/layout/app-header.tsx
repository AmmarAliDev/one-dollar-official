import Link from "next/link";

import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

import { ThemeToggle } from "../theme-toggle";
import { buttonVariants } from "../ui/button";

export function AppHeader() {
  return (
    <header className="border-border/70 bg-background/90 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div>
          <Link href={routes.storefront.home} className="text-base font-semibold tracking-tight">
            {siteConfig.name}
          </Link>
          <p className="text-muted-foreground text-xs">Karachi-first commerce foundation</p>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {siteConfig.primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors"
            >
              {item.title}
            </Link>
          ))}
        </nav>

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
    </header>
  );
}
