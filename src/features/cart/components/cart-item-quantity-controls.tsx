"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { dispatchCartChanged } from "@/features/cart/client-events";
import type { CartSummary } from "@/features/cart/types";
import { AppError } from "@/lib/errors/app-error";
import { toUserMessage } from "@/lib/errors/error-messages";
import { notify } from "@/lib/notify";

type CartItemQuantityControlsProps = {
  cartItemId: string;
  productName: string;
  quantity: number;
  availableQuantity: number;
};

type CartMutationPayload = {
  cart?: CartSummary | null;
  error?: string;
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

  const payload = (await response.json().catch(() => null)) as CartMutationPayload | null;

  if (!response.ok) {
    throw new AppError("Cart quantity request failed.", "INTERNAL_ERROR", {
      userMessage: payload?.error ?? "Could not update cart quantity right now. Please try again.",
    });
  }

  return payload?.cart ?? null;
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

  const payload = (await response.json().catch(() => null)) as CartMutationPayload | null;

  if (!response.ok) {
    throw new AppError("Cart remove request failed.", "INTERNAL_ERROR", {
      userMessage: payload?.error ?? "Could not remove this item right now. Please try again.",
    });
  }

  return payload?.cart ?? null;
}

export function CartItemQuantityControls({
  cartItemId,
  productName,
  quantity,
  availableQuantity,
}: CartItemQuantityControlsProps) {
  const [pending, setPending] = useState(false);
  const [displayQuantity, setDisplayQuantity] = useState(quantity);

  useEffect(() => {
    setDisplayQuantity(quantity);
  }, [quantity]);

  const canDecrease = displayQuantity > 1;
  const canIncrease = displayQuantity < availableQuantity;

  async function runMutation(
    action: () => Promise<CartSummary | null>,
    successMessage: string,
    optimisticQuantity: number,
  ) {
    if (pending) {
      return;
    }

    const previousQuantity = displayQuantity;
    setPending(true);
    setDisplayQuantity(Math.max(0, optimisticQuantity));

    try {
      const cart = await action();
      const nextQuantity = cart?.items.find((item) => item.id === cartItemId)?.quantity ?? 0;

      dispatchCartChanged(cart);
      setDisplayQuantity(nextQuantity);
      notify.success(successMessage, "Cart updated.");
    } catch (error) {
      setDisplayQuantity(previousQuantity);
      notify.error("Could not update your cart", toUserMessage(error));
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
        onClick={() =>
          runMutation(() => updateQuantity(cartItemId, displayQuantity - 1), `${productName} quantity updated`, displayQuantity - 1)
        }
        disabled={pending || !canDecrease}
        aria-label={`Decrease quantity for ${productName}`}
      >
        <Minus className="size-4" aria-hidden="true" />
      </Button>

      <span className="min-w-10 text-center text-sm font-medium">{displayQuantity}</span>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() =>
          runMutation(() => updateQuantity(cartItemId, displayQuantity + 1), `${productName} quantity updated`, displayQuantity + 1)
        }
        disabled={pending || !canIncrease}
        aria-label={`Increase quantity for ${productName}`}
      >
        <Plus className="size-4" aria-hidden="true" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => runMutation(() => removeItem(cartItemId), `${productName} removed`, 0)}
        disabled={pending}
        aria-label={`Remove ${productName} from cart`}
      >
        <Trash2 className="size-4" aria-hidden="true" />
        Remove
      </Button>
    </div>
  );
}
