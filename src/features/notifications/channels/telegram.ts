import { AppError } from "@/lib/errors/app-error";

import type { NotificationChannel, NotificationChannelPayload } from "../contracts";

export type TelegramNotificationChannelConfig = {
  botToken: string;
};

function normalizeRecipient(recipient: string | string[]) {
  if (Array.isArray(recipient)) {
    return recipient[0] ?? "";
  }

  return recipient;
}

export class TelegramNotificationChannel implements NotificationChannel {
  readonly type = "telegram" as const;

  private readonly endpoint: string;

  constructor(config: TelegramNotificationChannelConfig) {
    this.endpoint = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
  }

  async send(payload: NotificationChannelPayload): Promise<void> {
    const chatId = normalizeRecipient(payload.recipient);

    if (!chatId) {
      throw new AppError(
        "Missing Telegram chat ID for notification delivery.",
        "NOTIFICATION_TELEGRAM_CHAT_MISSING",
      );
    }

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: `${payload.message.subject}\n\n${payload.message.text}`,
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      const body = await response.text();

      throw new AppError("Telegram notification request failed.", "NOTIFICATION_TELEGRAM_FAILED", {
        cause: {
          status: response.status,
          body,
        },
      });
    }
  }
}
