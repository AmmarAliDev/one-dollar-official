import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getCatalogCategoryListing } from "@/features/catalog";
import { createRouteHandlerErrorResponse } from "@/lib/errors/handling";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;

    const listing = await getCatalogCategoryListing({
      slug,
      searchParams: {
        minPrice: request.nextUrl.searchParams.get("minPrice") ?? undefined,
        maxPrice: request.nextUrl.searchParams.get("maxPrice") ?? undefined,
        availability: request.nextUrl.searchParams.get("availability") ?? undefined,
        rating: request.nextUrl.searchParams.get("rating") ?? undefined,
        discount: request.nextUrl.searchParams.get("discount") ?? undefined,
        sort: request.nextUrl.searchParams.get("sort") ?? undefined,
        attribute: request.nextUrl.searchParams.get("attribute") ?? undefined,
        page: request.nextUrl.searchParams.get("page") ?? undefined,
        pageSize: request.nextUrl.searchParams.get("pageSize") ?? undefined,
      },
    });

    if (!listing) {
      return NextResponse.json(
        {
          code: "CATEGORY_NOT_FOUND",
          error: "This category is no longer available.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        products: listing.products,
        pagination: listing.pagination,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return createRouteHandlerErrorResponse(error, "catalog category products", {
      userMessage: "We could not load more products right now. Please try again.",
    });
  }
}
