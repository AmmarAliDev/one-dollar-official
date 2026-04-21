"use server";

import { getPrismaClient } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import { AppError } from "@/lib/errors/app-error";
import { getNotificationService } from "@/features/notifications";
import { notificationEventTypes } from "@/features/notifications/contracts";

import { contactFormSchema, type ContactFormValues } from "./validation";

const contactLogger = createLogger("contact.actions");

/**
 * Mask email for logging to protect PII
 * Converts "user@example.com" to "u***@example.com"
 */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***@***";
  const masked = local[0] + "***";
  return `${masked}@${domain}`;
}

/**
 * Sanitize email for logging to prevent log injection
 * Removes control characters (CR, LF, etc.)
 */
function sanitizeEmail(email: unknown): string | undefined {
  if (typeof email !== "string") return undefined;
  // Remove all control characters (0x00-0x1F and 0x7F-0x9F)
  return email.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
}

export type ContactFormResult =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * Submit contact form and send notifications
 *
 * Flow:
 * 1. Validate input
 * 2. Save to database
 * 3. Send email + Telegram notifications to admin
 * 4. Return success/error
 *
 * Notifications are non-blocking - submission succeeds even if delivery fails
 */
export async function submitContactForm(
  values: ContactFormValues,
): Promise<ContactFormResult> {
  const db = getPrismaClient();
  const notificationService = getNotificationService();

  try {
    // Validate input
    const validated = contactFormSchema.parse(values);

    contactLogger.info("contact form submission started", {
      email: maskEmail(validated.email),
      subject: validated.subject,
    });

    // Save to database
    const submission = await db.contactSubmission.create({
      data: {
        fullName: validated.fullName,
        email: validated.email,
        subject: validated.subject,
        message: validated.message,
      },
    });

    contactLogger.info("contact submission saved", {
      id: submission.id,
      email: maskEmail(validated.email),
    });

    // Send notifications (non-blocking)
    try {
      const notificationResult = await notificationService.dispatch({
        type: notificationEventTypes.contactFormSubmitted,
        payload: {
          fullName: validated.fullName,
          email: validated.email,
          subject: validated.subject,
          messagePreview: validated.message.substring(0, 150),
        },
      });

      if (notificationResult.failures.length > 0) {
        contactLogger.warn("some contact notifications failed", {
          submissionId: submission.id,
          failures: notificationResult.failures,
        });
      }
    } catch (notificationError) {
      // Log but don't fail the submission
      contactLogger.error("contact notification dispatch failed", {
        submissionId: submission.id,
        error: notificationError,
      });
    }

    return {
      success: true,
      message: "Thank you for contacting us. We'll respond within 1-2 business days.",
    };
  } catch (error) {
    contactLogger.error("contact form submission failed", {
      error,
      email: sanitizeEmail(values.email),
    });

    if (error instanceof AppError) {
      return {
        success: false,
        error: error.userMessage ?? "An unknown error occurred",
      };
    }

    return {
      success: false,
      error: "Failed to submit your message. Please try again.",
    };
  }
}