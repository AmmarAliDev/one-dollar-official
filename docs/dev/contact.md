# Contact & Lead Capture

## Overview

The contact form allows customers to send inquiries to the store admin team. Submissions are stored in the database and trigger instant notifications via email and Telegram.

## Features

- ✅ Contact form with validation
- ✅ Database persistence (ContactSubmission model)
- ✅ Email + Telegram notifications to admin
- ✅ Success/error user feedback
- ✅ Rate limiting ready (via existing middleware)
- ✅ Anti-spam structure (length limits, future honeypot support)

## User Flow

1. Customer visits `/contact`
2. Fills in name, email, subject, and message
3. Submits form (client-side validation)
4. Server validates and saves to database
5. Admin receives email + Telegram notification
6. Customer sees success message
7. Admin can view full submissions in database

## Database Schema

```prisma
model ContactSubmission {
  id        String   @id @default(uuid())
  fullName  String   @map("full_name")
  email     String
  subject   String
  message   String
  createdAt DateTime @default(now()) @map("created_at")

  @@index([createdAt])
  @@index([email])
  @@map("contact_submission")
}
```

## API

### Server Action

```typescript
import { submitContactForm } from "@/features/contact";

const result = await submitContactForm({
  fullName: "John Doe",
  email: "john@example.com",
  subject: "Product inquiry",
  message: "I have a question about...",
});

if (result.success) {
  console.log(result.message); // "Thank you for contacting us..."
} else {
  console.error(result.error); // Error message
}
```

### Validation Schema

```typescript
import { contactFormSchema } from "@/features/contact";

// Enforces:
// - fullName: 2-100 characters
// - email: valid email format
// - subject: 3-200 characters
// - message: 10-2000 characters
```

## Components

### ContactForm

Client component that renders the contact form with validation, loading states, and success/error feedback.

```tsx
import { ContactForm } from "@/features/contact";

export default function ContactPage() {
  return <ContactForm />;
}
```

## Notifications

Contact submissions trigger the `contact.form-submitted` notification event, which sends:

- **Email to admin**: Subject includes form subject, body includes name, email, and message preview
- **Telegram to admin**: Same content formatted for chat

Notification failures are logged but don't block the submission.

See [Notifications System](./notifications.md) for configuration.

## Anti-Spam Measures

Current:
- Field length limits (prevent abuse)
- Server-side validation with Zod
- Rate limiting (via existing middleware)

Future enhancements:
- Client-side honeypot field
- reCAPTCHA or Turnstile integration
- IP-based submission throttling
- Admin dashboard to review/flag submissions

## Admin Dashboard (Future)

Currently, admins receive notifications and can query the database directly:

```sql
SELECT * FROM contact_submission ORDER BY created_at DESC LIMIT 20;
```

Future enhancements:
- Admin UI to view all submissions
- Mark as read/unread
- Reply directly from dashboard
- Archive or delete spam

## Testing

```bash
# Run contact form tests
pnpm test tests/features/contact

# Test notification delivery
pnpm test tests/features/notifications
```

## Error Handling

- **Invalid input**: Client-side validation shows field-level errors
- **Network errors**: Displays "Failed to submit" message
- **Database errors**: Logs error and shows generic user message
- **Notification failures**: Logged but submission succeeds

## Rate Limiting

Contact form submissions are subject to the existing rate limiting middleware:

- Default: 10 requests per 15 minutes per IP
- Configurable via environment variables
- See [Security Guide](./security.md) for details

## Deployment Notes

1. Run migration: `pnpm prisma migrate deploy`
2. Configure admin notification recipients (see [Notifications](./notifications.md))
3. Test form submission in staging environment
4. Monitor logs for notification failures

## Future Enhancements

- [ ] Admin dashboard for viewing submissions
- [ ] Email reply-to functionality
- [ ] File attachment support
- [ ] Auto-response email to customer
- [ ] Multi-language support
- [ ] Category/department routing
- [ ] Priority/urgency flags
- [ ] CRM integration (optional)
