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
import { createRouteHandlerErrorResponse } from "@/lib/errors/handling";

export async function GET() {
  try {
    const [session, cookieStore] = await Promise.all([auth(), cookies()]);

    const userId = session?.user?.id;
    const guestToken = readCartTokenFromCookieValue(cookieStore.get(CART_COOKIE_NAME)?.value);
    const ensuredGuestToken = await getOrCreateGuestCartToken(guestToken);

    const cart = await getCartSummaryForContext({
      userId,
      guestToken: ensuredGuestToken,
      mergeGuestIntoUser: Boolean(userId && guestToken),
    });

    const validation = cart
      ? validateCartStock(cart)
      : {
          ok: true,
          issues: [],
        };

    const response = NextResponse.json(
      {
        ok: true,
        cart,
        validation,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );

    applyCartTokenCookie(response, userId ? ensuredGuestToken : cart?.token ?? ensuredGuestToken);

    return response;
  } catch (error) {
    return createRouteHandlerErrorResponse(error, "cart:validate", {
      userMessage: "We could not validate your cart right now. Please try again.",
    });
  }
}
