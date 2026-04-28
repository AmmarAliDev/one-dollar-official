import { beforeEach, describe, expect, it, vi } from "vitest";

const headersMock = vi.hoisted(() => vi.fn());
const checkRateLimitMock = vi.hoisted(() => vi.fn());
const assertTrustedOriginMock = vi.hoisted(() => vi.fn());
const getClientIpMock = vi.hoisted(() => vi.fn());
const getPrismaClientMock = vi.hoisted(() => vi.fn());
const sendPasswordResetEmailMock = vi.hoisted(() => vi.fn());
const createPasswordResetTokenPairMock = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: checkRateLimitMock,
}));

vi.mock("@/lib/security/csrf", () => ({
  assertTrustedOrigin: assertTrustedOriginMock,
  getClientIp: getClientIpMock,
}));

vi.mock("@/server/db", () => ({
  getPrismaClient: getPrismaClientMock,
}));

vi.mock("@/features/auth/password-reset-email", () => ({
  sendPasswordResetEmail: sendPasswordResetEmailMock,
}));

vi.mock("@/lib/auth/password-reset-token", () => ({
  createPasswordResetTokenPair: createPasswordResetTokenPairMock,
  buildPasswordResetUrl: vi.fn(() => "https://example.com/auth/reset-password?token=token123"),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import {
  forgotPasswordAction,
  forgotPasswordSuccessMessage,
} from "@/features/auth/actions/forgot-password";

function createFormData(email = "user@example.com") {
  const formData = new FormData();
  formData.set("email", email);
  return formData;
}

describe("forgotPasswordAction", () => {
  const userFindUniqueMock = vi.fn();
  const txDeleteManyMock = vi.fn();
  const txCreateMock = vi.fn();

  beforeEach(() => {
    headersMock.mockReset().mockResolvedValue(new Headers());
    checkRateLimitMock.mockReset().mockResolvedValue({ success: true });
    assertTrustedOriginMock.mockReset().mockResolvedValue(undefined);
    getClientIpMock.mockReset().mockReturnValue("127.0.0.1");
    sendPasswordResetEmailMock.mockReset().mockResolvedValue(true);
    createPasswordResetTokenPairMock.mockReset().mockReturnValue({
      token: "token123",
      tokenHash: "hash123",
      expiresAt: new Date("2026-04-26T11:00:00.000Z"),
    });

    userFindUniqueMock.mockReset();
    txDeleteManyMock.mockReset().mockResolvedValue({ count: 1 });
    txCreateMock.mockReset().mockResolvedValue({ id: "reset-token-id" });

    getPrismaClientMock.mockReset().mockReturnValue({
      user: {
        findUnique: userFindUniqueMock,
      },
      $transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          passwordResetToken: {
            deleteMany: txDeleteManyMock,
            create: txCreateMock,
          },
        }),
    });
  });

  it("returns the same success response for unknown emails", async () => {
    userFindUniqueMock.mockResolvedValue(null);

    const result = await forgotPasswordAction(null, createFormData("unknown@example.com"));

    expect(result).toEqual({
      success: true,
      message: forgotPasswordSuccessMessage,
    });
    expect(sendPasswordResetEmailMock).not.toHaveBeenCalled();
  });

  it("returns the same success response for known emails", async () => {
    userFindUniqueMock.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
    });

    const result = await forgotPasswordAction(null, createFormData("user@example.com"));

    expect(result).toEqual({
      success: true,
      message: forgotPasswordSuccessMessage,
    });
    expect(txCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          tokenHash: "hash123",
        }),
      }),
    );
    expect(sendPasswordResetEmailMock).toHaveBeenCalledTimes(1);
  });

  it("returns a rate-limit error when attempts exceed the threshold", async () => {
    checkRateLimitMock.mockResolvedValueOnce({ success: false });

    const result = await forgotPasswordAction(null, createFormData("user@example.com"));

    expect(result).toEqual({
      errors: ["Too many reset attempts. Please wait a minute and try again."],
    });
  });
});
