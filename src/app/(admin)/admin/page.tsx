import { PageShell } from "@/components/layout/page-shell";
import { PlaceholderPanel } from "@/components/layout/placeholder-panel";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Admin Placeholder",
  path: "/admin",
  description: "Starter admin surface for future catalog, order, and content management modules.",
});

export default function AdminPage() {
  return (
    <PageShell>
      <div className="space-y-3">
        <p className="text-primary text-sm font-medium">Admin route group placeholder</p>
        <h1 className="text-3xl font-semibold tracking-tight">Operations dashboard foundation</h1>
        <p className="text-muted-foreground max-w-2xl">
          This page reserves the admin surface inside the shared codebase without implementing
          business workflows yet.
        </p>
      </div>

      <PlaceholderPanel
        eyebrow="Deferred"
        title="Admin modules will land in later prompts"
        description="The scaffold is ready for role-aware pages, tables, forms, and audit trails."
        items={[
          "Catalog and inventory management",
          "Order operations and status workflows",
          "Homepage and SEO content controls",
        ]}
      />
    </PageShell>
  );
}
