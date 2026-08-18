"use client";

import Link from "next/link";
import { LayoutDashboard, User } from "lucide-react";

import { routes } from "@/config/routes";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import type { NavItem } from "@/types/app";

import { buttonVariants } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const UserMenu = ({
  isSignedIn,
  isAdmin,
  navItems,
}: {
  isSignedIn: boolean;
  isAdmin: boolean;
  navItems: NavItem[];
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={buttonVariants({ variant: "outline", size: "sm" })}
          aria-label="Open user and navigation menu"
        >
          <User className="size-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex min-w-48 flex-col gap-1 bg-card">
        {navItems.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link
              href={item.href}
              className={buttonVariants({ variant: "ghost", size: "sm", className: "cursor-pointer" })}
            >
              {item.title}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link
              href={routes.admin.dashboard}
              className={buttonVariants({ variant: "ghost", size: "sm", className: "cursor-pointer" })}
            >
              <LayoutDashboard className="size-4" aria-hidden="true" />
              Admin Panel
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link
            href={routes.storefront.account}
            className={buttonVariants({ variant: "ghost", size: "sm", className: "cursor-pointer" })}
          >
            <User className="size-4" aria-hidden="true" />
            {isSignedIn ? "Account" : "Sign in"}
          </Link>
        </DropdownMenuItem>
        {isSignedIn && (
          <div className="pb-1 w-full">
            <SignOutButton
              fullWidth={true}
              variant="ghost"
              className={buttonVariants({ variant: "ghost", size: "sm", className: "cursor-pointer rounded-sm" })}
            />
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
