import type { ReorderLineDecision,ResolveReorderLineDecisionInput } from "./types";

const DEFAULT_MAX_CART_ITEM_QUANTITY = 99;

export function resolveReorderLineDecision(
  input: ResolveReorderLineDecisionInput,
): ReorderLineDecision {
  const maxCartItemQuantity = input.maxCartItemQuantity ?? DEFAULT_MAX_CART_ITEM_QUANTITY;
  const requestedQuantity = Math.max(0, Math.trunc(input.requestedQuantity));
  const existingQuantity = Math.max(0, Math.trunc(input.existingQuantity));
  const availableQuantity = Math.max(0, Math.trunc(input.availableQuantity));

  const remainingStock = Math.max(0, availableQuantity - existingQuantity);
  const remainingCartCapacity = Math.max(0, maxCartItemQuantity - existingQuantity);
  const availableToAdd = Math.min(remainingStock, remainingCartCapacity);

  if (availableToAdd < 1 || requestedQuantity < 1) {
    return {
      quantityToAdd: 0,
      availableToAdd,
      reason: "OUT_OF_STOCK",
    };
  }

  const quantityToAdd = Math.min(requestedQuantity, availableToAdd);

  if (quantityToAdd < requestedQuantity) {
    return {
      quantityToAdd,
      availableToAdd,
      reason: "ADJUSTED",
    };
  }

  return {
    quantityToAdd,
    availableToAdd,
    reason: "FULL",
  };
}
