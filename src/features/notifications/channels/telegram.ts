import { AppError } from "@/lib/errors/app-error";
import { createLogger } from "@/lib/logger";

import type { NotificationChannel, NotificationChannelPayload } from "../contracts";

export type TelegramNotificationChannelConfig = {
  botToken: string;
};

const telegramLogger = createLogger("notifications.telegram");

const TELEGRAM_FETCH_TIMEOUT_MS = 10_000;

function normalizeChatIds(recipient: string | string[]): string[] {
  const ids = Array.isArray(recipient) ? recipient : [recipient];
  if (Array.isArray(recipient) && recipient.length > 1) {
    telegramLogger.warn("Multiple Telegram recipients received; delivering to all", {
      count: recipient.length,
    });
  }
  return ids.filter(Boolean);
}

export class TelegramNotificationChannel implements NotificationChannel {
  readonly type = "telegram" as const;

  private readonly endpoint: string;

  constructor(config: TelegramNotificationChannelConfig) {
    this.endpoint = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
  }

  async send(payload: NotificationChannelPayload): Promise<void> {
    const chatIds = normalizeChatIds(payload.recipient);

    if (chatIds.length === 0) {
      throw new AppError(
        "Missing Telegram chat ID for notification delivery.",
        "NOTIFICATION_TELEGRAM_CHAT_MISSING",
      );
    }

    const subject = payload.message?.subject ?? "";
    const text = payload.message?.text ?? "";
    const parts = [subject, text].filter(Boolean);
    const messageText = parts.join("\n\n");

    for (const chatId of chatIds) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TELEGRAM_FETCH_TIMEOUT_MS);

      let response: Response;
      try {
        response = await fetch(this.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: messageText,
            disable_web_page_preview: true,
          }),
          signal: controller.signal,
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          throw new AppError(
            "Telegram notification request timed out.",
            "NOTIFICATION_TELEGRAM_TIMEOUT",
            { cause: err },
          );
        }
        throw err;
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        const body = await response.text();

        throw new AppError(
          "Telegram notification request failed.",
          "NOTIFICATION_TELEGRAM_FAILED",
          {
            cause: {
              status: response.status,
              body,
            },
          },
        );
      }
    }
  }
}
