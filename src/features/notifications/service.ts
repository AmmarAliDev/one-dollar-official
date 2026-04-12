import { loadServerEnv } from "@/config/env";
import { createLogger, sanitizeForLogging } from "@/lib/logger";

import { EmailNotificationChannel } from "./channels/email";
import { TelegramNotificationChannel } from "./channels/telegram";
import type {
  ContactFormPlaceholderPayload,
  LowStockPlaceholderPayload,
  NotificationChannel,
  NotificationDispatchFailure,
  NotificationDispatchResult,
  NotificationEvent,
  NotificationRecipients,
  OrderNotificationPayload,
} from "./contracts";
import { notificationEventTypes } from "./contracts";
import { buildNotificationPlan } from "./templates";

const notificationsLogger = createLogger("notifications.service");

type NotificationServiceConfig = {
  recipients: NotificationRecipients;
  channels: NotificationChannel[];
};

function parseCsv(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function parseBoolean(value: string | undefined, fallback = false) {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function parseInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export class NotificationService {
  private readonly channelsByType: Map<NotificationChannel["type"], NotificationChannel>;
  private readonly recipients: NotificationRecipients;

  constructor(config: NotificationServiceConfig) {
    this.channelsByType = new Map(config.channels.map((channel) => [channel.type, channel]));
    this.recipients = config.recipients;
  }

  async dispatch(event: NotificationEvent): Promise<NotificationDispatchResult> {
    try {
      const plan = buildNotificationPlan(event, this.recipients);
      const failures: NotificationDispatchFailure[] = [];
      let delivered = 0;

      for (const delivery of plan.deliveries) {
        const channel = this.channelsByType.get(delivery.channel);

        if (!channel) {
          failures.push({
            eventType: plan.eventType,
            channel: delivery.channel,
            audience: delivery.audience,
            recipient: delivery.recipient,
            reason: `Channel ${delivery.channel} is not configured.`,
          });
          continue;
        }

        try {
          await channel.send({
            audience: delivery.audience,
            recipient: delivery.recipient,
            message: delivery.message,
          });
          delivered += 1;
        } catch (error) {
          failures.push({
            eventType: plan.eventType,
            channel: delivery.channel,
            audience: delivery.audience,
            recipient: delivery.recipient,
            reason: error instanceof Error ? error.message : "Unknown notification error",
          });

          notificationsLogger.error("notification delivery failed", {
            eventType: plan.eventType,
            channel: delivery.channel,
            audience: delivery.audience,
            recipient: delivery.recipient,
            error: sanitizeForLogging(error),
          });
        }
      }

      return {
        eventType: plan.eventType,
        attempted: plan.deliveries.length,
        delivered,
        failures,
      };
    } catch (error) {
      notificationsLogger.error("notification dispatch crashed", {
        eventType: event.type,
        error: sanitizeForLogging(error),
      });

      return {
        eventType: event.type,
        attempted: 0,
        delivered: 0,
        failures: [],
      };
    }
  }
}

export function createNotificationService(config: NotificationServiceConfig) {
  return new NotificationService(config);
}

function createDefaultNotificationService() {
  const serverEnv = loadServerEnv();
  const recipients: NotificationRecipients = {
    adminEmails: parseCsv(serverEnv.NOTIFY_ADMIN_EMAILS),
    ...(serverEnv.TELEGRAM_CHAT_ID ? { telegramChatId: serverEnv.TELEGRAM_CHAT_ID } : {}),
  };

  const channels: NotificationChannel[] = [];

  if (serverEnv.SMTP_HOST && serverEnv.SMTP_FROM_EMAIL) {
    const emailConfig: ConstructorParameters<typeof EmailNotificationChannel>[0] = {
      host: serverEnv.SMTP_HOST,
      port: parseInteger(serverEnv.SMTP_PORT, 587),
      secure: parseBoolean(serverEnv.SMTP_SECURE, false),
      fromEmail: serverEnv.SMTP_FROM_EMAIL,
    };

    if (serverEnv.SMTP_USER) {
      emailConfig.user = serverEnv.SMTP_USER;
    }

    if (serverEnv.SMTP_PASSWORD) {
      emailConfig.password = serverEnv.SMTP_PASSWORD;
    }

    if (serverEnv.SMTP_FROM_NAME) {
      emailConfig.fromName = serverEnv.SMTP_FROM_NAME;
    }

    channels.push(new EmailNotificationChannel(emailConfig));
  }

  if (serverEnv.TELEGRAM_BOT_TOKEN) {
    channels.push(
      new TelegramNotificationChannel({
        botToken: serverEnv.TELEGRAM_BOT_TOKEN,
      }),
    );
  }

  return createNotificationService({
    recipients,
    channels,
  });
}

let defaultNotificationService: NotificationService | null = null;

export function getNotificationService() {
  if (!defaultNotificationService) {
    defaultNotificationService = createDefaultNotificationService();
  }

  return defaultNotificationService;
}

export async function dispatchNotificationEvent(event: NotificationEvent) {
  return getNotificationService().dispatch(event);
}

export async function notifyOrderPlaced(payload: OrderNotificationPayload) {
  return dispatchNotificationEvent({
    type: notificationEventTypes.orderNew,
    payload,
  });
}

export async function notifyOrderConfirmed(payload: OrderNotificationPayload) {
  return dispatchNotificationEvent({
    type: notificationEventTypes.orderConfirmed,
    payload,
  });
}

export async function notifyLowStockPlaceholder(payload: LowStockPlaceholderPayload) {
  return dispatchNotificationEvent({
    type: notificationEventTypes.inventoryLowStock,
    payload,
  });
}

export async function notifyContactFormPlaceholder(payload: ContactFormPlaceholderPayload) {
  return dispatchNotificationEvent({
    type: notificationEventTypes.contactFormSubmitted,
    payload,
  });
}
