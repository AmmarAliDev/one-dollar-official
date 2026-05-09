import { ChevronDown, Heart, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { CartMiniCart } from "@/features/cart/components/cart-mini-cart";
import { MobileCartButton } from "@/features/cart/components/mobile-cart-button";
import { getCatalogCategories } from "@/features/catalog";

import { logger } from "@/lib/logger";
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
import { StorefrontHeaderAuthControls } from "./storefront-header-auth-controls";

export async function AppHeader() {
  let categoriesError = false;
  let categories = [] as Awaited<ReturnType<typeof getCatalogCategories>>;

  try {
    categories = await getCatalogCategories();
  } catch (error) {
    categoriesError = true;
    logger.error("Failed to load header categories", {
      code: "HEADER_CATEGORY_NAV_LOAD_FAILED",
      error,
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
    <header className="border-border/70 bg-background-header-footer/95 sticky top-0 z-40 border-b backdrop-blur">
      <a
        href="#main-content"
        className="bg-background focus-visible:ring-ring sr-only absolute left-4 top-4 rounded-md px-3 py-2 focus:not-sr-only focus-visible:outline-none focus-visible:ring-2"
      >
        Skip to content
      </a>

      <PageContainer className="relative flex flex-col gap-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={routes.storefront.home}
            className="text-base font-semibold tracking-tight"
            aria-label={`${siteConfig.name} homepage`}
          >
            <span className="flex min-w-0 items-center gap-3">
              <Image
                src={siteConfig.logoPath}
                alt={`${siteConfig.name} logo`}
                width={200}
                height={100}
                sizes="(min-width: 1024px) 200px, (min-width: 768px) 160px, 120px"
                className="h-20 w-40 lg:h-25 lg:w-50 rounded-md object-contain"
                loading="eager"
              />

              {/* <span className="min-w-0">
                <span className="text-base font-semibold tracking-tight">
                  {siteConfig.name}
                </span>
              </span> */}
            </span>
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
            <StorefrontHeaderAuthControls
              topLevelNavItems={topLevelNavItems}
              categoryMenuItems={categoryMenuItems}
              categoryMenuError={
                categoriesError
                  ? "Categories are temporarily unavailable."
                  : null
              }
              mode="mobile"
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
            {/* Temporarily disabled */}
            {/* <ThemeToggle /> */}
            <StorefrontHeaderAuthControls
              topLevelNavItems={topLevelNavItems}
              categoryMenuItems={categoryMenuItems}
              categoryMenuError={
                categoriesError
                  ? "Categories are temporarily unavailable."
                  : null
              }
              mode="desktop"
            />
          </div>
        </div>

        <nav aria-label="Storefront" className="hidden w-full justify-center overflow-x-auto pb-1 md:flex">
          <ul className="flex items-center gap-1">
            {topLevelNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted hover:bg-accent hover:text-foreground rounded-full px-3 py-2 text-sm transition-colors"
                >
                  {item.title}
                </Link>
              </li>
            ))}
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="text-muted hover:bg-accent hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2"
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
                  {categoriesError ? (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled>
                        Categories are temporarily unavailable.
                      </DropdownMenuItem>
                    </>
                  ) : null}
                  {!categoriesError && categories.length === 0 ? (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled>
                        No categories are available yet.
                      </DropdownMenuItem>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </ul>
        </nav>
      </PageContainer>
    </header>
  );
}
