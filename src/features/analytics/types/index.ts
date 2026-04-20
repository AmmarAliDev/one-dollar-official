export interface ProductInfo {
  id: string;
  name: string;
  price: number;
  currency?: string;
  category?: string;
  brand?: string;
  quantity?: number;
}

export interface PageViewEvent {
  url: string;
  title?: string;
}

export interface ProductViewEvent {
  product: ProductInfo;
}

export interface AddToCartEvent {
  product: ProductInfo;
  value: number;
  currency: string;
}

export interface BeginCheckoutEvent {
  items: ProductInfo[];
  value: number;
  currency: string;
}

export interface PurchaseEvent {
  transactionId: string;
  items: ProductInfo[];
  /**
   * Grand total of the purchase (subtotal + tax + shipping).
   * This is the final amount paid by the customer in the specified currency.
   * For revenue reporting, this represents the total transaction value.
   */
  value: number;
  currency: string;
  /**
   * Tax amount included in the total value (optional, for detailed reporting).
   */
  tax?: number;
  /**
   * Shipping cost included in the total value (optional, for detailed reporting).
   */
  shipping?: number;
}

export type AnalyticsEvent = 
  | { type: 'PAGE_VIEW'; payload: PageViewEvent }
  | { type: 'PRODUCT_VIEW'; payload: ProductViewEvent }
  | { type: 'ADD_TO_CART'; payload: AddToCartEvent }
  | { type: 'BEGIN_CHECKOUT'; payload: BeginCheckoutEvent }
  | { type: 'PURCHASE'; payload: PurchaseEvent };
