import type { CartStockIssue, CartStockValidationResult, CartSummary } from "./types";

export function validateCartStock(summary: CartSummary): CartStockValidationResult {
  const issues: CartStockIssue[] = summary.items
    .filter((item) => item.quantity > item.availableQuantity)
    .map((item) => ({
      cartItemId: item.id,
      productName: item.productName,
      sku: item.sku,
      requestedQuantity: item.quantity,
      availableQuantity: item.availableQuantity,
    }));

  return {
    ok: issues.length === 0,
    issues,
  };
}
