import { env } from "@/config/env";
import { routes } from "@/config/routes";
import {
  buildEmailVerificationUrl,
  createEmailVerificationTokenPair,
  hashEmailVerificationToken,
  isEmailVerificationTokenExpired,
} from "@/lib/auth/email-verification-token";
import { logger } from "@/lib/logger";
import { maskEmail } from "@/lib/security/pii";
import { getPrismaClient } from "@/server/db";

import { sendEmailVerificationEmail } from "./email-verification-email";

export type VerifyEmailTokenResult = "verified" | "already-verified" | "invalid-or-expired";

type IssueVerificationInput = {
  userId: string;
  email: string;
  now?: Date;
};

export async function issueEmailVerificationToken(input: IssueVerificationInput) {
  const db = getPrismaClient();
  const tokenPair = createEmailVerificationTokenPair(input.now);

  await db.$transaction(async (tx) => {
    await tx.emailVerificationToken.deleteMany({
      where: {
        userId: input.userId,
      },
    });

    await tx.emailVerificationToken.create({
      data: {
        userId: input.userId,
        tokenHash: tokenPair.tokenHash,
        expiresAt: tokenPair.expiresAt,
      },
    });
  });

  const verificationUrl = buildEmailVerificationUrl(env.appUrl, routes.auth.verifyEmail, tokenPair.token);

  try {
    const emailSent = await sendEmailVerificationEmail({
      email: input.email,
      verificationUrl,
    });

    return {
      emailSent,
      verificationUrl,
    };
  } catch (error) {
    logger.error("email-verification: failed to send verification email", {
      error,
      userId: input.userId,
      maskedEmail: maskEmail(input.email),
    });

    return {
      emailSent: false,
      verificationUrl,
    };
  }
}

export async function verifyEmailByToken(token: string, now = new Date()): Promise<VerifyEmailTokenResult> {
  const db = getPrismaClient();
  const tokenHash = hashEmailVerificationToken(token);

  const verificationToken = await db.emailVerificationToken.findUnique({
    where: {
      tokenHash,
    },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
    },
  });

  if (!verificationToken) {
    return "invalid-or-expired";
  }

  if (isEmailVerificationTokenExpired(verificationToken.expiresAt, now)) {
    await db.emailVerificationToken.deleteMany({
      where: {
        id: verificationToken.id,
      },
    });

    return "invalid-or-expired";
  }

  const result = await db.$transaction(async (tx) => {
    const consumed = await tx.emailVerificationToken.deleteMany({
      where: {
        id: verificationToken.id,
      },
    });

    if (consumed.count !== 1) {
      return "invalid-or-expired" as const;
    }

    const currentUser = await tx.user.findUnique({
      where: {
        id: verificationToken.userId,
      },
      select: {
        emailVerified: true,
      },
    });

    if (!currentUser) {
      return "invalid-or-expired" as const;
    }

    if (currentUser.emailVerified) {
      await tx.emailVerificationToken.deleteMany({
        where: {
          userId: verificationToken.userId,
        },
      });

      return "already-verified" as const;
    }

    await tx.user.update({
      where: {
        id: verificationToken.userId,
      },
      data: {
        emailVerified: now,
      },
    });

    await tx.emailVerificationToken.deleteMany({
      where: {
        userId: verificationToken.userId,
      },
    });

    return "verified" as const;
  });

  return result;
}
