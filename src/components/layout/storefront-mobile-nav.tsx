"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";

import type { NavItem } from "@/types/app";

import { Button, buttonVariants } from "../ui/button";

type StorefrontMobileNavProps = {
  navItems: NavItem[];
  searchHref: string;
  accountHref: string;
  wishlistHref: string;
  cartHref: string;
};

export function StorefrontMobileNav({
  navItems,
  searchHref,
  accountHref,
  wishlistHref,
  cartHref,
}: StorefrontMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-panel"
        onClick={() => setIsOpen((value) => !value)}
      >
        {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
      </Button>

      {isOpen ? (
        <div
          id="mobile-navigation-panel"
          className="border-border/70 bg-background absolute inset-x-0 top-full z-50 border-b px-4 py-4 shadow-lg"
        >
          <div className="mx-auto flex w-full max-w-[var(--container-width)] flex-col gap-4">
            <Link
              href={searchHref}
              className={buttonVariants({ variant: "outline" })}
              onClick={() => setIsOpen(false)}
            >
              <Search className="size-4" aria-hidden="true" />
              Search products
            </Link>

            <nav aria-label="Mobile storefront" className="grid gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-foreground rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  {item.title}
                </Link>
              ))}
            </nav>

            <div className="grid grid-cols-3 gap-2">
              <Link
                href={accountHref}
                className={buttonVariants({ variant: "outline", size: "sm" })}
                onClick={() => setIsOpen(false)}
              >
                <User className="size-4" aria-hidden="true" />
                Account
              </Link>
              <Link
                href={wishlistHref}
                className={buttonVariants({ variant: "outline", size: "sm" })}
                onClick={() => setIsOpen(false)}
              >
                <Heart className="size-4" aria-hidden="true" />
                Wishlist
              </Link>
              <Link
                href={cartHref}
                className={buttonVariants({ variant: "outline", size: "sm" })}
                onClick={() => setIsOpen(false)}
              >
                <ShoppingCart className="size-4" aria-hidden="true" />
                Cart
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
