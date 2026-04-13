import { PageShell } from "@/components/layout/page-shell";
import { buildMetadata } from "@/config/metadata";
import {
  AdminListPattern,
  AdminPageHeader,
} from "@/features/admin/components/admin-page-patterns";

export const metadata = buildMetadata({
  title: "Admin Activity",
  path: "/admin/activity",
  description: "View recent team and system activity.",
});
export default function AdminActivityPage() {
  return (
    <PageShell className="gap-8">
      <AdminPageHeader
        eyebrow="Recent activity"
        title="Team and system activity"
        description="A single chronological feed helps non-technical users follow what changed."
      />

      <AdminListPattern
        state="empty"
        emptyTitle="No recent events"
        emptyDescription="Activity logs will appear here once tracking is enabled."
        errorDescription="We could not load activity records right now."
      />
    </PageShell>
  );
}
