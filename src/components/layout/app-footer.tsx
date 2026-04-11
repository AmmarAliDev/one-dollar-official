import Link from "next/link";

import { siteConfig } from "@/config/site";

import { Badge } from "../ui/badge";
import { PageContainer } from "../ui/page-container";

export function AppFooter() {
  return (
    <footer className="border-border/70 bg-background/95 border-t">
      <PageContainer className="grid gap-6 py-8 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <Badge variant="outline">{siteConfig.defaultCity} launch focus</Badge>
          <div>
            <p className="text-base font-semibold tracking-tight">{siteConfig.name}</p>
            <p className="text-muted-foreground max-w-xl text-sm">
              A polished storefront and admin foundation for a single-vendor commerce experience in
              Pakistan, with business features intentionally deferred to future steps.
            </p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-medium">Quick links</p>
          <div className="flex flex-wrap gap-2">
            {siteConfig.storefrontNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground rounded-full border border-border/70 px-3 py-1.5 transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">
            Catalog, checkout, auth, and data integrations are documented as deferred work for later
            prompts.
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
