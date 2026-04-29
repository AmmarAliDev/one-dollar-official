import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";

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
import { SectionHeader } from "@/components/ui/section-header";
import { routes } from "@/config/routes";

import type { FeaturedCategoriesSection } from "../types";
import {
  HOMEPAGE_CAROUSEL_ITEM_CLASS,
  HOMEPAGE_CAROUSEL_MAX_ITEMS,
  HOMEPAGE_CAROUSEL_OPTIONS,
} from "./homepage-carousel-config";

type FeaturedCategoriesSectionProps = {
  section: FeaturedCategoriesSection;
};

export function FeaturedCategoriesSectionBlock({ section }: FeaturedCategoriesSectionProps) {
  const headerDescription = section.description
    ? { description: section.description }
    : undefined;

  // Cap display at HOMEPAGE_CAROUSEL_MAX_ITEMS; overflow triggers the View All link.
  const visibleCategories = section.categories.slice(0, HOMEPAGE_CAROUSEL_MAX_ITEMS);
  const isCapped = section.categories.length > HOMEPAGE_CAROUSEL_MAX_ITEMS;
  const hasCategories = visibleCategories.length > 0;

  // Resolve View All link: prefer admin-supplied href, fall back to category route.
  const viewAllHref = section.viewAllHref ?? routes.storefront.categories;
  const viewAllLabel = section.viewAllLabel ?? "View all categories";
  const showViewAll = isCapped || Boolean(section.viewAllHref);

  return (
    <PageContainer as="section" className="space-y-6 py-8">
      <SectionHeader title={section.title} eyebrow="Explore" {...headerDescription} />

      {hasCategories ? (
        <>
          <Carousel opts={HOMEPAGE_CAROUSEL_OPTIONS} className="w-full">
            <CarouselContent>
              {visibleCategories.map((category) => (
                <CarouselItem key={category.id} className={HOMEPAGE_CAROUSEL_ITEM_CLASS}>
                  <Link
                    href={category.href}
                    className="group focus-visible:ring-ring block h-full rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    aria-label={`Browse ${category.title} category`}
                  >
                    <Card className="h-full transition-transform duration-200 group-hover:-translate-y-0.5">
                      <CardHeader>
                        <CardTitle>{category.title}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <span className="text-primary inline-flex items-center gap-1 text-sm font-medium">
                          <span className="transition-[text-decoration-color] group-hover:underline">Browse category</span>
                          <ArrowRight
                            className="size-4 transition-transform group-hover:translate-x-1"
                            aria-hidden="true"
                          />
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

          {showViewAll && (
            <div className="flex justify-center pt-2">
              <Link href={viewAllHref} className={buttonVariants({ variant: "outline" })}>
                {viewAllLabel}
              </Link>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={Layers}
          title="Categories coming soon"
          description="We are preparing curated category collections for this section."
          action={
            <Link href={routes.storefront.categories} className="text-primary text-sm font-medium hover:underline">
              Browse all categories
            </Link>
          }
        />
      )}
    </PageContainer>
  );
}
