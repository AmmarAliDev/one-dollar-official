import Link from "next/link";
import Image from "next/image";
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
        <ul className="grid gap-4 md:grid-cols-3" aria-label="Homepage blog highlights">
          {section.articles.map((article) => (
            <li key={article.id} className="list-none">
              <article className="h-full">
                <Link
                  href={article.href}
                  className="focus-visible:ring-ring group block h-full overflow-hidden rounded-(--radius-card) border-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  aria-label={`Read article: ${article.title}`}
                >
                  {article.image ? (
                    <Image
                      src={article.image.src}
                      alt={article.image.alt}
                      width={article.image.width}
                      height={article.image.height}
                      sizes="(max-width: 767px) 100vw, 33vw"
                      className="bg-muted h-48 w-full object-contain transition-transform duration-200 group-hover:scale-[1.01]"
                    />
                  ) : (
                    <div
                      className="bg-muted text-muted-foreground flex h-48 w-full items-center justify-center text-xs font-medium uppercase tracking-[0.16em]"
                      aria-hidden="true"
                    >
                      Blog image unavailable
                    </div>
                  )}

                  <div className="space-y-2 p-4">
                    <h3 className="text-base font-semibold tracking-tight transition-colors group-hover:text-primary">{article.title}</h3>
                    <p className="text-muted-foreground line-clamp-3 text-sm">{article.excerpt}</p>
                    <span className="text-primary inline-flex text-sm font-medium group-hover:underline">Read article</span>
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ul>
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
