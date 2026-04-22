import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { searchCatalogProducts } from "@/features/catalog";
import { createRouteHandlerErrorResponse, createValidationAppError } from "@/lib/errors/handling";

const catalogSearchQuerySchema = z.object({
  query: z.string().trim().min(1).max(80),
  limit: z.coerce.number().int().min(1).max(24).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const parsedResult = catalogSearchQuerySchema.safeParse({
      query: request.nextUrl.searchParams.get("query") ?? "",
      limit: request.nextUrl.searchParams.get("limit") ?? undefined,
    });

    if (!parsedResult.success) {
      throw createValidationAppError(parsedResult.error, "Invalid catalog search query.");
    }

    const parsed = parsedResult.data;

    const result = await searchCatalogProducts(parsed.query, {
      ...(typeof parsed.limit === "number" ? { limit: parsed.limit } : {}),
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    return createRouteHandlerErrorResponse(error, "catalog search", {
      userMessage: "We could not run your search right now. Please try again.",
    });
  }
}
