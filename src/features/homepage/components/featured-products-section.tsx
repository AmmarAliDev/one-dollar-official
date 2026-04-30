import Link from "next/link";
import { ShoppingBag } from "lucide-react";

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

import type { FeaturedProductsSection } from "../types";
import {
  HOMEPAGE_CAROUSEL_ITEM_CLASS,
  HOMEPAGE_CAROUSEL_MAX_ITEMS,
  HOMEPAGE_CAROUSEL_OPTIONS,
} from "./homepage-carousel-config";

type FeaturedProductsSectionProps = {
  section: FeaturedProductsSection;
};

export function FeaturedProductsSectionBlock({ section }: FeaturedProductsSectionProps) {
  const headerDescription = section.description
    ? { description: section.description }
    : undefined;

  // Cap display at HOMEPAGE_CAROUSEL_MAX_ITEMS; overflow triggers the View All link.
  const visibleProducts = section.products.slice(0, HOMEPAGE_CAROUSEL_MAX_ITEMS);
  const isCapped = section.products.length > HOMEPAGE_CAROUSEL_MAX_ITEMS;
  const hasProducts = visibleProducts.length > 0;

  // View All is shown when items were capped or an explicit href was provided.
  const showViewAll = isCapped || Boolean(section.viewAllHref);
  const viewAllLabel = section.viewAllLabel ?? "View all products";

  return (
    <PageContainer as="section" className="space-y-6 py-8">
      <SectionHeader title={section.title} eyebrow="Top picks" {...headerDescription} />

      {hasProducts ? (
        <>
          <Carousel opts={HOMEPAGE_CAROUSEL_OPTIONS} className="w-full">
            <CarouselContent>
              {visibleProducts.map((product) => (
                <CarouselItem key={product.id} className={HOMEPAGE_CAROUSEL_ITEM_CLASS}>
                  <Card className="h-full">
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-base">{product.name}</CardTitle>
                        {product.badge ? <Badge variant="success">{product.badge}</Badge> : null}
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
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Nav buttons hide themselves on mobile and also when scroll is not possible */}
            <CarouselPrevious className="hidden size-10 sm:flex disabled:hidden" />
            <CarouselNext className="hidden size-10 sm:flex disabled:hidden" />
          </Carousel>

          {showViewAll && section.viewAllHref && (
            <div className="flex justify-center pt-2">
              <Link href={section.viewAllHref} className={buttonVariants({ variant: "outline" })}>
                {viewAllLabel}
              </Link>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title="No featured products yet"
          description="Featured products will appear here when this section is configured."
        />
      )}
    </PageContainer>
  );
}
