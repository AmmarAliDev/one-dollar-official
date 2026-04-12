"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ShoppingBag, ShoppingCart } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { PriceDisplay } from "@/components/ui/price-display";
import { routes } from "@/config/routes";
import type { CartSummary } from "@/features/cart";
import { cn } from "@/lib/utils";

type CartApiPayload = {
  ok: boolean;
  cart: CartSummary | null;
};

async function fetchCart() {
  const response = await fetch("/api/cart", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Could not load cart preview.");
  }

  const payload = (await response.json()) as CartApiPayload;
  return payload.cart;
}

export function CartMiniCart() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cart, setCart] = useState<CartSummary | null>(null);

  async function load() {
    setPending(true);
    setErrorMessage(null);

    try {
      const nextCart = await fetchCart();
      setCart(nextCart);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not load cart preview.");
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    void load();

    function handleCartChanged() {
      void load();
    }

    window.addEventListener("cart:changed", handleCartChanged);

    return () => {
      window.removeEventListener("cart:changed", handleCartChanged);
    };
  }, []);

  const itemCount = useMemo(() => cart?.itemCount ?? 0, [cart?.itemCount]);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mini-cart-panel"
      >
        <ShoppingCart className="size-4" aria-hidden="true" />
        Cart
        <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px] leading-none">
          {itemCount}
        </span>
      </Button>

      {open ? (
        <div
          id="mini-cart-panel"
          className="border-border bg-background absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(88vw,24rem)] rounded-xl border p-4 shadow-xl"
          role="dialog"
          aria-label="Mini cart"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight">Your cart</h3>
            <Link
              href={routes.storefront.cart}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
              onClick={() => setOpen(false)}
            >
              View cart
            </Link>
          </div>

          {pending ? (
            <div className="py-6">
              <InlineSpinner label="Loading your cart" />
            </div>
          ) : null}

          {!pending && errorMessage ? (
            <div className="space-y-3 py-2">
              <p className="text-sm text-destructive">{errorMessage}</p>
              <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
                Retry
              </Button>
            </div>
          ) : null}

          {!pending && !errorMessage && (!cart || cart.items.length === 0) ? (
            <EmptyState
              title="Cart is empty"
              description="Add products from the catalog to start checkout."
              align="center"
              icon={ShoppingBag}
              action={
                <Link
                  href={routes.storefront.categories}
                  className={buttonVariants({ size: "sm" })}
                  onClick={() => setOpen(false)}
                >
                  Browse products
                </Link>
              }
            />
          ) : null}

          {!pending && !errorMessage && cart && cart.items.length > 0 ? (
            <div className="space-y-3">
              <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {cart.items.slice(0, 5).map((item) => {
                  const hasStockIssue = item.quantity > item.availableQuantity;

                  return (
                    <li key={item.id} className="border-border/70 rounded-lg border p-2.5">
                      <Link
                        href={item.href}
                        className="text-sm font-medium hover:text-primary"
                        onClick={() => setOpen(false)}
                      >
                        {item.productName}
                      </Link>
                      <p className="text-muted-foreground text-xs">
                        {item.optionLabel ? `${item.optionLabel} · ` : ""}
                        Qty {item.quantity}
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <PriceDisplay amount={item.lineSubtotal} size="sm" />
                        <span
                          className={cn(
                            "text-xs",
                            hasStockIssue ? "text-destructive" : "text-muted-foreground",
                          )}
                        >
                          {hasStockIssue ? (
                            <span className="inline-flex items-center gap-1">
                              <AlertTriangle className="size-3.5" aria-hidden="true" />
                              Stock issue
                            </span>
                          ) : (
                            `In stock: ${item.availableQuantity}`
                          )}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="border-border/70 flex items-center justify-between border-t pt-2">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <PriceDisplay amount={cart.subtotal} size="sm" />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
