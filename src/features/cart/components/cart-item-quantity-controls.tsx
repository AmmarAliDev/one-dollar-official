"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";

type CartItemQuantityControlsProps = {
  cartItemId: string;
  productName: string;
  quantity: number;
  availableQuantity: number;
};

async function updateQuantity(cartItemId: string, quantity: number) {
  const response = await fetch("/api/cart", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cartItemId,
      quantity,
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Could not update cart quantity.");
  }
}

async function removeItem(cartItemId: string) {
  const response = await fetch("/api/cart", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cartItemId,
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Could not remove cart item.");
  }
}

export function CartItemQuantityControls({
  cartItemId,
  productName,
  quantity,
  availableQuantity,
}: CartItemQuantityControlsProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const canDecrease = quantity > 1;
  const canIncrease = quantity < availableQuantity;

  async function runMutation(action: () => Promise<void>, successMessage: string) {
    if (pending) {
      return;
    }

    setPending(true);

    try {
      await action();
      window.dispatchEvent(new CustomEvent("cart:changed"));
      notify.success(successMessage, "Cart updated.");
      router.refresh();
    } catch (error) {
      notify.error("Could not update your cart", error instanceof Error ? error.message : undefined);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => runMutation(() => updateQuantity(cartItemId, quantity - 1), `${productName} quantity updated`)}
        disabled={pending || !canDecrease}
        aria-label={`Decrease quantity for ${productName}`}
      >
        <Minus className="size-4" aria-hidden="true" />
      </Button>

      <span className="min-w-10 text-center text-sm font-medium">{quantity}</span>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => runMutation(() => updateQuantity(cartItemId, quantity + 1), `${productName} quantity updated`)}
        disabled={pending || !canIncrease}
        aria-label={`Increase quantity for ${productName}`}
      >
        <Plus className="size-4" aria-hidden="true" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => runMutation(() => removeItem(cartItemId), `${productName} removed`)}
        disabled={pending}
      >
        <Trash2 className="size-4" aria-hidden="true" />
        Remove
      </Button>
    </div>
  );
}
