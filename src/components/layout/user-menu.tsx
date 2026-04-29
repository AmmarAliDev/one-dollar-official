"use client";

import Link from "next/link";
import { LayoutDashboard, User } from "lucide-react";

import { routes } from "@/config/routes";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

import { buttonVariants } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

const UserMenu = ({ isSignedIn, isAdmin }: { isSignedIn: boolean; isAdmin: boolean }) => {
  if (!isSignedIn) {
    return (
      <Link href={routes.storefront.account} className={buttonVariants({ variant: "outline", size: "sm" })}>
        <User className="size-4" aria-hidden="true" />
        Account
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={buttonVariants({ variant: "outline", size: "sm" })}>
          <User className="size-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex min-w-40 flex-col gap-1 bg-card">
        {isAdmin && <DropdownMenuItem asChild>
          <Link href={routes.admin.dashboard} className={buttonVariants({ variant: "ghost", size: "sm", className: "cursor-pointer" })}>
            <LayoutDashboard className="size-4" aria-hidden="true" />
            Admin Panel
          </Link>
        </DropdownMenuItem>}
        <DropdownMenuItem asChild>
          <Link href={routes.storefront.account} className={buttonVariants({ variant: "ghost", size: "sm", className: "cursor-pointer" })}>
            <User className="size-4" aria-hidden="true" />
            Account
          </Link>
        </DropdownMenuItem>
        <div className="pb-1 w-full">
          <SignOutButton
            fullWidth={true}
            variant="ghost"
            className={buttonVariants({ variant: "ghost", size: "sm", className: "cursor-pointer rounded-sm" })}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
