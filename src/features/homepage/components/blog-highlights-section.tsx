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
  const hasArticles = section.articles.length > 0;

  return (
    <PageContainer as="section" className="space-y-6 py-8 pb-[var(--space-section)]">
      <SectionHeader title={section.title} eyebrow="Content" {...headerDescription} />

      {hasArticles ? (
        <div className="grid gap-4 md:grid-cols-3">
          {section.articles.map((article) => (
            <article key={article.id} className="bg-background rounded-(--radius-card) border-2 p-4">
              <h3 className="text-base font-semibold tracking-tight">{article.title}</h3>
              <p className="text-muted-foreground mt-2 line-clamp-3 text-sm">{article.excerpt}</p>
              <Link href={article.href} className="text-primary mt-4 inline-flex text-sm font-medium hover:underline">
                Read article
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Newspaper}
          title="No blog highlights yet"
          description={section.placeholderMessage}
          action={
            <Link href={routes.storefront.blog} className="text-primary text-sm font-medium hover:underline">
              Visit the blog
            </Link>
          }
        />
      )}
    </PageContainer>
  );
}
