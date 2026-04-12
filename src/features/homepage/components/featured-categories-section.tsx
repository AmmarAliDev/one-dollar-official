import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/section-header";

import type { FeaturedCategoriesSection } from "../types";

type FeaturedCategoriesSectionProps = {
  section: FeaturedCategoriesSection;
};

export function FeaturedCategoriesSectionBlock({ section }: FeaturedCategoriesSectionProps) {
  const headerDescription = section.description
    ? { description: section.description }
    : undefined;

  return (
    <PageContainer as="section" className="space-y-6 py-8">
      <SectionHeader title={section.title} eyebrow="Explore" {...headerDescription} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {section.categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.title}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={category.href} className="text-primary text-sm font-medium hover:underline">
                Browse category
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
