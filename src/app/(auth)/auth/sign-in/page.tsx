import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { PlaceholderPanel } from "@/components/layout/placeholder-panel";
import { buttonVariants } from "@/components/ui/button";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";

export const metadata = buildMetadata({
  title: "Sign In Placeholder",
  path: "/auth/sign-in",
  description: "Authentication foundation placeholder for future email and social login flows.",
});

export default function SignInPage() {
  return (
    <PageShell className="max-w-3xl">
      <div className="space-y-3">
        <p className="text-primary text-sm font-medium">Auth route group placeholder</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Sign-in flow reserved for the next phase
        </h1>
        <p className="text-muted-foreground">
          The route structure and shared layout are in place, but real authentication logic is
          intentionally deferred.
        </p>
      </div>

      <PlaceholderPanel
        eyebrow="Next step"
        title="Auth foundation checklist"
        description="Later prompts can plug in email/password, Google SSO, and protected session utilities."
        items={[
          "Typed validators and friendly error states",
          "Secure session strategy for App Router",
          "Role-aware protection for admin routes",
        ]}
      />

      <div>
        <Link href={routes.storefront.home} className={buttonVariants({ variant: "outline" })}>
          Back to storefront
        </Link>
      </div>
    </PageShell>
  );
}
