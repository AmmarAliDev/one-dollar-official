import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { SectionErrorState } from "@/components/ui/section-error-state";
import { buildMetadata } from "@/config/metadata";
import {
  AdminPageHeader,
} from "@/features/admin/components/admin-page-patterns";
import {
  AdminInventoryTable,
  type AdminInventoryItem,
} from "@/features/admin/inventory/components/admin-inventory-table";
import { getPrismaClient } from "@/server/db";

export const metadata = buildMetadata({
  title: "Admin Inventory",
  path: "/admin/inventory",
  description: "Inventory and low-stock placeholder using the shared admin table pattern.",
});

export default async function AdminInventoryPage() {
  // Try to read low-stock inventory from the database. If the DB is not
  // available or an error occurs, we fall back to the shared placeholder
  // pattern and show an error state.
  let lowStock: any[] = [];
  try {
    const db = getPrismaClient();
    const allInventory = await db.inventory.findMany({
      include: {
        productVariant: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { updatedAt: "asc" },
      take: 200,
    });

    // Prisma doesn't support column-to-column comparisons in the query,
    // so compute low-stock in JS: (quantity - reserved) <= safetyStock.
    lowStock = allInventory.filter((inv: any) => {
      const onHand = (inv.quantity ?? 0) - (inv.reserved ?? 0);
      const safety = inv.safetyStock ?? 0;
      return onHand <= safety;
    });
  } catch (err) {
    return (
      <PageShell className="gap-8">
        <AdminPageHeader
          eyebrow="Inventory"
          title="Low stock overview"
          description="See products that may need restocking before customers are impacted."
        />

        <SectionErrorState
          title="Could not load inventory"
          description="We could not load inventory records right now. Please try again."
        />
      </PageShell>
    );
  }

  if (!lowStock || lowStock.length === 0) {
    return (
      <PageShell className="gap-8">
        <AdminPageHeader
          eyebrow="Inventory"
          title="Low stock overview"
          description="See products that may need restocking before customers are impacted."
        />

        <Card>
          <CardContent className="pt-6">
            <AdminInventoryTable items={[]} />
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  // Ready state: render a simple table of low-stock items instead of the
  // placeholder pattern. Keep the UI minimal — this can be replaced with a
  // richer data table component later.
  const inventoryItems: AdminInventoryItem[] = lowStock.map((inv: any) => {
    const variant = inv.productVariant;
    const product = variant?.product;
    const onHand = (inv.quantity ?? 0) - (inv.reserved ?? 0);

    return {
      id: inv.id,
      productName: product?.name ?? null,
      sku: variant?.sku ?? null,
      onHand,
      safetyStock: inv.safetyStock ?? null,
      location: inv.location ?? null,
    };
  });

  return (
    <PageShell className="gap-8">
      <AdminPageHeader
        eyebrow="Inventory"
        title="Low stock overview"
        description="See products that may need restocking before customers are impacted."
      />

      <Card>
        <CardContent className="pt-6">
          <AdminInventoryTable items={inventoryItems} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
