"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";

type ProductAddToCartProps = {
  productName: string;
  isAvailable: boolean;
};

export function ProductAddToCart({ productName, isAvailable }: ProductAddToCartProps) {
  const [pending, setPending] = useState(false);

  async function handleAddToCart() {
    if (!isAvailable || pending) return;

    setPending(true);

    // Stub: simulate async cart mutation
    await new Promise<void>((resolve) => setTimeout(resolve, 600));

    notify.success(`${productName} added to cart`);
    setPending(false);
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
