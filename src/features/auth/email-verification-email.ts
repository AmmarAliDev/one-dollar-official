import { loadServerEnv } from "@/config/env";
import { siteConfig } from "@/config/site";
import { EmailNotificationChannel } from "@/features/notifications/channels/email";
import { logger } from "@/lib/logger";

type SendVerificationEmailInput = {
  email: string;
  verificationUrl: string;
};

let verificationEmailChannel: EmailNotificationChannel | null | undefined;

function getEmailDomain(email: string) {
  const atIndex = email.lastIndexOf("@");
  return atIndex > -1 ? email.slice(atIndex + 1).toLowerCase() : undefined;
}

function getVerificationEmailChannel() {
  if (verificationEmailChannel !== undefined) {
    return verificationEmailChannel;
  }

  const serverEnv = loadServerEnv();

  if (!serverEnv.SMTP_HOST || !serverEnv.SMTP_PORT || !serverEnv.SMTP_FROM_EMAIL) {
    verificationEmailChannel = null;
    return verificationEmailChannel;
  }

  const parsedPort = Number.parseInt(serverEnv.SMTP_PORT, 10);
  const smtpPort = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 587;

  const channelConfig: ConstructorParameters<typeof EmailNotificationChannel>[0] = {
    host: serverEnv.SMTP_HOST,
    port: smtpPort,
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

  verificationEmailChannel = new EmailNotificationChannel(channelConfig);
  return verificationEmailChannel;
}

export async function sendEmailVerificationEmail({
  email,
  verificationUrl,
}: SendVerificationEmailInput) {
  const emailChannel = getVerificationEmailChannel();

  if (!emailChannel) {
    logger.warn("email-verification: SMTP is not configured; skipping verification email send", {
      emailDomain: getEmailDomain(email),
    });
    return false;
  }

  const supportEmail = siteConfig.supportEmail;
  const displayName = siteConfig.name;
  const subject = `Verify your ${siteConfig.name} account email`;
  const text = [
    `Welcome to ${displayName}.`,
    "",
    `Verify your email: ${verificationUrl}`,
    "",
    "This link expires in 24 hours and can only be used once.",
    "If you did not create this account, you can ignore this email.",
    supportEmail ? `Need help? Contact ${supportEmail}.` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const html = [
    `<p>Welcome to ${displayName}.</p>`,
    `<p><a href=\"${verificationUrl}\">Verify your email</a></p>`,
    "<p>This link expires in 24 hours and can only be used once.</p>",
    "<p>If you did not create this account, you can ignore this email.</p>",
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
