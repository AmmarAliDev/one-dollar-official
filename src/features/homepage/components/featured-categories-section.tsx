import Link from "next/link";
import { Layers } from "lucide-react";

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
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={category.href}
                      className="text-primary text-sm font-medium hover:underline"
                      aria-label={`Browse ${category.title} category`}
                    >
                      Browse category
                    </Link>
                  </CardContent>
                </Card>
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
