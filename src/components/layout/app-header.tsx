import { Heart, Search, ShoppingCart, Store } from "lucide-react";
import Link from "next/link";

import { auth } from "@/auth";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { CartMiniCart } from "@/features/cart/components/cart-mini-cart";

import { RoleKey } from "@/lib/auth/roles";
import { ThemeToggle } from "../theme-toggle";
import { buttonVariants } from "../ui/button";
import { PageContainer } from "../ui/page-container";
import { StorefrontMobileNav } from "./storefront-mobile-nav";
import UserMenu from "./user-menu";

export async function AppHeader() {
  const session = await auth();
  const isSignedIn = Boolean(session?.user?.id);

  return (
    <header className="border-border/70 bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
      <a
        href="#main-content"
        className="bg-background focus-visible:ring-ring sr-only absolute left-4 top-4 rounded-md px-3 py-2 focus:not-sr-only focus-visible:outline-none focus-visible:ring-2"
      >
        Skip to content
      </a>

      <PageContainer className="relative flex flex-col gap-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link href={routes.storefront.home} className="text-base font-semibold tracking-tight">
            <div className="flex min-w-0 items-center gap-3">
              <div className="bg-primary/10 text-primary rounded-2xl p-2.5" aria-hidden="true">
                <Store className="size-5" />
              </div>

              <div className="min-w-0">
                <div className="text-base font-semibold tracking-tight">
                  {siteConfig.name}
                </div>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              href={routes.storefront.search}
              className={buttonVariants({ variant: "outline", size: "icon" })}
            >
              <Search className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href={routes.storefront.cart}
              className={buttonVariants({ variant: "outline", size: "icon", className: "md:hidden " })}
            >
              <ShoppingCart className="size-4" aria-hidden="true" />
            </Link>
            <StorefrontMobileNav
              navItems={siteConfig.storefrontNav}
              accountHref={routes.storefront.account}
              wishlistHref={routes.storefront.wishlist}
              cartHref={routes.storefront.cart}
              isSignedIn={isSignedIn}
            />
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href={routes.storefront.search}
              className={buttonVariants({ variant: "outline", size: "sm" })}
              aria-label="Open search"
            >
              <Search className="size-4" aria-hidden="true" />
              Search
            </Link>
            <Link
              href={routes.storefront.wishlist}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Heart className="size-4" aria-hidden="true" />
              Wishlist
            </Link>
            <CartMiniCart />
            <ThemeToggle />
            <UserMenu isSignedIn={isSignedIn} isAdmin={Boolean(session?.user?.role === RoleKey.SUPER_ADMIN)} />
          </div>
        </div>

        <nav aria-label="Storefront" className="hidden gap-1 overflow-x-auto pb-1 md:flex w-full justify-center">
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
      </PageContainer>
    </header>
  );
}
