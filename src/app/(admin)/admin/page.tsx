import Link from "next/link";
import { AlertTriangle, ClipboardList, DollarSign, History, PackageOpen } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";
import {
  AdminListPattern,
  AdminPageHeader,
  AdminTablePattern,
} from "@/features/admin/components/admin-page-patterns";

export const metadata = buildMetadata({
  title: "Admin Dashboard",
  path: "/admin",
  description: "Simple operations dashboard shell with role-aware navigation and placeholder metrics.",
});

const adminCards = [
  {
    title: "Orders",
    value: "0 pending",
    description: "New and active orders waiting for your review.",
    icon: ClipboardList,
    href: routes.admin.orders,
  },
  {
    title: "Revenue (placeholder)",
    value: "PKR 0",
    description: "Revenue reporting panel will connect to live sales later.",
    icon: DollarSign,
    href: routes.admin.revenue,
  },
  {
    title: "Low Stock (placeholder)",
    value: "0 items",
    description: "Inventory alerts help non-technical operators restock early.",
    icon: AlertTriangle,
    href: routes.admin.inventory,
  },
  {
    title: "Recent Activity",
    value: "No new events",
    description: "Recent changes and staff actions appear in one simple feed.",
    icon: History,
    href: routes.admin.activity,
  },
];

export default function AdminPage() {
  return (
    <PageShell className="gap-8">
      <AdminPageHeader
        eyebrow="Admin dashboard"
        title="Store operations at a glance"
        description="Use this simple panel to review daily workload, revenue placeholders, inventory health, and recent activity in one place."
        actions={
          <Link href={routes.admin.orders} className={buttonVariants({ variant: "outline", size: "sm" })}>
            Open orders board
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminCards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription>{card.title}</CardDescription>
                <card.icon className="text-muted-foreground size-4" />
              </div>
              <CardTitle>{card.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{card.description}</p>
              <Link
                href={card.href}
                className="text-primary mt-3 inline-flex text-sm font-medium hover:underline"
              >
                View details
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PackageOpen className="size-4" />
                Orders table pattern
              </CardTitle>
              <CardDescription>Consistent table placeholder pattern for order and inventory pages.</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminTablePattern
                state="empty"
                emptyTitle="No orders in queue"
                emptyDescription="New orders will appear here when customers complete checkout."
                errorDescription="Order records could not be loaded right now."
              />
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="size-4" />
                Activity list pattern
              </CardTitle>
              <CardDescription>Consistent list placeholder pattern for logs and timeline modules.</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminListPattern
                state="empty"
                emptyTitle="No recent activity"
                emptyDescription="Staff and system events will appear here once activity tracking starts."
                errorDescription="Activity records could not be loaded right now."
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </PageShell>
  );
}
