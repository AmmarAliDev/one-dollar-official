"use client";

import { Heart, Menu, ShoppingCart, User, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/app";

import { ThemeToggle } from "../theme-toggle";
import { Button, buttonVariants } from "../ui/button";

type StorefrontMobileNavProps = {
  navItems: NavItem[];
  accountHref: string;
  wishlistHref: string;
  cartHref: string;
  isSignedIn: boolean;
};

export function StorefrontMobileNav({
  navItems,
  accountHref,
  wishlistHref,
  cartHref,
  isSignedIn,
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
          className="border-border/80 bg-card/98 absolute inset-x-0 top-full z-50 border-b px-4 py-4 shadow-(--shadow-soft) backdrop-blur"
        >
          <div className="mx-auto flex w-full max-w-(--container-width) flex-col gap-4">
            <div className={cn("grid gap-2 place-items-center", isSignedIn ? "grid-cols-5" : "grid-cols-4")}>
              <ThemeToggle />
              <Link
                href={wishlistHref}
                className={buttonVariants({ variant: "outline", size: "icon" })}
                onClick={() => setIsOpen(false)}
              >
                <Heart className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href={cartHref}
                className={buttonVariants({ variant: "outline", size: "icon" })}
                onClick={() => setIsOpen(false)}
              >
                <ShoppingCart className="size-4" aria-hidden="true" />
              </Link>

              
              <Link
                href={accountHref}
                className={buttonVariants({ variant: "outline", size: "icon" })}
                onClick={() => setIsOpen(false)}
              >
                <User className="size-4" aria-hidden="true" />
              </Link>

              {isSignedIn && (
                <SignOutButton
                  variant="outline"
                  size="icon"
                  className="px-2 w-max"
                  formClassName="w-max"
                  fullWidth
                  showText={false}
                  // className="text-destructive"
                  onBeforeSubmit={() => setIsOpen(false)}
                />
              )}
            </div>
            <nav aria-label="Mobile storefront" className="grid gap-2">
              <div className="flex justify-end w-full"></div>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
                >
                  {item.title}
                </Link>
              ))}
            </nav>



          </div>
        </div>
      ) : null}
    </div>
  );
}
