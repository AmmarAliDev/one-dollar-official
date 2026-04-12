"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";

type ProductAddToCartProps = {
  productSlug: string;
  optionId?: string | undefined;
  productName: string;
  isAvailable: boolean;
};

export function ProductAddToCart({ productSlug, optionId, productName, isAvailable }: ProductAddToCartProps) {
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

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Could not add item to cart.");
      }

      window.dispatchEvent(new CustomEvent("cart:changed"));
      notify.success(`${productName} added to cart`, "Cart updated.");
    } catch (error) {
      notify.error("Could not add to cart", error instanceof Error ? error.message : undefined);
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
      >
        {pending ? "Adding..." : isAvailable ? "Add to Cart" : "Out of Stock"}
      </Button>

      {isAvailable ? (
        <p className="text-muted-foreground text-center text-xs">Free delivery on orders over PKR 1,500 in Karachi.</p>
      ) : (
        <p className="text-muted-foreground text-center text-xs">
          This item is currently unavailable. Check back soon.
        </p>
      )}
    </div>
  );
}
