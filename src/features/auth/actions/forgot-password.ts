"use server";

import { headers } from "next/headers";

import { env } from "@/config/env";
import { routes } from "@/config/routes";
import { forgotPasswordValidator } from "@/features/auth/validators";
import { buildPasswordResetUrl, createPasswordResetTokenPair } from "@/lib/auth/password-reset-token";
import { toActionErrorState } from "@/lib/errors/handling";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertTrustedOrigin, getClientIp } from "@/lib/security/csrf";
import { maskEmail } from "@/lib/security/pii";
import { validateWithSchema } from "@/lib/security/validation";
import { getPrismaClient } from "@/server/db";

import { sendPasswordResetEmail } from "../password-reset-email";

const FORGOT_PASSWORD_SUCCESS_MESSAGE =
  "If an account exists for that email, we sent a password reset link.";

export interface ForgotPasswordActionState {
  errors?: string[];
  success?: boolean;
  message?: string;
}

export async function forgotPasswordAction(
  _prev: ForgotPasswordActionState | null,
  formData: FormData,
): Promise<ForgotPasswordActionState> {
  const db = getPrismaClient();

  try {
    await assertTrustedOrigin({ action: "auth:forgot-password" });
  } catch (error) {
    return toActionErrorState(error, "forgot-password");
  }

  const parsed = validateWithSchema(forgotPasswordValidator, {
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.errors,
    };
  }

  const { email } = parsed.data;

  try {
    const headerList = await headers();
    const ip = getClientIp(headerList);

    const ipRateLimit = await checkRateLimit({
      identifier: ip,
      action: "auth:forgot-password",
      limit: 10,
      windowMs: 60_000,
    });

    if (!ipRateLimit.success) {
      return {
        errors: ["Too many reset attempts. Please wait a minute and try again."],
      };
    }

    const emailRateLimit = await checkRateLimit({
      identifier: email.toLowerCase(),
      action: "auth:forgot-password:email",
      limit: 5,
      windowMs: 60_000,
    });

    if (!emailRateLimit.success) {
      return {
        errors: ["Too many reset attempts. Please wait a minute and try again."],
      };
    }

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
      },
    });

    if (user?.email) {
      const tokenPair = createPasswordResetTokenPair();

      await db.$transaction(async (tx) => {
        await tx.passwordResetToken.deleteMany({
          where: {
            userId: user.id,
          },
        });

        await tx.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash: tokenPair.tokenHash,
            expiresAt: tokenPair.expiresAt,
          },
        });
      });

      const resetUrl = buildPasswordResetUrl(env.appUrl, routes.auth.resetPassword, tokenPair.token);

      try {
        await sendPasswordResetEmail({
          email: user.email,
          resetUrl,
        });
      } catch (error) {
        logger.error("forgot-password: failed to send reset email", {
          error,
          userId: user.id,
          maskedEmail: maskEmail(user.email),
        });
      }
    }

    return {
      success: true,
      message: FORGOT_PASSWORD_SUCCESS_MESSAGE,
    };
  } catch (error) {
    return toActionErrorState(
      error,
      "forgot-password:request",
      "Could not process your request. Please try again.",
    );
  }
}

export const forgotPasswordSuccessMessage = FORGOT_PASSWORD_SUCCESS_MESSAGE;
