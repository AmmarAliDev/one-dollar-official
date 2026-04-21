/**
 * Email marketing feature — public API.
 *
 * Import from this barrel; do not import directly from internal modules.
 */

export { emailSubscriberRepository } from "./repository";

export {
  getEmailCampaignProvider,
  setEmailCampaignProvider,
  resetEmailCampaignProvider,
} from "./providers/index";

export { subscribeEmail, unsubscribeByToken } from "./service";

export { subscribeInputSchema, unsubscribeTokenSchema } from "./validation";
export type { SubscribeInputValues, UnsubscribeTokenValues } from "./validation";

export type {
  EmailSubscriber,
  SubscribeInput,
  SubscribeResult,
  SubscriberStatus,
  UnsubscribeInput,
  UnsubscribeResult,
} from "./types";

export type { EmailCampaignProvider, ProviderSubscriberInput, ProviderSyncResult } from "./provider";
