import Link from "next/link";
import { ArrowRight, FileText, ShieldCheck, Store } from "lucide-react";

import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { PageShell } from "@/components/layout/page-shell";
import { PlaceholderPanel } from "@/components/layout/placeholder-panel";
import { buttonVariants } from "@/components/ui/button";
import { env } from "@/config/env";
import { featureFlags } from "@/config/feature-flags";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";

export const metadata = buildMetadata({
  title: "Architecture Foundation",
  path: "/",
  description:
    "Initial production-ready architecture scaffold for a Karachi-first single-vendor e-commerce app.",
});

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <PageShell className="flex-1 gap-8 py-12">
        <div className="space-y-4">
          <div className="border-border bg-card text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
            <ShieldCheck className="size-3.5" />
            Step 0.1 — architecture only, no business logic yet
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Production-ready e-commerce foundation for Karachi, Pakistan.
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
            The codebase is now organized for shared storefront, admin, and auth surfaces with
            theming, route placeholders, centralized config, and documentation for future prompts.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={routes.storefront.preview} className={buttonVariants()}>
            Preview storefront shell
            <ArrowRight className="size-4" />
          </Link>
          <Link href={routes.admin.dashboard} className={buttonVariants({ variant: "outline" })}>
            Open admin placeholder
          </Link>
          <Link href={routes.auth.signIn} className={buttonVariants({ variant: "outline" })}>
            Open auth placeholder
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <PlaceholderPanel
            eyebrow="Storefront"
            title="Customer-facing shell"
            description="Prepared for product discovery, cart, checkout, and SEO-first content."
            items={[
              "Route group placeholder ready",
              `Launch city pinned to ${env.defaultCity}`,
              "Dark and light theme support wired",
            ]}
          />
          <PlaceholderPanel
            eyebrow="Admin"
            title="Single codebase operations area"
            description="Reserved for order, product, and content management workflows."
            items={[
              `Admin preview enabled: ${String(featureFlags.adminPreview)}`,
              "Typed configuration strategy added",
              "Future RBAC hooks documented",
            ]}
          />
          <PlaceholderPanel
            eyebrow="Docs"
            title="Copilot- and developer-friendly continuity"
            description="AI and human docs now describe structure, conventions, and deferred items."
            items={[
              "docs/ai/project-overview.md",
              "docs/ai/coding-conventions.md",
              "docs/dev/architecture.md",
            ]}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
            <div className="text-primary mb-3 flex items-center gap-2 text-sm font-medium">
              <Store className="size-4" />
              Architecture goals
            </div>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>• Shared patterns for storefront and admin within one repository</li>
              <li>• Safe placeholders for error boundaries, loading states, and not-found flows</li>
              <li>• Token-efficient docs to keep future prompts consistent and fast</li>
            </ul>
          </div>

          <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
            <div className="text-primary mb-3 flex items-center gap-2 text-sm font-medium">
              <FileText className="size-4" />
              Deferred intentionally
            </div>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>• Product catalog, cart, checkout, and payment integrations</li>
              <li>• Authentication providers and role-based permissions</li>
              <li>• Database, CMS, analytics, and notification services</li>
            </ul>
          </div>
        </div>
      </PageShell>
      <AppFooter />
    </div>
  );
}
