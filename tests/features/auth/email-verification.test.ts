import { beforeEach, describe, expect, it, vi } from "vitest";

const getPrismaClientMock = vi.hoisted(() => vi.fn());
const sendEmailVerificationEmailMock = vi.hoisted(() => vi.fn());

vi.mock("@/server/db", () => ({
  getPrismaClient: getPrismaClientMock,
}));

vi.mock("@/features/auth/email-verification-email", () => ({
  sendEmailVerificationEmail: sendEmailVerificationEmailMock,
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import {
  issueEmailVerificationToken,
  verifyEmailByToken,
} from "@/features/auth/email-verification";
import { hashEmailVerificationToken } from "@/lib/auth/email-verification-token";

describe("email verification flow", () => {
  const findUniqueMock = vi.fn();
  const deleteManyMock = vi.fn();
  const txDeleteManyMock = vi.fn();
  const txCreateMock = vi.fn();
  const txUserUpdateMock = vi.fn();
  const txUserFindUniqueMock = vi.fn();

  beforeEach(() => {
    sendEmailVerificationEmailMock.mockReset().mockResolvedValue(true);

    findUniqueMock.mockReset();
    deleteManyMock.mockReset().mockResolvedValue({ count: 1 });
    txDeleteManyMock.mockReset().mockResolvedValue({ count: 1 });
    txCreateMock.mockReset().mockResolvedValue({ id: "verify-token-id" });
    txUserUpdateMock.mockReset().mockResolvedValue({ id: "user-1" });
    txUserFindUniqueMock.mockReset().mockResolvedValue({ emailVerified: null });

    getPrismaClientMock.mockReset().mockReturnValue({
      emailVerificationToken: {
        findUnique: findUniqueMock,
        deleteMany: deleteManyMock,
      },
      $transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          emailVerificationToken: {
            deleteMany: txDeleteManyMock,
            create: txCreateMock,
          },
          user: {
            findUnique: txUserFindUniqueMock,
            update: txUserUpdateMock,
          },
        }),
    });
  });

  it("creates a hashed verification token and sends a verification email", async () => {
    const result = await issueEmailVerificationToken({
      userId: "user-1",
      email: "user@example.com",
      now: new Date("2026-04-26T10:00:00.000Z"),
    });

    expect(result.emailSent).toBe(true);
    expect(sendEmailVerificationEmailMock).toHaveBeenCalledTimes(1);
    expect(txCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          tokenHash: expect.any(String),
        }),
      }),
    );
  });

  it("verifies a valid token and marks the user email as verified", async () => {
    findUniqueMock.mockResolvedValue({
      id: "token-1",
      userId: "user-1",
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        emailVerified: null,
      },
    });

    const result = await verifyEmailByToken("valid-token-1234567890");

    expect(result).toBe("verified");
    expect(txUserUpdateMock).toHaveBeenCalledWith({
      where: {
        id: "user-1",
      },
      data: {
        emailVerified: expect.any(Date),
      },
    });
    expect(txDeleteManyMock).toHaveBeenCalledTimes(2);
  });

  it("treats expired tokens as invalid and deletes them", async () => {
    findUniqueMock.mockResolvedValue({
      id: "token-1",
      userId: "user-1",
      expiresAt: new Date(Date.now() - 1_000),
      user: {
        emailVerified: null,
      },
    });

    const result = await verifyEmailByToken("expired-token-1234567890");

    expect(result).toBe("invalid-or-expired");
    expect(deleteManyMock).toHaveBeenCalledWith({
      where: {
        id: "token-1",
      },
    });
  });

  it("returns invalid for unknown tokens", async () => {
    findUniqueMock.mockResolvedValue(null);

    const result = await verifyEmailByToken("missing-token-1234567890");

    expect(result).toBe("invalid-or-expired");
  });

  it("hashes incoming token when looking up verification records", async () => {
    findUniqueMock.mockResolvedValue(null);

    const rawToken = "lookup-token-1234567890";
    await verifyEmailByToken(rawToken);

    expect(findUniqueMock).toHaveBeenCalledWith({
      where: {
        tokenHash: hashEmailVerificationToken(rawToken),
      },
      select: expect.any(Object),
    });
  });

  it("returns already-verified when user is already verified in transaction read", async () => {
    findUniqueMock.mockResolvedValue({
      id: "token-1",
      userId: "user-1",
      expiresAt: new Date(Date.now() + 60_000),
    });
    txUserFindUniqueMock.mockResolvedValue({
      emailVerified: new Date(),
    });

    const result = await verifyEmailByToken("already-verified-token-1234567890");

    expect(result).toBe("already-verified");
  });
});
