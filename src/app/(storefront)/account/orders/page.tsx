import { PackageSearch } from "lucide-react";

import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PriceDisplay } from "@/components/ui/price-display";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";
import { getPrismaClient } from "@/server/db";

export const metadata = buildMetadata({
  title: "Order History",
  path: routes.storefront.accountOrders,
  description: "Review your recent orders.",
});

export default async function AccountOrdersPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Order history unavailable"
        description="Please sign in again to load your order history."
      />
    );
  }

  const db = getPrismaClient();
  const orders = await db.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No orders yet"
        description="Your order history will appear here after your first checkout."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Order {order.orderNumber}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="text-muted-foreground">Status: {order.status}</p>
            <PriceDisplay amount={order.total} size="sm" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}