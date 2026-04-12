export const notificationEventTypes = {
  orderNew: "order.new",
  orderConfirmed: "order.confirmed",
  inventoryLowStock: "inventory.low-stock",
  contactFormSubmitted: "contact.form-submitted",
} as const;

export type NotificationEventType =
  (typeof notificationEventTypes)[keyof typeof notificationEventTypes];

export type OrderNotificationPayload = {
  orderId: string;
  orderNumber: string;
  placedAt: Date;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethodLabel: string;
  confirmationUrl: string;
  invoiceUrl: string;
};

export type LowStockPlaceholderPayload = {
  sku: string;
  productName?: string;
  availableQuantity: number;
  threshold: number;
};

export type ContactFormPlaceholderPayload = {
  fullName: string;
  email: string;
  subject: string;
  messagePreview: string;
};

export type NotificationEvent =
  | {
      type: typeof notificationEventTypes.orderNew;
      payload: OrderNotificationPayload;
    }
  | {
      type: typeof notificationEventTypes.orderConfirmed;
      payload: OrderNotificationPayload;
    }
  | {
      type: typeof notificationEventTypes.inventoryLowStock;
      payload: LowStockPlaceholderPayload;
    }
  | {
      type: typeof notificationEventTypes.contactFormSubmitted;
      payload: ContactFormPlaceholderPayload;
    };

export type NotificationChannelType = "email" | "telegram";
export type NotificationAudience = "admin" | "customer";

export type NotificationMessage = {
  subject: string;
  text: string;
  html?: string;
};

export type NotificationDelivery = {
  channel: NotificationChannelType;
  audience: NotificationAudience;
  recipient: string | string[];
  message: NotificationMessage;
};

export type NotificationPlan = {
  eventType: NotificationEventType;
  deliveries: NotificationDelivery[];
};

export type NotificationChannelPayload = {
  recipient: string | string[];
  message: NotificationMessage;
  audience: NotificationAudience;
};

export interface NotificationChannel {
  readonly type: NotificationChannelType;
  send(payload: NotificationChannelPayload): Promise<void>;
}

export type NotificationDispatchFailure = {
  eventType: NotificationEventType;
  channel: NotificationChannelType;
  audience: NotificationAudience;
  recipient: string | string[];
  reason: string;
};

export type NotificationDispatchResult = {
  eventType: NotificationEventType;
  attempted: number;
  delivered: number;
  failures: NotificationDispatchFailure[];
};

export type NotificationRecipients = {
  adminEmails: string[];
  telegramChatId?: string;
};
