import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  buildInvoicePdf,
  buildOrderInvoiceFilename,
  getOrderDetailsForAccess,
} from "@/features/orders";
import { hasPermission, rbacPermissions } from "@/lib/auth/rbac";
import { createRouteHandlerErrorResponse } from "@/lib/errors/handling";

type InvoiceRouteProps = {
  params: Promise<{ orderNumber: string }>;
};

export async function GET(request: Request, { params }: InvoiceRouteProps) {
  try {
    const [{ orderNumber }, session] = await Promise.all([params, auth()]);
    const url = new URL(request.url);
    const token = url.searchParams.get("token") ?? undefined;
    const allowPrivilegedAccess =
      hasPermission(session?.user?.role, rbacPermissions.adminAccess) &&
      hasPermission(session?.user?.role, rbacPermissions.ordersRead);

    const order = await getOrderDetailsForAccess({
      orderNumber,
      ...(session?.user?.id ? { userId: session.user.id } : {}),
      ...(token ? { accessToken: token } : {}),
      ...(allowPrivilegedAccess ? { allowPrivilegedAccess: true } : {}),
    });

    if (!order) {
      return NextResponse.json(
        {
          code: "ORDER_NOT_FOUND",
          error: "The requested invoice could not be found.",
        },
        { status: 404 },
      );
    }

    const pdf = buildInvoicePdf(order);

    return new NextResponse(pdf, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="${buildOrderInvoiceFilename(order.orderNumber)}"`,
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    return createRouteHandlerErrorResponse(error, "orders:invoice", {
      userMessage: "We could not generate the invoice right now. Please retry.",
    });
  }
}