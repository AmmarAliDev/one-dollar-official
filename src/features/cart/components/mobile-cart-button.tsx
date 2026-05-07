"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { routes } from "@/config/routes";

import { useCartCountState } from "../cart-count-state";

export function MobileCartButton() {
  const { itemCount, pending, errorMessage } = useCartCountState();

  return (
    <Link
      href={routes.storefront.cart}
      className={`${buttonVariants({ variant: "outline", size: "icon" })} relative`}
      aria-label={`Shopping cart with ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
    >
      <ShoppingCart className="size-4" aria-hidden="true" />
      <span className="bg-background border border-border text-primary absolute -right-2 -top-2 rounded-full px-1.5 py-0.5 text-[10px] leading-none">
        <span aria-hidden="true">{itemCount}</span>
        <span className="sr-only">{`${itemCount} ${itemCount === 1 ? "item" : "items"} in cart`}</span>
      </span>
      {pending ? <span className="sr-only">Loading cart count</span> : null}
      {errorMessage ? <span className="sr-only">{errorMessage}</span> : null}
    </Link>
  );
}
