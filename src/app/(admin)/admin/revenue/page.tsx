import { PageShell } from "@/components/layout/page-shell";
import { buildMetadata } from "@/config/metadata";
import {
  AdminListPattern,
  AdminPageHeader,
} from "@/features/admin/components/admin-page-patterns";

export const metadata = buildMetadata({
  title: "Admin Revenue",
  path: "/admin/revenue",
  description: "Revenue placeholder page with a consistent admin list pattern.",
});

export default function AdminRevenuePage() {
  return (
    <PageShell className="gap-8">
      <AdminPageHeader
        eyebrow="Revenue"
        title="Revenue summary"
        description="A simple revenue timeline and summary cards will appear here soon."
      />

      <AdminListPattern
        state="empty"
        emptyTitle="No revenue data yet"
        emptyDescription="Revenue metrics will become available after first completed orders."
        errorDescription="We could not load revenue data right now."
      />
    </PageShell>
  );
}
