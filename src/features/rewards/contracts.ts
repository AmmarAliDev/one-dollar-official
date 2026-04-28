import { z } from "zod";

export const rewardsErrorCodes = {
  invalidInput: "REWARDS_INVALID_INPUT",
  serviceUnavailable: "REWARDS_SERVICE_UNAVAILABLE",
  conflict: "REWARDS_CONFLICT",
  notFound: "REWARDS_NOT_FOUND",
} as const;

export type RewardsErrorCode = (typeof rewardsErrorCodes)[keyof typeof rewardsErrorCodes];

export type RewardsServiceError = {
  code: RewardsErrorCode;
  message: string;
  userMessage: string;
  cause?: unknown;
};

export type RewardsServiceResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: RewardsServiceError;
    };

export function rewardsOk<T>(data: T): RewardsServiceResult<T> {
  return { ok: true, data };
}

export function rewardsFail(options: {
  code: RewardsErrorCode;
  message: string;
  userMessage: string;
  cause?: unknown;
}): RewardsServiceResult<never> {
  return {
    ok: false,
    error: {
      code: options.code,
      message: options.message,
      userMessage: options.userMessage,
      cause: options.cause,
    },
  };
}

export type RewardsReadState = "ready" | "empty";

export type RewardsPaging = {
  cursor?: string;
  limit?: number;
};

export const referralVisitInputSchema = z.object({
  referralCode: z.string().trim().min(3).max(64),
  visitorSessionId: z.string().trim().min(6).max(128),
  landingPath: z.string().trim().min(1).max(512),
  campaign: z.string().trim().max(64).optional(),
  occurredAt: z.date().optional(),
  userId: z.string().trim().uuid().optional(),
});

export type ReferralVisitInput = z.infer<typeof referralVisitInputSchema>;

export const referralConversionInputSchema = z.object({
  referralCode: z.string().trim().min(3).max(64),
  orderId: z.string().trim().uuid(),
  orderNumber: z.string().trim().min(4).max(64),
  orderTotalMinor: z.number().int().nonnegative(),
  occurredAt: z.date().optional(),
  customerUserId: z.string().trim().uuid().optional(),
});

export type ReferralConversionInput = z.infer<typeof referralConversionInputSchema>;

export type ReferralVisitRecord = {
  id: string;
  referralCode: string;
  visitorSessionId: string;
  landingPath: string;
  campaign?: string;
  occurredAt: Date;
  userId?: string;
};

export type ReferralConversionRecord = {
  id: string;
  referralCode: string;
  orderId: string;
  orderNumber: string;
  orderTotalMinor: number;
  occurredAt: Date;
  customerUserId?: string;
};

export type ReferralProgramSummary = {
  state: RewardsReadState;
  totalVisits: number;
  totalConversions: number;
  conversionRate: number;
  attributedRevenueMinor: number;
};

export interface ReferralTrackingService {
  trackVisit(input: ReferralVisitInput): Promise<RewardsServiceResult<ReferralVisitRecord>>;
  trackConversion(input: ReferralConversionInput): Promise<RewardsServiceResult<ReferralConversionRecord>>;
  getSummary(referralCode: string): Promise<RewardsServiceResult<ReferralProgramSummary>>;
}

export const loyaltyPointsMutationInputSchema = z.object({
  userId: z.string().trim().uuid(),
  points: z.number().int().positive(),
  reason: z.string().trim().min(3).max(140),
  reference: z.string().trim().min(3).max(120),
  occurredAt: z.date().optional(),
});

export type LoyaltyPointsMutationInput = z.infer<typeof loyaltyPointsMutationInputSchema>;

export type LoyaltyPointsBalance = {
  userId: string;
  pointsAvailable: number;
  updatedAt: Date;
};

export type LoyaltyPointsTransaction = {
  id: string;
  userId: string;
  points: number;
  reason: string;
  reference: string;
  occurredAt: Date;
};

export type LoyaltyPointsPage = {
  state: RewardsReadState;
  items: LoyaltyPointsTransaction[];
  nextCursor: string | null;
};

export interface LoyaltyPointsService {
  award(input: LoyaltyPointsMutationInput): Promise<RewardsServiceResult<LoyaltyPointsTransaction>>;
  redeem(input: LoyaltyPointsMutationInput): Promise<RewardsServiceResult<LoyaltyPointsTransaction>>;
  getBalance(userId: string): Promise<RewardsServiceResult<LoyaltyPointsBalance>>;
  listTransactions(
    userId: string,
    paging?: RewardsPaging,
  ): Promise<RewardsServiceResult<LoyaltyPointsPage>>;
}

export const walletLedgerEntryInputSchema = z.object({
  walletId: z.string().trim().uuid(),
  userId: z.string().trim().uuid(),
  direction: z.enum(["credit", "debit"]),
  amountMinor: z.number().int().positive(),
  currency: z.literal("PKR"),
  source: z.string().trim().min(3).max(80),
  reference: z.string().trim().min(3).max(120),
  note: z.string().trim().max(280).optional(),
  occurredAt: z.date().optional(),
});

export type WalletLedgerEntryInput = z.infer<typeof walletLedgerEntryInputSchema>;

export type WalletLedgerEntry = {
  id: string;
  walletId: string;
  userId: string;
  direction: "credit" | "debit";
  amountMinor: number;
  currency: "PKR";
  source: string;
  reference: string;
  note?: string;
  occurredAt: Date;
};

export type WalletBalance = {
  walletId: string;
  userId: string;
  currency: "PKR";
  availableMinor: number;
  holdMinor: number;
  updatedAt: Date;
};

export type WalletLedgerPage = {
  state: RewardsReadState;
  items: WalletLedgerEntry[];
  nextCursor: string | null;
};

export interface WalletLedgerService {
  appendEntry(input: WalletLedgerEntryInput): Promise<RewardsServiceResult<WalletLedgerEntry>>;
  getBalance(walletId: string): Promise<RewardsServiceResult<WalletBalance>>;
  listEntries(walletId: string, paging?: RewardsPaging): Promise<RewardsServiceResult<WalletLedgerPage>>;
}

type ParseSchema<T> = {
  safeParse: (input: unknown) => { success: true; data: T } | { success: false; error: z.ZodError<T> };
};

function parseContractInput<T>(schema: ParseSchema<T>, input: unknown, contractName: string): RewardsServiceResult<T> {
  const parsed = schema.safeParse(input);

  if (parsed.success) {
    return rewardsOk(parsed.data);
  }

  return rewardsFail({
    code: rewardsErrorCodes.invalidInput,
    message: `${contractName} contract payload is invalid.`,
    userMessage: "We could not process this request. Please check the data and try again.",
    cause: parsed.error.flatten(),
  });
}

export function parseReferralVisitInput(input: unknown): RewardsServiceResult<ReferralVisitInput> {
  return parseContractInput(referralVisitInputSchema, input, "referral.visit");
}

export function parseReferralConversionInput(input: unknown): RewardsServiceResult<ReferralConversionInput> {
  return parseContractInput(referralConversionInputSchema, input, "referral.conversion");
}

export function parseLoyaltyPointsMutationInput(
  input: unknown,
): RewardsServiceResult<LoyaltyPointsMutationInput> {
  return parseContractInput(loyaltyPointsMutationInputSchema, input, "loyalty.points.mutation");
}

export function parseWalletLedgerEntryInput(input: unknown): RewardsServiceResult<WalletLedgerEntryInput> {
  return parseContractInput(walletLedgerEntryInputSchema, input, "wallet.ledger.entry");
}
