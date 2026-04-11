import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";

export const metadata = buildMetadata({
  title: "Sign In Placeholder",
  path: "/auth/sign-in",
  description: "Authentication foundation placeholder for future email and social login flows.",
});

export default function SignInPage() {
  return (
    <PageShell className="max-w-3xl gap-6 rounded-[var(--radius-card)] border border-border/70 bg-card/95 p-4 shadow-[var(--shadow-soft)] sm:p-6">
      <SectionHeader
        eyebrow="Auth preview"
        title="Sign-in flow reserved for the next phase"
        description="The route structure and visual shell are ready, but real authentication logic is intentionally deferred."
      />

      <Card>
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            Planned next step
          </Badge>
          <CardTitle>Auth foundation checklist</CardTitle>
          <CardDescription>
            Email/password, Google SSO, and protected session utilities will land later.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <ul className="space-y-2 list-inside list-disc text-muted-foreground">
            <li>Typed validators and friendly form errors</li>
            <li>Secure session strategy for App Router</li>
            <li>Role-aware protection for admin routes</li>
          </ul>
        </CardContent>
      </Card>

      <EmptyState
        title="No live sign-in form yet"
        description="This phase focuses on the visual foundation only. Real auth flows will be connected in a dedicated prompt."
        action={
          <Link href={routes.storefront.home} className={buttonVariants({ variant: "outline" })}>
            Back to storefront
          </Link>
        }
      />
    </PageShell>
  );
}
