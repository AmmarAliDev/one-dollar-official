"use client";

import { LogOut, User } from "lucide-react";
import Link from "next/link";

import { routes } from "@/config/routes";
import { signOutAction } from "@/features/auth/actions/sign-out";

import { Button, buttonVariants } from "../ui/button";
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
      <DropdownMenuContent align="end" className="flex flex-col gap-2 bg-card">
        <DropdownMenuItem asChild>
          <Link href={routes.storefront.account} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <User className="size-4" aria-hidden="true" />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive"
            onClick={() => void signOutAction()}
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
