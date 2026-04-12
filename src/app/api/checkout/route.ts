import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  applyCartTokenCookie,
  CART_COOKIE_NAME,
  getOrCreateGuestCartToken,
  readCartTokenFromCookieValue,
} from "@/features/cart";
import { checkoutPayloadSchema } from "@/features/checkout";
import { placeOrderFromCheckout } from "@/features/orders";
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
    const order = await placeOrderFromCheckout({
      payload: parsed.data,
      context: {
        ...context,
        guestToken: ensuredGuestToken,
      },
    });

    const freshGuestToken = await getOrCreateGuestCartToken();

    const response = NextResponse.json(
      {
        ok: true,
        order,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );

    applyCartTokenCookie(response, freshGuestToken);

    return response;
  } catch (error) {
    return createRouteHandlerErrorResponse(error, "checkout:submit", {
      userMessage: "We could not place your order right now. Please retry.",
    });
  }
}
