import Link from "next/link";
import { ArrowRight, CircleHelp, LayoutDashboard, ShieldCheck, Sparkles } from "lucide-react";

import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { PreviewToastButton } from "@/components/layout/preview-toast-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";
import { PriceDisplay } from "@/components/ui/price-display";
import { SectionHeader } from "@/components/ui/section-header";
import { CardSkeleton } from "@/components/ui/skeleton";
import { env } from "@/config/env";
import { featureFlags } from "@/config/feature-flags";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";

export const metadata = buildMetadata({
  title: "UI Foundation",
  path: "/",
  description: "Visual foundation preview for the Karachi-first single-vendor e-commerce app.",
});

const foundationHighlights = [
  {
    title: "Accessible theme system",
    description: "System, light, and dark modes are now available through one shared toggle.",
    icon: ShieldCheck,
  },
  {
    title: "Reusable primitives",
    description: "Page containers, badges, prices, and UX states now follow one shared language.",
    icon: Sparkles,
  },
  {
    title: "Shared shells",
    description: "Storefront and admin layouts use consistent spacing, responsive structure, and safe placeholders.",
    icon: LayoutDashboard,
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      <main id="main-content" className="flex-1">
        <PageContainer className="grid gap-8 py-[var(--space-section)] lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <section className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Phase 1 — UI foundation</Badge>
              <Badge variant="outline">{env.defaultCity} launch context</Badge>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                A cleaner visual foundation for storefront and admin.
              </h1>
              <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
                This step focuses on theme switching, design tokens, reusable UI states, and
                polished shells without building product or checkout features yet.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={routes.storefront.preview} className={buttonVariants()}>
                Preview storefront shell
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={routes.admin.dashboard}
                className={buttonVariants({ variant: "outline" })}
              >
                Open admin placeholder
              </Link>
              <PreviewToastButton />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {foundationHighlights.map(({ title, description, icon: Icon }) => (
                <Card key={title}>
                  <CardContent className="space-y-3 p-5">
                    <div className="bg-primary/10 text-primary w-fit rounded-2xl p-2.5" aria-hidden="true">
                      <Icon className="size-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold tracking-tight">{title}</p>
                      <p className="text-muted-foreground text-sm">{description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Card className="overflow-hidden">
            <CardHeader>
              <Badge variant="secondary" className="w-fit">
                Design system preview
              </Badge>
              <CardTitle>Reusable commerce-ready building blocks</CardTitle>
              <CardDescription>
                Future category, product, and checkout screens can reuse the same tokens and state
                patterns.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[var(--radius)] border border-border/70 bg-muted/35 p-4">
                <p className="text-muted-foreground text-sm">Sample price treatment</p>
                <PriceDisplay amount={1299} compareAt={1599} size="lg" />
                <p className="text-muted-foreground mt-2 text-xs">
                  Standardized for the Pakistan-focused storefront experience.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Loading skeleton example</p>
                <CardSkeleton />
              </div>
            </CardContent>
          </Card>
        </PageContainer>

        <PageContainer as="section" id="why-one-dollar" className="space-y-6 pb-[var(--space-section)]">
          <SectionHeader
            eyebrow="Why this step matters"
            title="The app now has a repeatable visual language."
            description="The foundation stays intentionally simple, so later product, auth, and admin features can plug into the same patterns."
          />

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Theme-aware by default</CardTitle>
                <CardDescription>
                  Users can follow their system preference or switch manually without visual mismatch.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Responsive shell</CardTitle>
                <CardDescription>
                  Storefront and admin layouts now adapt cleanly from mobile to desktop.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Frontend feedback ready</CardTitle>
                <CardDescription>
                  Shared toasts are now available for future add-to-cart, auth, and admin actions.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </PageContainer>

        <PageContainer as="section" id="ui-foundation" className="space-y-6 pb-[var(--space-section)]">
          <SectionHeader
            eyebrow="What is intentionally deferred"
            title="The foundation is ready, but business features remain out of scope."
            description="This prompt does not add product pages, real auth, or checkout logic. It prepares the shared UI surface for those later steps."
            actions={
              <Link
                href={routes.auth.signIn}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Open auth placeholder
              </Link>
            }
          />

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Current foundation snapshot</CardTitle>
                <CardDescription>
                  Centralized config and feature flags still control what is visible in this preview.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="info">Admin preview: {String(featureFlags.adminPreview)}</Badge>
                  <Badge variant="info">Auth preview: {String(featureFlags.authPreview)}</Badge>
                </div>
                <p className="text-muted-foreground">
                  The app is ready for future catalog cards, customer account pages, and admin data
                  tables without duplicating styling logic.
                </p>
              </CardContent>
            </Card>

            <EmptyState
              icon={CircleHelp}
              title="No product catalog yet"
              description="Product listings, PDPs, and commerce workflows are intentionally postponed until the next feature prompts."
              action={
                <Link
                  href={routes.admin.dashboard}
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  Review admin shell
                </Link>
              }
            />
          </div>
        </PageContainer>
      </main>

      <AppFooter />
    </div>
  );
}
