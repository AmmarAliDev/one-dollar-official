import Link from "next/link";
import { Newspaper } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { routes } from "@/config/routes";

import type { BlogHighlightsSection } from "../types";

type BlogHighlightsSectionProps = {
  section: BlogHighlightsSection;
};

export function BlogHighlightsSectionBlock({ section }: BlogHighlightsSectionProps) {
  const headerDescription = section.description
    ? { description: section.description }
    : undefined;

  return (
    <PageContainer as="section" className="space-y-6 py-8 pb-[var(--space-section)]">
      <SectionHeader title={section.title} eyebrow="Content" {...headerDescription} />

      <EmptyState
        icon={Newspaper}
        title="Blog highlights coming soon"
        description={section.placeholderMessage}
        action={
          <Link href={routes.storefront.about} className="text-primary text-sm font-medium hover:underline">
            Learn more about One Dollar
          </Link>
        }
      />
    </PageContainer>
  );
}
