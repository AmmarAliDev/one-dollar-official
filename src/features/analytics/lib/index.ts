import { AnalyticsEvent } from '../types';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
  }
}

/**
 * Normalizes GA4 items payload from internal product info.
 */
const mapToG4Items = (items: any[]) => {
  return items.map((item: any) => ({
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    item_category: item.category,
    item_brand: item.brand,
    quantity: item.quantity || 1,
  }));
};

/**
 * Normalizes Meta Pixel content payload from internal product info.
 * 
 * NOTE: Currently unused. The implementation uses the simpler content_ids approach
 * for Meta Pixel tracking, which is sufficient for standard e-commerce tracking.
 * This function is retained for potential future use if we need to leverage Meta's
 * structured 'contents' parameter for advanced tracking scenarios (e.g., dynamic ads,
 * product catalog integration) which requires the format: [{id, quantity, item_price}].
 * 
 * @see https://developers.facebook.com/docs/meta-pixel/reference#object-properties
 */
const mapToMetaContents = (items: any[]) => {
  return items.map((item: any) => ({
    id: item.id,
    quantity: item.quantity || 1,
    item_price: item.price,
  }));
};

/**
 * Track an analytics event dispatching to all configured providers (GA4, Meta).
 * Fails gracefully and silently if providers are not loaded (e.g., ad blocker, disabled).
 */
export const trackEvent = (event: AnalyticsEvent) => {
  try {
    switch (event.type) {
      case 'PAGE_VIEW':
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'page_view', {
            page_location: event.payload.url,
            page_title: event.payload.title,
          });
        }
        if (typeof window.fbq === 'function') {
          window.fbq('track', 'PageView');
        }
        break;

      case 'PRODUCT_VIEW':
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'view_item', {
            currency: event.payload.product.currency || 'PKR',
            value: event.payload.product.price,
            items: mapToG4Items([event.payload.product]),
          });
        }
        if (typeof window.fbq === 'function') {
          window.fbq('track', 'ViewContent', {
            content_type: 'product',
            content_ids: [event.payload.product.id],
            content_name: event.payload.product.name,
            value: event.payload.product.price,
            currency: event.payload.product.currency || 'PKR',
          });
        }
        break;

      case 'ADD_TO_CART':
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'add_to_cart', {
            currency: event.payload.currency || 'PKR',
            value: event.payload.value,
            items: mapToG4Items([event.payload.product]),
          });
        }
        if (typeof window.fbq === 'function') {
          window.fbq('track', 'AddToCart', {
            content_type: 'product',
            content_ids: [event.payload.product.id],
            value: event.payload.value,
            currency: event.payload.currency || 'PKR',
          });
        }
        break;
      case 'BEGIN_CHECKOUT':
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'begin_checkout', {
            currency: event.payload.currency,
            value: event.payload.value,
            items: mapToG4Items(event.payload.items),
          });
        }
        if (typeof window.fbq === 'function') {
          window.fbq('track', 'InitiateCheckout', {
            content_ids: event.payload.items.map(i => i.id),
            num_items: event.payload.items.reduce((acc, i) => acc + (i.quantity || 1), 0),
            value: event.payload.value,
            currency: event.payload.currency,
          });
        }
        break;

      case 'PURCHASE':
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'purchase', {
            transaction_id: event.payload.transactionId,
            currency: event.payload.currency,
            value: event.payload.value,
            tax: event.payload.tax,
            shipping: event.payload.shipping,
            items: mapToG4Items(event.payload.items),
          });
        }
        if (typeof window.fbq === 'function') {
          window.fbq('track', 'Purchase', {
            content_type: 'product',
            content_ids: event.payload.items.map(i => i.id),
            value: event.payload.value,
            currency: event.payload.currency,
            num_items: event.payload.items.reduce((acc, i) => acc + (i.quantity || 1), 0),
          });
        }
        break;
    }
  } catch (error) {
    // Analytics failures should never crash the app
    console.error('[Analytics] Failed to track event:', error);
  }
};
