import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  applyCartTokenCookie,
  CART_COOKIE_NAME,
  getCartSummaryForContext,
  getOrCreateGuestCartToken,
  readCartTokenFromCookieValue,
  validateCartStock,
} from "@/features/cart";
import {
  assertCheckoutCartReady,
  buildCheckoutAttemptResult,
  checkoutPayloadSchema,
} from "@/features/checkout";
import { AppError } from "@/lib/errors/app-error";
import { createRouteHandlerErrorResponse, createValidationAppError } from "@/lib/errors/handling";
import { assertTrustedRouteHandlerRequest } from "@/lib/security/csrf";

async function resolveCheckoutContext() {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);

  const userId = session?.user?.id;
  const guestToken = readCartTokenFromCookieValue(cookieStore.get(CART_COOKIE_NAME)?.value);

  return {
    userId,
    guestToken,
    mergeGuestIntoUser: Boolean(userId && guestToken),
  };
}

export async function POST(request: Request) {
  try {
    assertTrustedRouteHandlerRequest(request, { action: "checkout:submit" });

    const payload = await request.json();
    const parsed = checkoutPayloadSchema.safeParse(payload);

    if (!parsed.success) {
      throw createValidationAppError(parsed.error, "Invalid checkout payload.");
    }

    const context = await resolveCheckoutContext();
    const ensuredGuestToken = await getOrCreateGuestCartToken(context.guestToken);

    const cart = assertCheckoutCartReady(
      await getCartSummaryForContext({
        ...context,
        guestToken: ensuredGuestToken,
      }),
    );

    if (cart.id !== parsed.data.cartId) {
      throw new AppError("Checkout cart mismatch.", "CHECKOUT_CART_MISMATCH", {
        statusCode: 409,
        userMessage: "Your cart changed. Please refresh checkout and try again.",
      });
    }

    const stock = validateCartStock(cart);
    if (!stock.ok) {
      throw new AppError("Checkout blocked due to stock issues.", "CHECKOUT_STOCK_ISSUES", {
        statusCode: 409,
        userMessage: "Some items are no longer in stock. Please update your cart and retry.",
      });
    }

    const checkout = buildCheckoutAttemptResult(parsed.data, cart);

    const response = NextResponse.json(
      {
        ok: true,
        checkout,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );

    applyCartTokenCookie(response, cart.token || ensuredGuestToken);

    return response;
  } catch (error) {
    return createRouteHandlerErrorResponse(error, "checkout:submit", {
      userMessage: "We could not submit checkout details right now. Please retry.",
    });
  }
}
