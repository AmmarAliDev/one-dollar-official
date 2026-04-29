import Link from "next/link";
import { Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";
import { PriceDisplay } from "@/components/ui/price-display";
import { SectionHeader } from "@/components/ui/section-header";

import type { OneDollarSection } from "../types";

type OneDollarSectionProps = {
  section: OneDollarSection;
};

/**
 * Renders the One Dollar homepage section.
 *
 * Products are hydrated at runtime from the live catalog (price ≤ ONE_DOLLAR_MAX_PRICE_PKR)
 * and therefore always reflect current inventory. The section shows an empty state when
 * no qualifying products are available.
 */
export function OneDollarSectionBlock({ section }: OneDollarSectionProps) {
  const hasProducts = section.products.length > 0;
  const headerDescription = section.description ? { description: section.description } : undefined;

  return (
    <PageContainer as="section" className="space-y-6 py-8">
      <SectionHeader title={section.title} eyebrow="Best value" {...headerDescription} />

      {hasProducts ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.products.map((product) => (
              <Card key={product.id}>
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{product.name}</CardTitle>
                    {product.badge ? (
                      <Badge variant="secondary" className="shrink-0">
                        {product.badge}
                      </Badge>
                    ) : null}
                  </div>
                  {product.description ? (
                    <CardDescription>{product.description}</CardDescription>
                  ) : null}
                </CardHeader>
                <CardContent className="space-y-4">
                  <PriceDisplay
                    amount={product.price}
                    size="sm"
                    {...(typeof product.compareAt === "number" ? { compareAt: product.compareAt } : undefined)}
                  />
                  <Link
                    href={product.href}
                    className="text-primary text-sm font-medium hover:underline"
                    aria-label={`View ${product.name}`}
                  >
                    View product
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* "View all" CTA — links to the full One Dollar category listing */}
          <div className="flex justify-center pt-2">
            <Link href={section.ctaHref} className={buttonVariants({ variant: "outline" })}>
              {section.ctaLabel}
            </Link>
          </div>
        </>
      ) : (
        <EmptyState
          icon={Tag}
          title="One Dollar deals coming soon"
          description={section.placeholderMessage}
          action={
            <Link href={section.ctaHref} className="text-primary text-sm font-medium hover:underline">
              {section.ctaLabel}
            </Link>
          }
        />
      )}
    </PageContainer>
  );
}
