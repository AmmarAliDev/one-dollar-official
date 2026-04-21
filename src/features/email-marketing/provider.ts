/**
 * EmailCampaignProvider — abstract contract for external email marketing platforms.
 *
 * The provider abstraction deliberately lives outside the notification system
 * (which handles transactional email) because marketing campaigns operate on a
 * different lifecycle: list management, segmentation, bulk scheduling, etc.
 *
 * Current default: StubEmailCampaignProvider (no-op, logs only).
 * To wire up a real provider (Mailchimp, Brevo, Klaviyo, …):
 *   1. Implement this interface in `providers/<name>.ts`.
 *   2. Update `providers/index.ts` to return your implementation when its env
 *      vars are present.
 *   3. Add required env vars to `src/config/env.ts` and `.env.example`.
 */
export interface EmailCampaignProvider {
  /** Human-readable provider name used in logs ("stub", "mailchimp", "brevo", …). */
  readonly name: string;

  /**
   * Sync a subscriber record to the provider's audience/list.
   * Must be idempotent — calling with an existing email should update the record
   * rather than error.
   */
  syncSubscriber(subscriber: ProviderSubscriberInput): Promise<ProviderSyncResult>;

  /**
   * Mark a subscriber as unsubscribed in the provider's list.
   * Called after the local unsubscribe is committed to the database.
   * Errors are logged but should not surface to the user.
   */
  syncUnsubscribe(email: string): Promise<void>;
}

export type ProviderSubscriberInput = {
  email: string;
  firstName?: string | null;
  tags?: string[];
  /** ISO 8601 timestamp of when the subscription was recorded. */
  subscribedAt: string;
};

export type ProviderSyncResult = {
  /** Provider-assigned unique identifier, if any (stored in EmailSubscriber.providerMeta). */
  providerId?: string;
  /** Any extra metadata returned by the provider (e.g. list ID, merge fields). */
  meta?: Record<string, unknown>;
};
