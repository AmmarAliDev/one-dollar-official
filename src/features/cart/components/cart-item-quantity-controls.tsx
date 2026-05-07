"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const MAX_CART_ITEM_QUANTITY = 99;

function getEffectiveAllowedMax(availableQuantity: number) {
  return Math.max(1, Math.min(MAX_CART_ITEM_QUANTITY, Math.trunc(availableQuantity)));
}

function getQuantityRangeMessage(max: number) {
  return `Please enter a quantity between 1 and ${max}.`;
}

function parseWholeQuantity(value: string) {
  const trimmed = value.trim();

  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  return Number.parseInt(trimmed, 10);
}

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
  const effectiveAllowedMax = getEffectiveAllowedMax(availableQuantity);
  const [pending, setPending] = useState(false);
  const [displayQuantity, setDisplayQuantity] = useState(quantity);
  const [inputValue, setInputValue] = useState(String(quantity));
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    setDisplayQuantity(quantity);
    setInputValue(String(quantity));
    setValidationMessage(null);
  }, [quantity]);

  const canDecrease = displayQuantity > 1;
  const canIncrease = displayQuantity < effectiveAllowedMax;

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
      setInputValue(String(nextQuantity));
      notify.success(successMessage, "Cart updated.");
    } catch (error) {
      setDisplayQuantity(previousQuantity);
      setInputValue(String(previousQuantity));
      notify.error("Could not update your cart", toUserMessage(error));
    } finally {
      setPending(false);
    }
  }

  /**
   * Validate and commit a direct quantity input.
   * Validates whole number, min 1, max effectiveAllowedMax.
   * Does not trigger mutation if invalid or unchanged.
   */
  async function commitDirectInput() {
    const parsed = parseWholeQuantity(inputValue);
    if (parsed === null) {
      setValidationMessage(getQuantityRangeMessage(effectiveAllowedMax));
      return;
    }

    if (parsed < 1 || parsed > effectiveAllowedMax) {
      setValidationMessage(getQuantityRangeMessage(effectiveAllowedMax));
      return;
    }

    // Revert to current display if no change
    if (parsed === displayQuantity) {
      setInputValue(String(displayQuantity));
      setValidationMessage(null);
      return;
    }

    setValidationMessage(null);

    // Commit the change via mutation
    await runMutation(
      () => updateQuantity(cartItemId, parsed),
      `${productName} quantity updated`,
      parsed,
    );
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = e.target.value;
    setInputValue(nextValue);

    const parsed = parseWholeQuantity(nextValue);

    if (nextValue.trim().length === 0) {
      setValidationMessage(null);
      return;
    }

    if (parsed === null || parsed < 1 || parsed > effectiveAllowedMax) {
      setValidationMessage(getQuantityRangeMessage(effectiveAllowedMax));
      return;
    }

    setValidationMessage(null);
  }

  function handleInputBlur() {
    void commitDirectInput();
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void commitDirectInput();
      // Blur to clear focus after successful commit
      (e.currentTarget as HTMLInputElement).blur();
    }
  }

  const validationMessageId = `${cartItemId}-quantity-validation`;

  return (
    <div className="flex items-start gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() =>
          runMutation(
            () => updateQuantity(cartItemId, displayQuantity - 1),
            `${productName} quantity updated`,
            displayQuantity - 1,
          )
        }
        disabled={pending || !canDecrease}
        aria-label={`Decrease quantity for ${productName}`}
      >
        <Minus className="size-4" aria-hidden="true" />
      </Button>

      <div className="space-y-1">
        <Input
          type="number"
          min="1"
          max={effectiveAllowedMax}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          disabled={pending}
          aria-invalid={Boolean(validationMessage)}
          aria-describedby={validationMessage ? validationMessageId : undefined}
          aria-label={`Quantity for ${productName}. Minimum 1, maximum ${effectiveAllowedMax}`}
          className="min-w-10 text-center text-sm font-medium"
        />

        {validationMessage ? (
          <p id={validationMessageId} className="text-destructive max-w-56 text-xs" role="alert">
            {validationMessage}
          </p>
        ) : null}
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() =>
          runMutation(
            () => updateQuantity(cartItemId, displayQuantity + 1),
            `${productName} quantity updated`,
            displayQuantity + 1,
          )
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
