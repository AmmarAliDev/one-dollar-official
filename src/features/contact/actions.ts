"use server";

import { getPrismaClient } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import { AppError } from "@/lib/errors/app-error";
import { maskEmail, stripControlChars } from "@/lib/security/pii";
import { getNotificationService } from "@/features/notifications";
import { notificationEventTypes } from "@/features/notifications/contracts";

import { contactFormSchema, type ContactFormValues } from "./validation";

const contactLogger = createLogger("contact.actions");

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
      email: typeof values.email === "string" ? maskEmail(stripControlChars(values.email)) : undefined,
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