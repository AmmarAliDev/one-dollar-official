import { PageShell } from "@/components/layout/page-shell";
import { buildMetadata } from "@/config/metadata";
import {
  AdminListPattern,
  AdminPageHeader,
} from "@/features/admin/components/admin-page-patterns";

export const metadata = buildMetadata({
  title: "Admin Settings",
  path: "/admin/settings",
  description: "Admin settings placeholder with a consistent list pattern.",
});

export default function AdminSettingsPage() {
  return (
    <PageShell className="gap-8">
      <AdminPageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description="Permissions, integrations, and preference controls will be organized here."
      />

      <AdminListPattern
        state="empty"
        emptyTitle="No settings configured yet"
        emptyDescription="Settings options will become available as modules are enabled."
        errorDescription="We could not load settings right now."
      />
    </PageShell>
  );
}
