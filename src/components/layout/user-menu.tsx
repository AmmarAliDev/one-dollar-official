"use client";

import Link from "next/link";
import { User } from "lucide-react";

import { routes } from "@/config/routes";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

import { buttonVariants } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

const UserMenu = ({ isSignedIn }: { isSignedIn: boolean }) => {
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
          Profile
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex min-w-40 flex-col gap-1 bg-card">
        <DropdownMenuItem asChild>
          <Link href={routes.storefront.account} className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <User className="size-4" aria-hidden="true" />
            Account
          </Link>
        </DropdownMenuItem>
        <div className="px-1 pb-1">
          <SignOutButton
            variant="ghost"
            size="sm"
            fullWidth
            className="justify-start text-destructive hover:text-destructive"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
