import type { NextResponse } from "next/server";

import { AppError } from "@/lib/errors/app-error";

export const CART_COOKIE_NAME = "one-dollar-cart";
const CART_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function isValidCartToken(value: string) {
  return /^[a-zA-Z0-9-]{16,128}$/.test(value);
}

export function readCartTokenFromCookieValue(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const candidate = value.trim();

  return isValidCartToken(candidate) ? candidate : undefined;
}

export function applyCartTokenCookie(response: NextResponse, token: string) {
  if (!isValidCartToken(token)) {
    throw new AppError("Invalid cart token generated for cookie write.", "CART_COOKIE_TOKEN_INVALID", {
      statusCode: 500,
      userMessage: "We could not save your cart. Please try again.",
    });
  }

  response.cookies.set({
    name: CART_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE_SECONDS,
  });
}
