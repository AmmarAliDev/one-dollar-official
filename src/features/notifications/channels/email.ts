import nodemailer from "nodemailer";

import type { NotificationChannel, NotificationChannelPayload } from "../contracts";

export type EmailNotificationChannelConfig = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  password?: string;
  fromEmail: string;
  fromName?: string;
};

function normalizeRecipients(recipient: string | string[]) {
  return Array.isArray(recipient) ? recipient.join(",") : recipient;
}

export class EmailNotificationChannel implements NotificationChannel {
  readonly type = "email" as const;

  private readonly transport: nodemailer.Transporter;
  private readonly from: string;

  constructor(config: EmailNotificationChannelConfig) {
    this.transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      ...(config.user && config.password
        ? {
            auth: {
              user: config.user,
              pass: config.password,
            },
          }
        : {}),
    });

    const rawName = config.fromName?.replace(/[\r\n<>]+/g, "").trim() ?? "";
    this.from = rawName ? `${rawName} <${config.fromEmail}>` : config.fromEmail;
  }

  async send(payload: NotificationChannelPayload): Promise<void> {
    await this.transport.sendMail({
      from: this.from,
      to: normalizeRecipients(payload.recipient),
      subject: payload.message.subject,
      text: payload.message.text,
      ...(payload.message.html ? { html: payload.message.html } : {}),
    });
  }
}
