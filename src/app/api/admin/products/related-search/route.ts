import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { listAdminRelatedProducts } from "@/features/admin/products";
import { guardRouteHandlerAccess } from "@/lib/auth/guards";
import { rbacPermissions } from "@/lib/auth/rbac";
import { createRouteHandlerErrorResponse, createValidationAppError } from "@/lib/errors/handling";

export const runtime = "nodejs";

const MAX_RELATED_SEARCH_TAKE = 40;

const relatedSearchQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  categoryId: z.string().trim().min(1).max(80).optional(),
  excludeId: z.string().trim().min(1).max(80).optional(),
  take: z.coerce.number().int().min(1).max(MAX_RELATED_SEARCH_TAKE).optional(),
  selectedIds: z
    .array(z.string().trim().min(1).max(80))
    .max(50)
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    const access = await guardRouteHandlerAccess({
      permissions: [rbacPermissions.adminAccess, rbacPermissions.catalogWrite],
    });

    if (!access.ok) {
      return access.response;
    }

    const parsedResult = relatedSearchQuerySchema.safeParse({
      q: request.nextUrl.searchParams.get("q") ?? undefined,
      categoryId: request.nextUrl.searchParams.get("categoryId") ?? undefined,
      excludeId: request.nextUrl.searchParams.get("excludeId") ?? undefined,
      take: request.nextUrl.searchParams.get("take") ?? undefined,
      selectedIds: request.nextUrl.searchParams.getAll("selectedIds"),
    });

    if (!parsedResult.success) {
      throw createValidationAppError(parsedResult.error, "Invalid related products search query.");
    }

    const parsed = parsedResult.data;
    const products = await listAdminRelatedProducts({
      ...(parsed.q ? { query: parsed.q } : {}),
      ...(parsed.categoryId ? { categoryId: parsed.categoryId } : {}),
      ...(parsed.excludeId ? { excludeProductId: parsed.excludeId } : {}),
      take: parsed.take ?? 20,
      ...(parsed.selectedIds && parsed.selectedIds.length > 0 ? { selectedIds: parsed.selectedIds } : {}),
    });

    return NextResponse.json({ products });
  } catch (error) {
    return createRouteHandlerErrorResponse(error, "admin related products search", {
      userMessage: "We could not load related products right now. Please try again.",
    });
  }
}
