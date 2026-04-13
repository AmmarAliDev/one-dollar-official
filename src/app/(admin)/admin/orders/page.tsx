import { PageShell } from "@/components/layout/page-shell";
import { buildMetadata } from "@/config/metadata";
import {
  AdminPageHeader,
  AdminTablePattern,
} from "@/features/admin/components/admin-page-patterns";

export const metadata = buildMetadata({
  title: "Admin Orders",
  path: "/admin/orders",
  description: "Orders list placeholder with consistent admin table pattern.",
});

export default function AdminOrdersPage() {
  return (
    <PageShell className="gap-8">
      <AdminPageHeader
        eyebrow="Orders"
        title="Order queue"
        description="Track new, paid, and fulfilled orders through one clear list."
      />

      <AdminTablePattern
        state="empty"
        emptyTitle="No orders to process"
        emptyDescription="Orders will show here as soon as checkout confirms payment."
        errorDescription="We could not load order records right now."
      />
    </PageShell>
  );
}
