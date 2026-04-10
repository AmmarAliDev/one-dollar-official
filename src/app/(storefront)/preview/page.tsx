import { PageShell } from "@/components/layout/page-shell";
import { PlaceholderPanel } from "@/components/layout/placeholder-panel";
import { buildMetadata } from "@/config/metadata";
import { env } from "@/config/env";

export const metadata = buildMetadata({
  title: "Storefront Preview",
  path: "/preview",
  description:
    "Customer-facing placeholder shell for the Karachi-first storefront architecture.",
});

export default function StorefrontPreviewPage() {
  return (
    <PageShell>
      <div className="space-y-3">
        <p className="text-sm font-medium text-primary">Storefront route group placeholder</p>
        <h1 className="text-3xl font-semibold tracking-tight">Shared storefront shell is ready</h1>
        <p className="max-w-2xl text-muted-foreground">
          This preview shows the reusable customer-facing frame, with theme support and clear space
          for future catalog, cart, and checkout work.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PlaceholderPanel
          eyebrow="Configuration"
          title="Foundation defaults"
          description="These values are centralized so later prompts can extend them safely."
          items={[
            `App URL: ${env.appUrl}`,
            `Launch city: ${env.defaultCity}`,
            "Dark and light theme support enabled",
          ]}
        />
        <PlaceholderPanel
          eyebrow="Deferred"
          title="Business modules intentionally postponed"
          description="This phase focuses on architecture only, not real commerce logic."
          items={[
            "Product catalog and category pages",
            "Cart, checkout, and COD flow",
            "Customer account and wishlist",
          ]}
        />
      </div>
    </PageShell>
  );
}
