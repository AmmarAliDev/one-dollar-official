import { describe, expect, it } from "vitest";

import {
  parseLoyaltyPointsMutationInput,
  parseReferralConversionInput,
  parseReferralVisitInput,
  parseWalletLedgerEntryInput,
  rewardsErrorCodes,
  rewardsFail,
  rewardsOk,
} from "@/features/rewards";

describe("rewards result helpers", () => {
  it("returns success shape with rewardsOk", () => {
    const result = rewardsOk({ id: "record-1" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.id).toBe("record-1");
    }
  });

  it("returns user-safe failure shape with rewardsFail", () => {
    const result = rewardsFail({
      code: rewardsErrorCodes.serviceUnavailable,
      message: "wallet provider timed out",
      userMessage: "The rewards service is temporarily unavailable. Please try again.",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(rewardsErrorCodes.serviceUnavailable);
      expect(result.error.userMessage).toMatch(/temporarily unavailable/i);
    }
  });
});

describe("referral contract payload parsing", () => {
  it("accepts a valid visit payload", () => {
    const parsed = parseReferralVisitInput({
      referralCode: "REF-APR26",
      visitorSessionId: "session-123456",
      landingPath: "/categories/tech",
    });

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data.referralCode).toBe("REF-APR26");
    }
  });

  it("rejects invalid conversion payload", () => {
    const parsed = parseReferralConversionInput({
      referralCode: "x",
      orderId: "bad-order-id",
      orderNumber: "O1",
      orderTotalMinor: -1,
    });

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.error.code).toBe(rewardsErrorCodes.invalidInput);
      expect(parsed.error.userMessage).toMatch(/could not process/i);
    }
  });
});

describe("loyalty and wallet contract payload parsing", () => {
  it("accepts a valid loyalty points mutation payload", () => {
    const parsed = parseLoyaltyPointsMutationInput({
      userId: "17c60583-e584-4e6e-9631-6fa3e8e95a1d",
      points: 150,
      reason: "Order delivered",
      reference: "OD-20260427-123456",
    });

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data.points).toBe(150);
    }
  });

  it("rejects a wallet entry with invalid currency and amount", () => {
    const parsed = parseWalletLedgerEntryInput({
      walletId: "17c60583-e584-4e6e-9631-6fa3e8e95a1d",
      userId: "17c60583-e584-4e6e-9631-6fa3e8e95a1d",
      direction: "debit",
      amountMinor: 0,
      currency: "USD",
      source: "checkout",
      reference: "OD-20260427-123456",
    });

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.error.code).toBe(rewardsErrorCodes.invalidInput);
    }
  });
});
