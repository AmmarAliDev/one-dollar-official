export type CartItemSummary = {
  id: string;
  productName: string;
  productSlug: string;
  categorySlug: string;
  sku: string;
  optionLabel: string | null;
  quantity: number;
  unitPrice: number;
  compareAtPrice: number | null;
  lineSubtotal: number;
  availableQuantity: number;
  href: string;
};

export type CartSummary = {
  id: string;
  token: string;
  itemCount: number;
  subtotal: number;
  items: CartItemSummary[];
};

export type CartStockIssue = {
  cartItemId: string;
  productName: string;
  sku: string;
  requestedQuantity: number;
  availableQuantity: number;
};

export type CartStockValidationResult = {
  ok: boolean;
  issues: CartStockIssue[];
};

export type ResolveCartContextInput = {
  userId?: string | undefined;
  guestToken?: string | undefined;
  mergeGuestIntoUser?: boolean | undefined;
};

export type AddCartItemInput = {
  productSlug: string;
  optionId?: string | undefined;
  quantity?: number | undefined;
};

export type UpdateCartItemInput = {
  cartItemId: string;
  quantity: number;
};

export type RemoveCartItemInput = {
  cartItemId: string;
};
