import Link from "next/link";
import { Palette } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { PreviewToastButton } from "@/components/layout/preview-toast-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PriceDisplay } from "@/components/ui/price-display";
import { SectionHeader } from "@/components/ui/section-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { env } from "@/config/env";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";

export const metadata = buildMetadata({
  title: "Storefront Preview",
  path: "/preview",
  description: "Customer-facing placeholder shell for the Karachi-first storefront architecture.",
});

export default function StorefrontPreviewPage() {
  return (
    <PageShell className="gap-8">
      <SectionHeader
        eyebrow="Storefront preview"
        title="Shared storefront shell is ready for the next commerce steps."
        description="Theme support, responsive spacing, reusable state components, and frontend feedback are now available for future catalog and checkout work."
        actions={<PreviewToastButton />}
      />

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <Badge variant="secondary" className="w-fit">
              Foundation defaults
            </Badge>
            <CardTitle>Preview values are centralized and easy to extend.</CardTitle>
            <CardDescription>
              Later prompts can keep using the same tokens and route structure without reworking the
              base shell.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">App URL: {env.appUrl}</p>
            <p className="text-muted-foreground">Launch city: {env.defaultCity}</p>
            <div className="rounded-[var(--radius)] border border-border/70 bg-muted/35 p-4">
              <p className="text-muted-foreground text-sm">Sample product price treatment</p>
              <PriceDisplay amount={1299} compareAt={1499} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div>
            <p className="mb-3 text-sm font-medium">Skeleton preview</p>
            <PageSkeleton />
          </div>
        </div>
      </div>

      <EmptyState
        icon={Palette}
        title="Business modules are still intentionally deferred"
        description="Product catalog pages, cart, checkout, and customer account flows will be added later on top of this visual foundation."
        action={
          <Link href={routes.storefront.home} className={buttonVariants({ variant: "outline" })}>
            Back to foundation overview
          </Link>
        }
      />
    </PageShell>
  );
}
