export { EmailNotificationChannel } from "./channels/email";
export { TelegramNotificationChannel } from "./channels/telegram";
export type {
  ContactFormPlaceholderPayload,
  LowStockPlaceholderPayload,
  NotificationChannel,
  NotificationChannelPayload,
  NotificationChannelType,
  NotificationDelivery,
  NotificationDispatchFailure,
  NotificationDispatchResult,
  NotificationEvent,
  NotificationEventType,
  NotificationMessage,
  NotificationPlan,
  NotificationRecipients,
  OrderNotificationPayload,
} from "./contracts";
export { notificationEventTypes } from "./contracts";
export {
  createNotificationService,
  dispatchNotificationEvent,
  getNotificationService,
  notifyContactFormPlaceholder,
  notifyLowStockPlaceholder,
  notifyOrderConfirmed,
  notifyOrderPlaced,
} from "./service";
export { buildNotificationPlan } from "./templates";
