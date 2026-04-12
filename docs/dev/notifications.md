# Notifications System

Admin and customer notifications are dispatched via **email** and **Telegram** channels. Notifications are resilient—transport failures are logged but never block order placement or status updates.

## Architecture

### Events

Notifications are triggered by these events:

- `order.new` → admin (email + Telegram) + customer (email)
- `order.confirmed` → admin (email + Telegram) + customer (email)
- `inventory.low-stock` → admin only (email + Telegram) — placeholder
- `contact.form-submitted` → admin only (email + Telegram) — placeholder

### Channels

- **Email**: SMTP-based delivery via Nodemailer; respects `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`
- **Telegram**: Bot-based live alerts to a group/supergroup; requires `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`

### Recipient Config

- Admin recipients: `NOTIFY_ADMIN_EMAILS` (comma-separated list)
- Telegram admin group: `TELEGRAM_CHAT_ID` (numeric chat ID or group public ID)

## Local Development Setup

### Option 1: Skip (Default)

Leave all notification env vars unset. The app will emit debug logs about missing channels but will not crash.

### Option 2: Use Mailtrap or Mailgun (Recommended for Testing)

1. Create a free Mailtrap account at https://mailtrap.io
2. Copy the SMTP credentials and add to `.env.local`:

```bash
NOTIFY_ADMIN_EMAILS=admin@example.com
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<your-mailtrap-inbox-username>
SMTP_PASSWORD=<your-mailtrap-inbox-password>
SMTP_FROM_EMAIL=no-reply@dev.example.com
SMTP_FROM_NAME="One Dollar Dev"
```

### Option 3: Enable Telegram Bot Alerts

1. Open Telegram and create a new supergroup (or use an existing one)
2. Add @BotFather and create a new bot with `/newbot`
3. Copy the bot token and get the group chat ID (e.g., via @userinfobot or checking logs)
4. Add to `.env.local`:

```bash
TELEGRAM_BOT_TOKEN=<your-bot-token>
TELEGRAM_CHAT_ID=<your-group-chat-id>
```

## Production Setup

### Email via AWS SES, SendGrid, or GCP SendGrid

Use a managed transactional email service:

```bash
# SendGrid example
NOTIFY_ADMIN_EMAILS=operations@store.com,finance@store.com
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=<your-sendgrid-api-key>
SMTP_FROM_EMAIL=orders@store.com
SMTP_FROM_NAME="One Dollar Store"
```

### Telegram Bot for Live Alerts

1. Create a Telegram channel or supergroup for order notifications
2. Add your bot to the group with `post_messages` permission
3. Get the group chat ID (ask @BotFather if unsure)
4. Store both in deployment secrets

## Resilience Guarantees

- Notification failures are **non-blocking**: order placement and status updates complete successfully even if email/Telegram fails
- All failures are **logged** via `createLogger("notifications.service")` with sensitive data redacted
- Failed delivery attempts are recorded in the dispatch result for observability

## Testing

### Unit Tests

```bash
pnpm test tests/features/notifications
```

Tests verify:

- Template payload builders correctly format order/event details
- Service resilience across channel success/failure scenarios
- Correct recipient routing (admin vs. customer)

### Integration Flow

1. Create an order at `/checkout`
2. Check `/api/orders/{orderNumber}` — order should be created even if notifications fail right away
3. Admin should receive email/Telegram depending on config
4. Check server logs for notification dispatch status via `[notifications.service]` prefix

## Troubleshooting

**"Channel email is not configured"**

- All SMTP variables from the `superRefine` rules are missing
- Add any two of `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM_EMAIL` to enable email (the rest default)

**"NOTIFY_ADMIN_EMAILS must contain valid email addresses"**

- Parse error in CSV format; ensure emails are comma-separated with no spaces: `admin1@example.com,admin2@example.com`

**Telegram: "Unauthorized (401)"**

- Bot token is incorrect or bot is not added to the group
- Verify token in @BotFather and check group membership

**SMTP: "Invalid credentials"**

- `SMTP_USER` and `SMTP_PASSWORD` mismatch; verify in email provider dashboard
- Some providers require app-specific passwords (e.g., Gmail App Passwords)
