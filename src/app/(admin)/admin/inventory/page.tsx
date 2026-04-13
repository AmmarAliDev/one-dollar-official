import { PageShell } from "@/components/layout/page-shell";
import { buildMetadata } from "@/config/metadata";
import {
  AdminPageHeader,
  AdminTablePattern,
} from "@/features/admin/components/admin-page-patterns";
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

        <AdminTablePattern
          state="error"
          emptyTitle="No low-stock alerts"
          emptyDescription="Inventory alerts will appear here as product stock drops."
          errorDescription="We could not load inventory records right now."
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

        <AdminTablePattern
          // data-driven: no low-stock alerts found
          state="empty"
          emptyTitle="No low-stock alerts"
          emptyDescription="Inventory alerts will appear here as product stock drops."
          errorDescription="We could not load inventory records right now."
        />
      </PageShell>
    );
  }

  // Ready state: render a simple table of low-stock items instead of the
  // placeholder pattern. Keep the UI minimal — this can be replaced with a
  // richer data table component later.
  return (
    <PageShell className="gap-8">
      <AdminPageHeader
        eyebrow="Inventory"
        title="Low stock overview"
        description="See products that may need restocking before customers are impacted."
      />

      <div className="overflow-auto rounded-md border">
        <table className="min-w-full divide-y divide-muted-foreground">
          <thead className="bg-muted-foreground/5 text-left text-sm font-semibold">
            <tr>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">SKU</th>
              <th className="px-4 py-2">On hand</th>
              <th className="px-4 py-2">Safety</th>
              <th className="px-4 py-2">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {lowStock.map((inv: any) => {
              const variant = inv.productVariant;
              const product = variant?.product;
              const onHand = (inv.quantity ?? 0) - (inv.reserved ?? 0);

              return (
                <tr key={inv.id} className="odd:bg-muted-foreground/2">
                  <td className="px-4 py-2">{product?.name ?? "—"}</td>
                  <td className="px-4 py-2">{variant?.sku ?? "—"}</td>
                  <td className="px-4 py-2">{onHand}</td>
                  <td className="px-4 py-2">{inv.safetyStock ?? 0}</td>
                  <td className="px-4 py-2">{inv.location ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
