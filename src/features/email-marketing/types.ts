/**
 * Email marketing types.
 *
 * These types mirror the Prisma `EmailSubscriber` model and the surrounding
 * service contract. The `SubscriberStatus` enum intentionally re-declares the
 * Prisma-generated version so domain code doesn't have a hard import dependency
 * on `@prisma/client` everywhere.
 */

/** Mirrors the Prisma `SubscriberStatus` enum. */
export type SubscriberStatus = "PENDING" | "ACTIVE" | "UNSUBSCRIBED" | "BOUNCED";

/** Domain representation of a subscriber row. */
export type EmailSubscriber = {
  id: string;
  email: string;
  firstName: string | null;
  /** Where the subscriber was captured — e.g. "checkout", "newsletter_popup". */
  source: string;
  status: SubscriberStatus;
  tags: string[];
  unsubscribeToken: string;
  confirmedAt: Date | null;
  unsubscribedAt: Date | null;
  /** Raw provider metadata (Mailchimp ID, Brevo ID, etc.). */
  providerMeta: unknown;
  createdAt: Date;
  updatedAt: Date;
};

/** Input for the subscribe operation. */
export type SubscribeInput = {
  email: string;
  firstName?: string | undefined;
  /**
   * Where the subscriber was captured.
   * Known values: "checkout", "newsletter_popup", "account_signup", "order_completion".
   * The field is intentionally a plain string to avoid an enum that requires schema
   * changes every time a new capture source is added.
   */
  source: string;
  /** Optional segmentation tags, e.g. ["newsletter", "restock_alerts"]. */
  tags?: string[] | undefined;
};

/** Input for the unsubscribe operation. */
export type UnsubscribeInput = {
  /** Opaque token from the subscriber's unsubscribe link. */
  token: string;
};

/** Result returned by the subscribe service method. */
export type SubscribeResult =
  | {
      success: true;
      subscriber: EmailSubscriber;
      /** True when the email was already in the list (PENDING or ACTIVE). */
      alreadySubscribed: boolean;
    }
  | { success: false; error: string };

/** Result returned by the unsubscribe service method. */
export type UnsubscribeResult =
  | { success: true }
  | { success: false; reason: "invalid" | "error"; error: string };
