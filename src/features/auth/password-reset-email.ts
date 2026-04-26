import { loadServerEnv } from "@/config/env";
import { siteConfig } from "@/config/site";
import { EmailNotificationChannel } from "@/features/notifications/channels/email";
import { logger } from "@/lib/logger";

type SendPasswordResetEmailInput = {
  email: string;
  resetUrl: string;
};

let resetEmailChannel: EmailNotificationChannel | null | undefined;

function getEmailDomain(email: string) {
  const atIndex = email.lastIndexOf("@");
  return atIndex > -1 ? email.slice(atIndex + 1).toLowerCase() : undefined;
}

function getResetEmailChannel() {
  if (resetEmailChannel !== undefined) {
    return resetEmailChannel;
  }

  const serverEnv = loadServerEnv();

  if (!serverEnv.SMTP_HOST || !serverEnv.SMTP_PORT || !serverEnv.SMTP_FROM_EMAIL) {
    resetEmailChannel = null;
    return resetEmailChannel;
  }

  const channelConfig: ConstructorParameters<typeof EmailNotificationChannel>[0] = {
    host: serverEnv.SMTP_HOST,
    port: Number.parseInt(serverEnv.SMTP_PORT, 10),
    secure: ["1", "true", "yes", "on"].includes((serverEnv.SMTP_SECURE ?? "").toLowerCase()),
    fromEmail: serverEnv.SMTP_FROM_EMAIL,
  };

  if (serverEnv.SMTP_USER && serverEnv.SMTP_PASSWORD) {
    channelConfig.user = serverEnv.SMTP_USER;
    channelConfig.password = serverEnv.SMTP_PASSWORD;
  }

  if (serverEnv.SMTP_FROM_NAME) {
    channelConfig.fromName = serverEnv.SMTP_FROM_NAME;
  }

  resetEmailChannel = new EmailNotificationChannel(channelConfig);
  return resetEmailChannel;
}

export async function sendPasswordResetEmail({ email, resetUrl }: SendPasswordResetEmailInput) {
  const emailChannel = getResetEmailChannel();

  if (!emailChannel) {
    logger.warn("password-reset: SMTP is not configured; skipping reset email send", {
      emailDomain: getEmailDomain(email),
    });
    return false;
  }

  const supportEmail = siteConfig.supportEmail;
  const subject = `Reset your ${siteConfig.name} password`;
  const text = [
    "We received a request to reset the password for your account.",
    "",
    `Reset password: ${resetUrl}`,
    "",
    "This link expires in 1 hour and can only be used once.",
    "If you did not request this, you can ignore this email.",
    supportEmail ? `Need help? Contact ${supportEmail}.` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const html = [
    "<p>We received a request to reset the password for your account.</p>",
    `<p><a href=\"${resetUrl}\">Reset password</a></p>`,
    "<p>This link expires in 1 hour and can only be used once.</p>",
    "<p>If you did not request this, you can ignore this email.</p>",
    supportEmail ? `<p>Need help? Contact ${supportEmail}.</p>` : "",
  ]
    .filter(Boolean)
    .join("");

  await emailChannel.send({
    audience: "customer",
    recipient: email,
    message: {
      subject,
      text,
      html,
    },
  });

  return true;
}
