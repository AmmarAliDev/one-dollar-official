import { Boxes, FileSliders, PackageSearch, ShoppingBag } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PriceDisplay } from "@/components/ui/price-display";
import { SectionHeader } from "@/components/ui/section-header";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Admin Placeholder",
  path: "/admin",
  description: "Starter admin surface for future catalog, order, and content management modules.",
});

const adminCards = [
  {
    title: "Orders queue",
    value: "0 waiting",
    description: "Status cards and workflows will plug into this shell later.",
  },
  {
    title: "Revenue placeholder",
    value: "PKR 0",
    description: "Real reporting stays deferred until order data exists.",
  },
  {
    title: "Content readiness",
    value: "Preview only",
    description: "Homepage and SEO controls will reuse the same admin shell.",
  },
];

export default function AdminPage() {
  return (
    <PageShell className="gap-8">
      <SectionHeader
        eyebrow="Admin foundation"
        title="Operations dashboard placeholder"
        description="The sidebar and topbar structure are now in place for future role-aware catalog, order, and content workflows."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {adminCards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardDescription>{card.title}</CardDescription>
              <CardTitle>{card.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section id="orders" className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <Badge variant="secondary" className="w-fit">
              Fulfillment preview
            </Badge>
            <CardTitle>Revenue and order summaries can slot in here later.</CardTitle>
            <CardDescription>
              The shell is intentionally data-free for now, but the layout pattern is ready.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-[var(--radius)] border border-border/70 bg-muted/35 p-4">
              <p className="text-muted-foreground text-sm">Revenue placeholder</p>
              <PriceDisplay amount={0} />
            </div>
          </CardContent>
        </Card>

        <EmptyState
          icon={ShoppingBag}
          title="No live orders yet"
          description="Order intake, packing workflows, and audit logging remain deferred until the data and auth layers are added."
        />
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section id="catalog">
          <EmptyState
            icon={Boxes}
            title="Catalog tools are reserved"
            description="Product, category, and inventory forms will plug into this panel in later prompts."
          />
        </section>
        <section id="content">
          <EmptyState
            icon={FileSliders}
            title="Content controls are reserved"
            description="Homepage sections, banners, and SEO controls will reuse the same layout and state primitives."
          />
        </section>
      </div>

      <section id="search">
        <EmptyState
          icon={PackageSearch}
          title="Search and data tables are still pending"
          description="This admin step adds the visual shell only, not real table logic or database-backed operations."
        />
      </section>
    </PageShell>
  );
}
