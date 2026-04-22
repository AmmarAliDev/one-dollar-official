"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { dispatchCartChanged } from "@/features/cart/client-events";
import type { CartSummary } from "@/features/cart/types";
import { AppError } from "@/lib/errors/app-error";
import { toUserMessage } from "@/lib/errors/error-messages";
import { notify } from "@/lib/notify";
import { testIds } from "@/lib/test-selectors";

type ProductAddToCartProps = {
  productSlug: string;
  optionId?: string | undefined;
  productName: string;
  isAvailable: boolean;
};

type CartMutationPayload = {
  cart?: CartSummary | null;
  error?: string;
};

export function ProductAddToCart({
  productSlug,
  optionId,
  productName,
  isAvailable,
}: ProductAddToCartProps) {
  const [pending, setPending] = useState(false);

  async function handleAddToCart() {
    if (!isAvailable || pending) return;

    setPending(true);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productSlug,
          ...(optionId ? { optionId } : {}),
          quantity: 1,
        }),
      });

      let payload: CartMutationPayload | null = null;

      try {
        payload = (await response.json()) as CartMutationPayload | null;
      } catch {
        if (response.ok) {
          throw new AppError("Invalid cart response.", "INTERNAL_ERROR", {
            userMessage: "Could not add item to cart right now. Please try again.",
          });
        }
      }

      if (!response.ok) {
        throw new AppError("Cart add request failed.", "INTERNAL_ERROR", {
          userMessage: payload?.error ?? "Could not add item to cart right now. Please try again.",
        });
      }

      if (!payload || typeof payload !== "object" || !Object.hasOwn(payload, "cart")) {
        throw new AppError("Invalid cart response.", "INTERNAL_ERROR", {
          userMessage: payload?.error ?? "Could not add item to cart right now. Please try again.",
        });
      }

      dispatchCartChanged(payload.cart ?? null);
      notify.success(`${productName} added to cart`, "Cart updated.");
    } catch (error) {
      notify.error("Could not add to cart", toUserMessage(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        size="lg"
        className="w-full"
        disabled={!isAvailable || pending}
        onClick={handleAddToCart}
        aria-busy={pending}
        data-testid={testIds.storefront.addToCart}
      >
        {pending ? "Adding..." : isAvailable ? "Add to Cart" : "Out of Stock"}
      </Button>

      {isAvailable ? (
        <p className="text-muted-foreground text-center text-xs">
          Free delivery on orders over PKR 1,500 in Karachi.
        </p>
      ) : (
        <p className="text-muted-foreground text-center text-xs">
          This item is currently unavailable. Check back soon.
        </p>
      )}
    </div>
  );
}
