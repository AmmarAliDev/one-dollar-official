import Link from "next/link";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { PriceDisplay } from "@/components/ui/price-display";
import { normalizeCatalogImageUrl } from "@/features/catalog/lib/product-image-url";

import type { DealSpotlightSection } from "../types";

type DealSpotlightSectionProps = {
  section: DealSpotlightSection;
};

export function DealSpotlightSectionBlock({ section }: DealSpotlightSectionProps) {
  const spotlightImageUrl = normalizeCatalogImageUrl(section.image?.url);

  return (
    <PageContainer as="section" className="py-8">
      <Card className="overflow-hidden bg-card text-card-foreground shadow-(--shadow-soft)">
        {spotlightImageUrl ? (
          <div className="relative aspect-16/7 w-full border-b bg-muted">
            <Image
              src={spotlightImageUrl}
              alt={section.image?.alt ?? section.title}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ) : null}
        <CardHeader className="gap-3">
          <Badge className="w-fit">{section.dealLabel}</Badge>
          <CardTitle className="text-2xl">{section.title}</CardTitle>
          <CardDescription>{section.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <PriceDisplay amount={section.price} compareAt={section.compareAt} size="lg" />
          <Link href={section.ctaHref} className={buttonVariants({ size: "lg" })}>
            {section.ctaLabel}
          </Link>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
