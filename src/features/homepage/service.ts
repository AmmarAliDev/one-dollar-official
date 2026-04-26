import { getBlogPosts, type BlogListingItem } from "@/features/blog";
import { routes } from "@/config/routes";
import { loadHomepageContentForStorefront } from "@/features/admin/homepage/service";
import { createLogger } from "@/lib/logger";

import { resolveHomepageSections } from "./resolver";
import type { BlogHighlightItem, BlogHighlightsSection, HomepageContent, HomepageContentResult, HomepageSection } from "./types";

const logger = createLogger("homepage.service");
const HOMEPAGE_BLOG_HIGHLIGHTS_LIMIT = 3;

function toBlogHighlightItem(post: BlogListingItem): BlogHighlightItem {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    href: routes.storefront.blogPost(post.slug),
  };
}

function isBlogHighlightsSection(section: HomepageSection): section is BlogHighlightsSection {
  return section.kind === "blog-highlights";
}

async function hydrateHomepageBlogHighlights(sections: HomepageSection[]): Promise<HomepageSection[]> {
  const hasBlogHighlightsSection = sections.some(isBlogHighlightsSection);

  if (!hasBlogHighlightsSection) {
    return sections;
  }

  try {
    const posts = await getBlogPosts({ locale: "en", limit: HOMEPAGE_BLOG_HIGHLIGHTS_LIMIT });
    const articles = posts.map(toBlogHighlightItem);

    return sections.map((section) => {
      if (!isBlogHighlightsSection(section)) {
        return section;
      }

      return {
        ...section,
        articles,
      };
    });
  } catch (error) {
    logger.error("Failed to hydrate homepage blog highlights from BlogPost records.", error);
    return sections.map((section) => {
      if (!isBlogHighlightsSection(section)) {
        return section;
      }

      return {
        ...section,
        articles: [],
      };
    });
  }
}

export async function fetchHomepageContentFromCms(): Promise<HomepageContent | null> {
  try {
    const content = await loadHomepageContentForStorefront();

    if (!content || !content.sections?.length) {
      logger.debug("No admin-managed homepage content is available; using fallback content.");
      return null;
    }

    return content;
  } catch (error) {
    logger.error("Failed to load homepage content from admin-managed sources.", error);
    return null;
  }
}

export async function getHomepageContent(): Promise<HomepageContentResult> {
  const cmsContent = await fetchHomepageContentFromCms();
  const resolved = resolveHomepageSections(cmsContent?.sections);
  const hydratedSections = await hydrateHomepageBlogHighlights(resolved.sections);

  return {
    ...resolved,
    sections: hydratedSections,
  };
}
