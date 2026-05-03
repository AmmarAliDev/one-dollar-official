import Link from "next/link";
import Image from "next/image";

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
    <footer className="border-border/70 bg-background-header-footer border-t text-footer-text">
      <PageContainer className="grid gap-6 py-8 md:grid-cols-3">
        <section className="space-y-3" aria-labelledby="footer-brand-heading">
          <Badge variant="outline">{siteConfig.defaultCity} launch focus</Badge>
          <div>
            <div className="flex items-center gap-2">
              <Image
                src={siteConfig.appIcon}
                alt={`${siteConfig.name} logo`}
                width={32}
                height={32}
                className="h-8 w-8 rounded-md object-contain drop-shadow-xl drop-shadow-white/30"
                sizes="32px"
              />
              <h2 id="footer-brand-heading" className="text-background font-semibold tracking-tight">
                {siteConfig.name}
              </h2>
            </div>
            <p className="text-muted max-w-xl text-sm">
              Karachi-first storefront shell for a single-vendor commerce experience in Pakistan.
              Product catalog and checkout workflows are intentionally deferred to upcoming prompts.
            </p>
          </div>
        </section>

        <section className="space-y-3 text-sm" aria-labelledby="footer-company-heading">
          <h2 id="footer-company-heading" className="font-medium">Company</h2>
          <nav aria-label="Company links">
            <ul className="flex flex-wrap gap-2">
            {companyLinks.map((item) => (
              <li key={item.href} className="list-none mb-4!">
                <Link
                  href={item.href}
                  className="text-muted hover:text-foreground hover:bg-background rounded-full border border-border/70 px-3 py-1.5 transition-colors"
                >
                  {item.title}
                </Link>
              </li>
            ))}
            </ul>
          </nav>

          <h2 className="mt-4 font-medium" id="footer-policies-heading">Policies</h2>
          <nav aria-label="Policy links">
            <ul className="flex flex-wrap gap-2">
            {policyLinks.map((item) => (
              <li key={item.href} className="list-none mb-4!">
                <Link
                  href={item.href}
                  className="text-muted hover:text-foreground hover:bg-background rounded-full border border-border/70 px-3 py-1.5 transition-colors"
                >
                  {item.title}
                </Link>
              </li>
            ))}
            </ul>
          </nav>
        </section>

        <section className="space-y-3 text-sm" aria-labelledby="footer-newsletter-heading">
          <h2 id="footer-newsletter-heading" className="font-medium">Newsletter</h2>
          {showNewsletterPlaceholder ? (
            <>
              <p className="text-muted">
                Newsletter signup will be connected in a later content and marketing prompt.
              </p>
              <div className="bg-muted/40 rounded-[var(--radius)] border border-dashed border-border px-3 py-4">
                <p className="text-xs text-background font-medium">Placeholder</p>
                <p className="text-muted text-xs">
                  Email capture form and consent copy are intentionally deferred.
                </p>
              </div>
              <p className="text-muted text-xs">
                For now, customer inquiries can use the contact page placeholder.
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">
              Contact support for updates on newsletter availability.
            </p>
          )}
        </section>
      </PageContainer>
    </footer>
  );
}
