import type { ExternalToast } from "sonner";

export const ADD_TO_CART_TOAST_DURATION_MS = 5000;

export type AddToCartToastPayload = {
  title: string;
  description: string;
  options: ExternalToast;
};

type BuildAddToCartToastPayloadParams = {
  productName: string;
  isMobileViewport: boolean;
  onProceedToCheckout: () => void;
};

export function buildAddToCartToastPayload({
  productName,
  isMobileViewport,
  onProceedToCheckout,
}: BuildAddToCartToastPayloadParams): AddToCartToastPayload {
  const options: ExternalToast = {
    duration: ADD_TO_CART_TOAST_DURATION_MS,
  };

  if (isMobileViewport) {
    options.action = {
      label: "Proceed to Checkout",
      onClick: onProceedToCheckout,
    };
  }

  return {
    title: `${productName} added to cart`,
    description: "Cart updated.",
    options,
  };
}