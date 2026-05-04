import Link from "next/link";
import Image from "next/image";

import { buttonVariants } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { normalizeCatalogImageUrl } from "@/features/catalog/lib/product-image-url";
import { cn } from "@/lib/utils";

import type { HeroBannerSection } from "../types";

type HeroBannerSectionProps = {
  section: HeroBannerSection;
};

export function HeroBannerSectionBlock({ section }: HeroBannerSectionProps) {
  const heroImageUrl = normalizeCatalogImageUrl(section.image?.url);

  return (
    <PageContainer as="section" className="py-10 sm:py-12">
      <div className="border-4 border-banner bg-background rounded-xl p-6 shadow-(--shadow-soft) sm:p-8">
        <div className={cn("mx-auto gap-6", heroImageUrl ? "grid max-w-5xl items-center lg:grid-cols-[1fr_360px]" : "max-w-3xl")}>
          <div className="space-y-4">
            {section.eyebrow ? (
              <p className="text-foreground text-sm font-medium tracking-wide uppercase">{section.eyebrow}</p>
            ) : null}

            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">{section.headline}</h1>
            <p className="text-border text-base sm:text-lg">{section.description}</p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href={section.primaryCtaHref} className={buttonVariants({ variant: "default", className: "bg-amber-400" })}>
                {section.primaryCtaLabel}
              </Link>
              {section.secondaryCta ? (
                <Link
                  href={section.secondaryCta.href}
                  className={cn(buttonVariants({ variant: "outline" }), "bg-background")}
                >
                  {section.secondaryCta.label}
                </Link>
              ) : null}
            </div>
          </div>

          {heroImageUrl ? (
            <div className="relative aspect-4/3 overflow-hidden rounded-lg border bg-muted">
              <Image
                src={heroImageUrl}
                alt={section.image?.alt ?? section.headline}
                fill
                sizes="(min-width: 1024px) 360px, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}
