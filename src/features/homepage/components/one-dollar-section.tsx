import Link from "next/link";
import { Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";
import { PriceDisplay } from "@/components/ui/price-display";
import { SectionHeader } from "@/components/ui/section-header";

import type { OneDollarSection } from "../types";
import {
  HOMEPAGE_CAROUSEL_ITEM_CLASS,
  HOMEPAGE_CAROUSEL_MAX_ITEMS,
  HOMEPAGE_CAROUSEL_OPTIONS,
} from "./homepage-carousel-config";

type OneDollarSectionProps = {
  section: OneDollarSection;
};

/**
 * Renders the One Dollar homepage section.
 *
 * Products are hydrated at runtime from the live catalog (price ≤ ONE_DOLLAR_MAX_PRICE_PKR)
 * and therefore always reflect current inventory. The section shows an empty state when
 * no qualifying products are available.
 *
 * Up to HOMEPAGE_CAROUSEL_MAX_ITEMS products are shown in a carousel; the section's
 * ctaHref/ctaLabel "View All" link always appears below the carousel.
 */
export function OneDollarSectionBlock({ section }: OneDollarSectionProps) {
  // Cap display at HOMEPAGE_CAROUSEL_MAX_ITEMS so the carousel stays manageable.
  const visibleProducts = section.products.slice(0, HOMEPAGE_CAROUSEL_MAX_ITEMS);
  const hasProducts = visibleProducts.length > 0;
  const headerDescription = section.description ? { description: section.description } : undefined;

  return (
    <PageContainer as="section" className="space-y-6 py-8">
      <SectionHeader title={section.title} eyebrow="Best value" {...headerDescription} />

      {hasProducts ? (
        <>
          <Carousel opts={HOMEPAGE_CAROUSEL_OPTIONS} className="w-full">
            <CarouselContent>
              {visibleProducts.map((product) => (
                <CarouselItem key={product.id} className={HOMEPAGE_CAROUSEL_ITEM_CLASS}>
                  <Link
                    href={product.href}
                    className="group focus-visible:ring-ring block h-full rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    aria-label={`View ${product.name}`}
                  >
                    <Card className="h-full transition-transform duration-200 group-hover:-translate-y-0.5">
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
                        <span className="text-primary text-sm font-medium transition-[text-decoration-color] group-hover:underline">
                          View product
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Nav buttons hide themselves on mobile and also when scroll is not possible */}
            <CarouselPrevious className="hidden size-10 sm:flex disabled:hidden" />
            <CarouselNext className="hidden size-10 sm:flex disabled:hidden" />
          </Carousel>

          {/* "View all" CTA — always shown so users can reach the full One Dollar category */}
          <div className="flex justify-center pt-2">
            <Link href={section.ctaHref} className={buttonVariants({ variant: "outline" })}>
              {section.ctaLabel}
            </Link>
          </div>
        </>
      ) : (
        <EmptyState
          icon={Tag}
          title="No One Dollar deals right now"
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
