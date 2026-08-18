"use client";

import { useSession } from "next-auth/react";

import { routes } from "@/config/routes";
import { RoleKey } from "@/lib/auth/roles";
import type { NavItem } from "@/types/app";

import type { StorefrontCategoryMenuItem } from "./storefront-category-menu";
import { StorefrontMobileNav } from "./storefront-mobile-nav";
import UserMenu from "./user-menu";

type StorefrontHeaderAuthControlsProps = {
  topLevelNavItems: NavItem[];
  categoryMenuItems: StorefrontCategoryMenuItem[];
  categoryMenuError: string | null;
  mode: "mobile" | "desktop";
};

export function StorefrontHeaderAuthControls({
  topLevelNavItems,
  categoryMenuItems,
  categoryMenuError,
  mode,
}: StorefrontHeaderAuthControlsProps) {
  const { data: session } = useSession();
  const isSignedIn = Boolean(session?.user?.id);
  const isAdmin = Boolean(session?.user?.role === RoleKey.SUPER_ADMIN);

  if (mode === "mobile") {
    return (
      <StorefrontMobileNav
        navItems={topLevelNavItems}
        categoryMenuItems={categoryMenuItems}
        categoryMenuError={categoryMenuError}
        accountHref={routes.storefront.account}
        wishlistHref={routes.storefront.wishlist}
        cartHref={routes.storefront.cart}
        isSignedIn={isSignedIn}
      />
    );
  }

  return <UserMenu isSignedIn={isSignedIn} isAdmin={isAdmin} navItems={topLevelNavItems} />;
}
