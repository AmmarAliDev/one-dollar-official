import { ChevronDown, Heart, Search, Store } from "lucide-react";
import Link from "next/link";

import { auth } from "@/auth";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { getCatalogCategories } from "@/features/catalog";
import { CartMiniCart } from "@/features/cart/components/cart-mini-cart";
import { MobileCartButton } from "@/features/cart/components/mobile-cart-button";

import { RoleKey } from "@/lib/auth/roles";
import { logger } from "@/lib/logger";
import { ThemeToggle } from "../theme-toggle";
import { buttonVariants } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { PageContainer } from "../ui/page-container";
import { buildStorefrontCategoryMenu } from "./storefront-category-menu";
import { StorefrontMobileNav } from "./storefront-mobile-nav";
import UserMenu from "./user-menu";

export async function AppHeader() {
  const [session, categoriesResult] = await Promise.allSettled([auth(), getCatalogCategories()]);

  const resolvedSession = session.status === "fulfilled" ? session.value : null;
  const isSignedInResolved = Boolean(resolvedSession?.user?.id);

  const categories =
    categoriesResult.status === "fulfilled"
      ? categoriesResult.value
      : [];

  if (categoriesResult.status === "rejected") {
    logger.error("Failed to load header categories", {
      code: "HEADER_CATEGORY_NAV_LOAD_FAILED",
      error: categoriesResult.reason,
    });
  }

  const categoryMenuItems = buildStorefrontCategoryMenu(
    categories.map((category) => ({
      name: category.name,
      href: category.href,
    })),
  );

  const topLevelNavItems = siteConfig.storefrontNav.filter(
    (item) => item.href !== routes.storefront.categories,
  );

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
              aria-label="Search"
            >
              <Search className="size-4" aria-hidden="true" />
            </Link>
            <MobileCartButton />
            <StorefrontMobileNav
              navItems={topLevelNavItems}
              categoryMenuItems={categoryMenuItems}
              categoryMenuError={
                categoriesResult.status === "rejected"
                  ? "Categories are temporarily unavailable."
                  : null
              }
              accountHref={routes.storefront.account}
              wishlistHref={routes.storefront.wishlist}
              cartHref={routes.storefront.cart}
              isSignedIn={isSignedInResolved}
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
              aria-label="Wishlist"
            >
              <Heart className="size-4" aria-hidden="true" />
              Wishlist
            </Link>
            <CartMiniCart />
            <ThemeToggle />
            <UserMenu
              isSignedIn={isSignedInResolved}
              isAdmin={Boolean(resolvedSession?.user?.role === RoleKey.SUPER_ADMIN)}
            />
          </div>
        </div>

        <nav aria-label="Storefront" className="hidden gap-1 overflow-x-auto pb-1 md:flex w-full justify-center">
          {topLevelNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-full px-3 py-2 text-sm transition-colors"
            >
              {item.title}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2"
              aria-label="One Dollar category navigation"
            >
              Categories
              <ChevronDown className="size-4" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56" sideOffset={8}>
              {categoryMenuItems.map((item, index) => {
                const isLastItem = index === categoryMenuItems.length - 1;
                return (
                  <div key={`${item.kind}-${item.href}-${item.title}`}>
                    <DropdownMenuItem asChild>
                      <Link href={item.href}>{item.title}</Link>
                    </DropdownMenuItem>
                    {isLastItem ? null : item.kind === "category" ? null : <DropdownMenuSeparator />}
                  </div>
                );
              })}
              {categoriesResult.status === "rejected" ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    Categories are temporarily unavailable.
                  </DropdownMenuItem>
                </>
              ) : null}
              {categoriesResult.status === "fulfilled" && categories.length === 0 ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    No categories are available yet.
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </PageContainer>
    </header>
  );
}
