import { z } from "zod";

/**
 * Contact form validation schema
 *
 * Enforces:
 * - Full name (2-100 characters)
 * - Valid email address
 * - Subject (3-200 characters)
 * - Message (10-2000 characters)
 *
 * Anti-spam measures:
 * - Reasonable length limits to prevent abuse
 * - Server-side rate limiting applied separately
 * - Client-side honeypot field can be added in form component
 */
export const contactFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter at least 2 characters.")
    .max(100, "Name cannot exceed 100 characters."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(254, "Email cannot exceed 254 characters."),
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters.")
    .max(200, "Subject cannot exceed 200 characters."),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters.")
    .max(2000, "Message cannot exceed 2000 characters."),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
