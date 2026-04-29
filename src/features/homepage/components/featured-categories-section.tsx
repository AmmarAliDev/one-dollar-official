import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";

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
import { FEATURED_CATEGORIES_CAROUSEL_ITEM_CLASS, FEATURED_CATEGORIES_CAROUSEL_OPTIONS } from "./featured-categories-carousel-config";

type FeaturedCategoriesSectionProps = {
  section: FeaturedCategoriesSection;
};

export function FeaturedCategoriesSectionBlock({ section }: FeaturedCategoriesSectionProps) {
  const headerDescription = section.description
    ? { description: section.description }
    : undefined;
  const hasCategories = section.categories.length > 0;

  return (
    <PageContainer as="section" className="space-y-6 py-8">
      <SectionHeader title={section.title} eyebrow="Explore" {...headerDescription} />

      {hasCategories ? (
        <Carousel opts={FEATURED_CATEGORIES_CAROUSEL_OPTIONS} className="w-full">
          <CarouselContent>
            {section.categories.map((category) => (
              <CarouselItem key={category.id} className={FEATURED_CATEGORIES_CAROUSEL_ITEM_CLASS}>
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

          <CarouselPrevious className="hidden size-10 sm:flex" />
          <CarouselNext className="hidden size-10 sm:flex" />
        </Carousel>
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
