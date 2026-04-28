import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import {
  addCartItemForContext,
  applyCartTokenCookie,
  CART_COOKIE_NAME,
  getCartSummaryForContext,
  getOrCreateGuestCartToken,
  readCartTokenFromCookieValue,
  removeCartItemForContext,
  updateCartItemQuantityForContext,
} from "@/features/cart";
import { createRouteHandlerErrorResponse, createValidationAppError } from "@/lib/errors/handling";
import { assertTrustedRouteHandlerRequest } from "@/lib/security/csrf";

const addCartItemSchema = z.object({
  productSlug: z.string().trim().min(1),
  optionId: z.string().trim().min(1).optional(),
  quantity: z.coerce.number().int().min(1).max(99).optional(),
});

const updateCartItemSchema = z.object({
  cartItemId: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(0).max(99),
});

const removeCartItemSchema = z.object({
  cartItemId: z.string().trim().min(1),
});

async function getCartContext() {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);

  const userId = session?.user?.id;
  const guestToken = readCartTokenFromCookieValue(cookieStore.get(CART_COOKIE_NAME)?.value);

  return {
    userId,
    guestToken,
    mergeGuestIntoUser: Boolean(userId && guestToken),
  };
}

async function withCartCookie<T>(payload: T, token: string | undefined) {
  const response = NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });

  if (token) {
    applyCartTokenCookie(response, token);
  }

  return response;
}

function resolveResponseCartToken(input: {
  userId: string | undefined;
  ensuredGuestToken: string;
  cartToken: string | undefined;
}) {
  if (input.userId) {
    return input.ensuredGuestToken;
  }

  return input.cartToken ?? input.ensuredGuestToken;
}

export async function GET() {
  try {
    const context = await getCartContext();

    const ensuredGuestToken = await getOrCreateGuestCartToken(context.guestToken);
    const summary = await getCartSummaryForContext({
      ...context,
      guestToken: ensuredGuestToken,
    });

    return withCartCookie(
      {
        ok: true,
        cart: summary,
      },
      resolveResponseCartToken({
        userId: context.userId,
        ensuredGuestToken,
        cartToken: summary?.token,
      }),
    );
  } catch (error) {
    return createRouteHandlerErrorResponse(error, "cart:get", {
      userMessage: "We could not load your cart right now. Please try again.",
    });
  }
}

export async function POST(request: Request) {
  try {
    assertTrustedRouteHandlerRequest(request, { action: "cart:add" });

    const payload = await request.json();
    const parsed = addCartItemSchema.safeParse(payload);

    if (!parsed.success) {
      throw createValidationAppError(parsed.error, "Invalid add-to-cart payload.");
    }

    const context = await getCartContext();
    const ensuredGuestToken = await getOrCreateGuestCartToken(context.guestToken);

    const summary = await addCartItemForContext(
      {
        ...context,
        guestToken: ensuredGuestToken,
      },
      parsed.data,
    );

    return withCartCookie(
      {
        ok: true,
        cart: summary,
      },
      resolveResponseCartToken({
        userId: context.userId,
        ensuredGuestToken,
        cartToken: summary.token,
      }),
    );
  } catch (error) {
    return createRouteHandlerErrorResponse(error, "cart:add", {
      userMessage: "We could not add this item to your cart. Please try again.",
    });
  }
}

export async function PATCH(request: Request) {
  try {
    assertTrustedRouteHandlerRequest(request, { action: "cart:update" });

    const payload = await request.json();
    const parsed = updateCartItemSchema.safeParse(payload);

    if (!parsed.success) {
      throw createValidationAppError(parsed.error, "Invalid cart update payload.");
    }

    const context = await getCartContext();
    const ensuredGuestToken = await getOrCreateGuestCartToken(context.guestToken);

    const summary = await updateCartItemQuantityForContext(
      {
        ...context,
        guestToken: ensuredGuestToken,
      },
      parsed.data,
    );

    return withCartCookie(
      {
        ok: true,
        cart: summary,
      },
      resolveResponseCartToken({
        userId: context.userId,
        ensuredGuestToken,
        cartToken: summary.token,
      }),
    );
  } catch (error) {
    return createRouteHandlerErrorResponse(error, "cart:update", {
      userMessage: "We could not update your cart right now. Please try again.",
    });
  }
}

export async function DELETE(request: Request) {
  try {
    assertTrustedRouteHandlerRequest(request, { action: "cart:remove" });

    const payload = await request.json();
    const parsed = removeCartItemSchema.safeParse(payload);

    if (!parsed.success) {
      throw createValidationAppError(parsed.error, "Invalid cart remove payload.");
    }

    const context = await getCartContext();
    const ensuredGuestToken = await getOrCreateGuestCartToken(context.guestToken);

    const summary = await removeCartItemForContext(
      {
        ...context,
        guestToken: ensuredGuestToken,
      },
      parsed.data,
    );

    return withCartCookie(
      {
        ok: true,
        cart: summary,
      },
      resolveResponseCartToken({
        userId: context.userId,
        ensuredGuestToken,
        cartToken: summary.token,
      }),
    );
  } catch (error) {
    return createRouteHandlerErrorResponse(error, "cart:remove", {
      userMessage: "We could not remove this item from your cart. Please try again.",
    });
  }
}
