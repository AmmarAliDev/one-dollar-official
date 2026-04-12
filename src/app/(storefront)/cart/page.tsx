import { cookies } from "next/headers";
import Link from "next/link";
import { AlertTriangle, ShoppingCart } from "lucide-react";

import { auth } from "@/auth";
import { PageShell } from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PriceDisplay } from "@/components/ui/price-display";
import { SectionErrorState } from "@/components/ui/section-error-state";
import { SectionHeader } from "@/components/ui/section-header";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";
import {
  CART_COOKIE_NAME,
  getCartSummaryForContext,
  getOrCreateGuestCartToken,
  readCartTokenFromCookieValue,
  validateCartStock,
} from "@/features/cart";
import { CartItemQuantityControls } from "@/features/cart/components/cart-item-quantity-controls";

export const metadata = buildMetadata({
  title: "Cart",
  path: "/cart",
  description: "Review your selected items and get ready for checkout.",
});

export default async function CartPage() {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const guestToken = readCartTokenFromCookieValue(cookieStore.get(CART_COOKIE_NAME)?.value);
  const ensuredGuestToken = await getOrCreateGuestCartToken(guestToken);

  const cart = await getCartSummaryForContext({
    userId: session?.user?.id,
    guestToken: ensuredGuestToken,
    mergeGuestIntoUser: Boolean(session?.user?.id && guestToken),
  });

  const stockValidation = cart ? validateCartStock(cart) : { ok: true, issues: [] };

  if (!cart || cart.items.length === 0) {
    return (
      <PageShell className="items-center justify-center">
        <EmptyState
          align="center"
          className="w-full max-w-2xl"
          icon={ShoppingCart}
          eyebrow="Your bag is empty"
          title="Start adding products"
          description="Browse categories and add products to see them here. Your cart persists for guests and signed-in customers."
          action={
            <Link href={routes.storefront.categories} className={buttonVariants()}>
              Browse categories
            </Link>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Checkout"
        title="Your cart"
        description="Update quantities, remove items, and confirm stock availability before checkout."
        actions={
          <Link href={routes.storefront.categories} className={buttonVariants({ variant: "outline" })}>
            Continue shopping
          </Link>
        }
      />

      {!stockValidation.ok ? (
        <SectionErrorState
          title="Some items need attention"
          description="One or more items exceed available stock. Reduce quantity to continue to checkout."
          action={
            <div className="space-y-1 text-xs text-muted-foreground">
              {stockValidation.issues.slice(0, 3).map((issue) => (
                <p key={issue.cartItemId}>
                  {issue.productName}: requested {issue.requestedQuantity}, available {issue.availableQuantity}
                </p>
              ))}
            </div>
          }
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-3">
          {cart.items.map((item) => {
            const hasStockIssue = item.quantity > item.availableQuantity;

            return (
              <Card key={item.id}>
                <CardContent className="flex flex-col gap-4 p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <Link href={item.href} className="text-base font-semibold tracking-tight hover:text-primary">
                        {item.productName}
                      </Link>
                      <p className="text-muted-foreground text-sm">
                        SKU: {item.sku}
                        {item.optionLabel ? ` | ${item.optionLabel}` : ""}
                      </p>
                      <p className="text-muted-foreground text-xs">In stock: {item.availableQuantity}</p>
                    </div>

                    <PriceDisplay
                      amount={item.unitPrice}
                      {...(typeof item.compareAtPrice === "number" ? { compareAt: item.compareAtPrice } : {})}
                      size="sm"
                    />
                  </div>

                  {hasStockIssue ? (
                    <p className="inline-flex items-center gap-1 text-xs text-destructive">
                      <AlertTriangle className="size-3.5" aria-hidden="true" />
                      Requested quantity exceeds available stock.
                    </p>
                  ) : null}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CartItemQuantityControls
                      cartItemId={item.id}
                      productName={item.productName}
                      quantity={item.quantity}
                      availableQuantity={item.availableQuantity}
                    />

                    <PriceDisplay amount={item.lineSubtotal} size="sm" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="h-fit">
          <CardContent className="space-y-4 p-5">
            <h2 className="text-base font-semibold tracking-tight">Order summary</h2>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Items</span>
              <span>{cart.itemCount}</span>
            </div>

            <div className="flex items-center justify-between border-t border-border/70 pt-3">
              <span className="font-medium">Subtotal</span>
              <PriceDisplay amount={cart.subtotal} size="sm" />
            </div>

            {stockValidation.ok ? (
              <Link href={routes.storefront.checkout} className={buttonVariants({ size: "lg" })}>
                Proceed to checkout
              </Link>
            ) : (
              <button
                type="button"
                className={buttonVariants({ size: "lg" })}
                disabled
              >
                Proceed to checkout
              </button>
            )}

            {!stockValidation.ok ? (
              <p className="text-xs text-muted-foreground">
                Checkout is temporarily disabled until stock quantities are adjusted.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Shipping and taxes are calculated at checkout.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
