import { beforeEach, describe, expect, it, vi } from "vitest";

const headersMock = vi.hoisted(() => vi.fn());
const checkRateLimitMock = vi.hoisted(() => vi.fn());
const assertTrustedOriginMock = vi.hoisted(() => vi.fn());
const getClientIpMock = vi.hoisted(() => vi.fn());
const getPrismaClientMock = vi.hoisted(() => vi.fn());
const hashPasswordMock = vi.hoisted(() => vi.fn());

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

vi.mock("@/lib/auth/password", () => ({
  hashPassword: hashPasswordMock,
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { invalidResetLinkMessage, resetPasswordAction } from "@/features/auth/actions/reset-password";

function createResetFormData(token = "valid-reset-token-1234567890") {
  const formData = new FormData();
  formData.set("token", token);
  formData.set("password", "newPassword123");
  formData.set("confirmPassword", "newPassword123");
  return formData;
}

describe("resetPasswordAction", () => {
  const findUniqueMock = vi.fn();
  const deleteManyMock = vi.fn();
  const txDeleteManyMock = vi.fn();
  const txUserUpdateMock = vi.fn();

  beforeEach(() => {
    headersMock.mockReset().mockResolvedValue(new Headers());
    checkRateLimitMock.mockReset().mockResolvedValue({ success: true });
    assertTrustedOriginMock.mockReset().mockResolvedValue(undefined);
    getClientIpMock.mockReset().mockReturnValue("127.0.0.1");
    hashPasswordMock.mockReset().mockResolvedValue("hashed-password");

    findUniqueMock.mockReset();
    deleteManyMock.mockReset().mockResolvedValue({ count: 1 });
    txDeleteManyMock.mockReset().mockResolvedValue({ count: 1 });
    txUserUpdateMock.mockReset().mockResolvedValue({ id: "user-1" });

    getPrismaClientMock.mockReset().mockReturnValue({
      passwordResetToken: {
        findUnique: findUniqueMock,
        deleteMany: deleteManyMock,
      },
      $transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          passwordResetToken: {
            deleteMany: txDeleteManyMock,
          },
          user: {
            update: txUserUpdateMock,
          },
        }),
    });
  });

  it("returns a safe error for unknown tokens", async () => {
    findUniqueMock.mockResolvedValue(null);

    const result = await resetPasswordAction(null, createResetFormData());

    expect(result).toEqual({
      errors: [invalidResetLinkMessage],
    });
  });

  it("returns a safe error and deletes expired tokens", async () => {
    findUniqueMock.mockResolvedValue({
      id: "token-id",
      userId: "user-1",
      expiresAt: new Date(Date.now() - 1_000),
    });

    const result = await resetPasswordAction(null, createResetFormData());

    expect(result).toEqual({
      errors: [invalidResetLinkMessage],
    });
    expect(deleteManyMock).toHaveBeenCalledWith({
      where: {
        id: "token-id",
      },
    });
  });

  it("resets the password and invalidates user reset tokens", async () => {
    findUniqueMock.mockResolvedValue({
      id: "token-id",
      userId: "user-1",
      expiresAt: new Date(Date.now() + 60_000),
    });

    const result = await resetPasswordAction(null, createResetFormData());

    expect(result).toEqual({
      success: true,
    });
    expect(hashPasswordMock).toHaveBeenCalledWith("newPassword123");
    expect(txUserUpdateMock).toHaveBeenCalledWith({
      where: {
        id: "user-1",
      },
      data: {
        password: "hashed-password",
      },
    });
    expect(txDeleteManyMock).toHaveBeenCalledTimes(2);
  });
});
