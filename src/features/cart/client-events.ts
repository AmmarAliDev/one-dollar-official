"use client";

import type { CartSummary } from "./types";

export const CART_CHANGED_EVENT = "cart:changed";

export type CartChangedDetail = {
  cart?: CartSummary | null;
};

export function dispatchCartChanged(cart?: CartSummary | null) {
  if (typeof window === "undefined") {
    return;
  }

  const eventOptions: CustomEventInit<CartChangedDetail> =
    typeof cart === "undefined"
      ? {}
      : {
          detail: { cart },
        };

  window.dispatchEvent(new CustomEvent<CartChangedDetail>(CART_CHANGED_EVENT, eventOptions));
}

export function addCartChangedListener(listener: (cart: CartSummary | null | undefined) => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = (event: Event) => {
    const customEvent = event as CustomEvent<CartChangedDetail | undefined>;
    listener(customEvent.detail?.cart);
  };

  window.addEventListener(CART_CHANGED_EVENT, handleChange as EventListener);

  return () => {
    window.removeEventListener(CART_CHANGED_EVENT, handleChange as EventListener);
  };
}
