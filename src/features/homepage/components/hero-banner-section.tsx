import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { cn } from "@/lib/utils";

import type { HeroBannerSection } from "../types";

type HeroBannerSectionProps = {
  section: HeroBannerSection;
};

export function HeroBannerSectionBlock({ section }: HeroBannerSectionProps) {
  return (
    <PageContainer as="section" className="py-10 sm:py-12">
      <div className="border-4 border-banner bg-background rounded-xl p-6 shadow-(--shadow-soft) sm:p-8">
        <div className="mx-auto max-w-3xl space-y-4">
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
      </div>
    </PageContainer>
  );
}
