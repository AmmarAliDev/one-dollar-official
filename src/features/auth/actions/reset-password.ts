"use server";

import { headers } from "next/headers";

import { hashPassword } from "@/lib/auth/password";
import { hashPasswordResetToken, isPasswordResetTokenExpired } from "@/lib/auth/password-reset-token";
import { toActionErrorState } from "@/lib/errors/handling";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertTrustedOrigin, getClientIp } from "@/lib/security/csrf";
import { validateWithSchema } from "@/lib/security/validation";
import { getPrismaClient } from "@/server/db";

import { resetPasswordValidator } from "../validators";

const INVALID_RESET_LINK_MESSAGE =
  "This reset link is invalid or expired. Please request a new password reset email.";

export interface ResetPasswordActionState {
  errors?: string[];
  success?: boolean;
}

export async function resetPasswordAction(
  _prev: ResetPasswordActionState | null,
  formData: FormData,
): Promise<ResetPasswordActionState> {
  const db = getPrismaClient();

  try {
    await assertTrustedOrigin({ action: "auth:reset-password" });
  } catch (error) {
    return toActionErrorState(error, "reset-password");
  }

  const parsed = validateWithSchema(resetPasswordValidator, {
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.errors,
    };
  }

  const { token, password } = parsed.data;

  try {
    const headerList = await headers();
    const ip = getClientIp(headerList);

    const rlResult = await checkRateLimit({
      identifier: ip,
      action: "auth:reset-password",
      limit: 10,
      windowMs: 60_000,
    });

    if (!rlResult.success) {
      return {
        errors: ["Too many attempts. Please wait a minute and try again."],
      };
    }

    const tokenHash = hashPasswordResetToken(token);
    const resetToken = await db.passwordResetToken.findUnique({
      where: {
        tokenHash,
      },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
      },
    });

    if (!resetToken) {
      return {
        errors: [INVALID_RESET_LINK_MESSAGE],
      };
    }

    if (isPasswordResetTokenExpired(resetToken.expiresAt)) {
      await db.passwordResetToken.deleteMany({
        where: {
          id: resetToken.id,
        },
      });

      return {
        errors: [INVALID_RESET_LINK_MESSAGE],
      };
    }

    const passwordHash = await hashPassword(password);

    const result = await db.$transaction(async (tx) => {
      const consumed = await tx.passwordResetToken.deleteMany({
        where: {
          id: resetToken.id,
        },
      });

      if (consumed.count !== 1) {
        return false;
      }

      await tx.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          password: passwordHash,
        },
      });

      await tx.passwordResetToken.deleteMany({
        where: {
          userId: resetToken.userId,
        },
      });

      return true;
    });

    if (!result) {
      return {
        errors: [INVALID_RESET_LINK_MESSAGE],
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return toActionErrorState(
      error,
      "reset-password:submit",
      "Could not reset your password. Please request a new reset link and try again.",
    );
  }
}

export const invalidResetLinkMessage = INVALID_RESET_LINK_MESSAGE;
