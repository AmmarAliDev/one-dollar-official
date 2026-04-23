/**
 * Email campaign provider factory.
 *
 * Returns a live provider when the relevant environment variables are present,
 * otherwise falls back to StubEmailCampaignProvider.
 *
 * EXTENDING:
 *   1. Add env vars for the new provider to `src/config/env.ts`.
 *   2. Implement `EmailCampaignProvider` in `providers/<name>.ts`.
 *   3. Add a branch below that detects the new env vars and returns your adapter.
 *
 * Example (Mailchimp, deferred):
 *   if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_LIST_ID) {
 *     return new MailchimpProvider({ apiKey: ..., listId: ... });
 *   }
 */

import type { EmailCampaignProvider } from "../provider";
import { StubEmailCampaignProvider } from "./stub";

let _provider: EmailCampaignProvider | undefined;

/**
 * Returns the singleton email campaign provider.
 * Call this from service code — do not instantiate providers directly.
 */
export function getEmailCampaignProvider(): EmailCampaignProvider {
  if (_provider) {
    return _provider;
  }

  // Future: check env vars here and return a live provider.
  // For now, always use the no-op stub.
  _provider = new StubEmailCampaignProvider();
  return _provider;
}

/**
 * Override the provider singleton — used in tests to inject a mock.
 */
export function setEmailCampaignProvider(provider: EmailCampaignProvider): void {
  _provider = provider;
}

/**
 * Reset the provider singleton — used in tests after injection.
 */
export function resetEmailCampaignProvider(): void {
  _provider = undefined;
}
