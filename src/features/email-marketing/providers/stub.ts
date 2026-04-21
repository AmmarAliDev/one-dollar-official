import { createLogger } from "@/lib/logger";

import type {
  EmailCampaignProvider,
  ProviderSubscriberInput,
  ProviderSyncResult,
} from "../provider";

const stubLogger = createLogger("email-marketing.provider.stub");

/**
 * StubEmailCampaignProvider — no-op placeholder used when no live marketing
 * integration is configured.
 *
 * All methods log at `debug` level for observability and return empty results.
 * This is safe to use in development, staging, and production until a real
 * provider is wired up in `providers/index.ts`.
 *
 * Deferred: live provider implementations (Mailchimp, Brevo, Klaviyo, etc.).
 * See the `EmailCampaignProvider` interface for the contract each adapter must satisfy.
 */
export class StubEmailCampaignProvider implements EmailCampaignProvider {
  readonly name = "stub";

  async syncSubscriber(subscriber: ProviderSubscriberInput): Promise<ProviderSyncResult> {
    stubLogger.debug("syncSubscriber called (no-op)", { email: subscriber.email });
    return {};
  }

  async syncUnsubscribe(email: string): Promise<void> {
    stubLogger.debug("syncUnsubscribe called (no-op)", { email });
  }
}
