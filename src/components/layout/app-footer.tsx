import Link from "next/link";

import { shouldRenderGuardedSurface } from "@/config/production-visibility";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

import { Badge } from "../ui/badge";
import { PageContainer } from "../ui/page-container";

const companyLinks = [
  { title: "About", href: routes.storefront.about },
  { title: "Contact", href: routes.storefront.contact },
  ...(shouldRenderGuardedSurface("footerPreviewLink")
    ? [{ title: "Storefront Preview", href: routes.storefront.preview }]
    : []),
];

const policyLinks = [
  { title: "Privacy", href: routes.storefront.privacy },
  { title: "Terms", href: routes.storefront.terms },
  { title: "Shipping Policy", href: routes.storefront.shippingPolicy },
  { title: "Return Policy", href: routes.storefront.returnPolicy },
];

export function AppFooter() {
  const showNewsletterPlaceholder = shouldRenderGuardedSurface("footerNewsletterPlaceholder");

  return (
    <footer className="border-border/70 bg-background/95 border-t">
      <PageContainer className="grid gap-6 py-8 md:grid-cols-3">
        <div className="space-y-3">
          <Badge variant="outline">{siteConfig.defaultCity} launch focus</Badge>
          <div>
            <p className="text-base font-semibold tracking-tight">{siteConfig.name}</p>
            <p className="text-muted-foreground max-w-xl text-sm">
              Karachi-first storefront shell for a single-vendor commerce experience in Pakistan.
              Product catalog and checkout workflows are intentionally deferred to upcoming prompts.
            </p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-medium">Company</p>
          <div className="flex flex-wrap gap-2">
            {companyLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground rounded-full border border-border/70 px-3 py-1.5 transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </div>

          <p className="mt-4 font-medium">Policies</p>
          <div className="flex flex-wrap gap-2">
            {policyLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground rounded-full border border-border/70 px-3 py-1.5 transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-medium">Newsletter</p>
          {showNewsletterPlaceholder ? (
            <>
              <p className="text-muted-foreground">
                Newsletter signup will be connected in a later content and marketing prompt.
              </p>
              <div className="bg-muted/40 rounded-[var(--radius)] border border-dashed border-border px-3 py-4">
                <p className="text-xs font-medium">Placeholder</p>
                <p className="text-muted-foreground text-xs">
                  Email capture form and consent copy are intentionally deferred.
                </p>
              </div>
              <p className="text-muted-foreground text-xs">
                For now, customer inquiries can use the contact page placeholder.
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">
              Contact support for updates on newsletter availability.
            </p>
          )}
        </div>
      </PageContainer>
    </footer>
  );
}
