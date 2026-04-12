import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { PriceDisplay } from "@/components/ui/price-display";

import type { DealSpotlightSection } from "../types";

type DealSpotlightSectionProps = {
  section: DealSpotlightSection;
};

export function DealSpotlightSectionBlock({ section }: DealSpotlightSectionProps) {
  return (
    <PageContainer as="section" className="py-8">
      <Card className="from-primary/10 to-card overflow-hidden bg-gradient-to-r">
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
