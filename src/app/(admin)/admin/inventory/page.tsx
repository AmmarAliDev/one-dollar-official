import { PageShell } from "@/components/layout/page-shell";
import { buildMetadata } from "@/config/metadata";
import {
  AdminPageHeader,
  AdminTablePattern,
} from "@/features/admin/components/admin-page-patterns";

export const metadata = buildMetadata({
  title: "Admin Inventory",
  path: "/admin/inventory",
  description: "Inventory and low-stock placeholder using the shared admin table pattern.",
});

export default function AdminInventoryPage() {
  return (
    <PageShell className="gap-8">
      <AdminPageHeader
        eyebrow="Inventory"
        title="Low stock overview"
        description="See products that may need restocking before customers are impacted."
      />

      <AdminTablePattern
        state="empty"
        emptyTitle="No low-stock alerts"
        emptyDescription="Inventory alerts will appear here as product stock drops."
        errorDescription="We could not load inventory records right now."
      />
    </PageShell>
  );
}
