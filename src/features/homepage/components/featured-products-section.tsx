import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { PriceDisplay } from "@/components/ui/price-display";
import { SectionHeader } from "@/components/ui/section-header";

import type { FeaturedProductsSection } from "../types";

type FeaturedProductsSectionProps = {
  section: FeaturedProductsSection;
};

export function FeaturedProductsSectionBlock({ section }: FeaturedProductsSectionProps) {
  const headerDescription = section.description
    ? { description: section.description }
    : undefined;

  return (
    <PageContainer as="section" className="space-y-6 py-8">
      <SectionHeader title={section.title} eyebrow="Top picks" {...headerDescription} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {section.products.map((product) => (
          <Card key={product.id}>
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base">{product.name}</CardTitle>
                {product.badge ? <Badge variant="success">{product.badge}</Badge> : null}
              </div>
              <CardDescription>Campaign slot ready for admin-managed featured products.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PriceDisplay
                amount={product.price}
                size="sm"
                {...(typeof product.compareAt === "number" ? { compareAt: product.compareAt } : undefined)}
              />
              <Link href={product.href} className="text-primary text-sm font-medium hover:underline">
                View product
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
