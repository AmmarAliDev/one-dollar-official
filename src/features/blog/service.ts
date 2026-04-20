import { AppError } from "@/lib/errors/app-error";

import { blogPosts } from "./content";
import type { BlogListingItem, BlogLocale, BlogMetadataInput, BlogPost } from "./types";

const BLOG_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DEFAULT_BLOG_LOCALE: BlogLocale = "en";

type GetBlogPostsOptions = {
  locale?: BlogLocale;
  includeDrafts?: boolean;
  limit?: number;
  excludeSlug?: string;
};

type GetBlogPostBySlugOptions = {
  locale?: BlogLocale;
  includeDrafts?: boolean;
};

function toPublishedTimestamp(post: BlogPost) {
  if (!post.publishedAt) return 0;
  const timestamp = Date.parse(post.publishedAt);

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function isVisiblePost(post: BlogPost, includeDrafts: boolean) {
  if (includeDrafts) {
    return post.status !== "archived";
  }

  if (post.status !== "published") {
    return false;
  }

  return toPublishedTimestamp(post) <= Date.now();
}

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

function ensureValidSlug(slug: string) {
  if (!BLOG_SLUG_PATTERN.test(slug)) {
    throw new AppError("Invalid blog slug.", "VALIDATION_ERROR", {
      statusCode: 400,
      userMessage: "The requested article address is invalid.",
    });
  }
}

export function formatBlogPublishedDate(
  input: string | undefined,
  locale: string = DEFAULT_BLOG_LOCALE,
  fallbackLabel = "Unscheduled",
) {
  if (!input) return fallbackLabel;
  const timestamp = Date.parse(input);

  if (Number.isNaN(timestamp)) {
    return fallbackLabel;
  }

  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
}

export function getBlogPosts(options: GetBlogPostsOptions = {}): BlogListingItem[] {
  const locale = options.locale ?? DEFAULT_BLOG_LOCALE;
  const includeDrafts = options.includeDrafts ?? false;
  const limit = options.limit;
  const excludeSlug = options.excludeSlug?.trim().toLowerCase();

  const filtered = blogPosts
    .filter((post) => post.locale === locale)
    .filter((post) => isVisiblePost(post, includeDrafts))
    .filter((post) => (excludeSlug ? post.slug !== excludeSlug : true))
    .sort((a, b) => toPublishedTimestamp(b) - toPublishedTimestamp(a));

  if (typeof limit === "number" && limit > 0) {
    return filtered.slice(0, limit);
  }

  return filtered;
}

export function getBlogPostBySlug(
  slug: string,
  options: GetBlogPostBySlugOptions = {},
): BlogPost | null {
  const locale = options.locale ?? DEFAULT_BLOG_LOCALE;
  const includeDrafts = options.includeDrafts ?? false;
  const normalizedSlug = normalizeSlug(slug);

  ensureValidSlug(normalizedSlug);

  const post = blogPosts.find((entry) => entry.locale === locale && entry.slug === normalizedSlug);

  if (!post) {
    return null;
  }

  if (!isVisiblePost(post, includeDrafts)) {
    return null;
  }

  return post;
}

export function getBlogPostSlugs(locale: BlogLocale = DEFAULT_BLOG_LOCALE) {
  return getBlogPosts({ locale }).map((post) => post.slug);
}

export function getRelatedBlogPosts(post: BlogPost, limit = 3) {
  return getBlogPosts({ locale: post.locale, excludeSlug: post.slug, limit });
}

export function toBlogMetadataInput(post: BlogPost): BlogMetadataInput {
  return {
    title: post.seo.metaTitle ?? post.title,
    description: post.seo.metaDescription ?? post.excerpt,
    path: `/blog/${post.slug}`,
    ...(post.seo.canonicalUrl ? { canonicalUrl: post.seo.canonicalUrl } : {}),
    ...((post.seo.ogTitle ?? post.seo.metaTitle ?? post.title)
      ? { openGraphTitle: post.seo.ogTitle ?? post.seo.metaTitle ?? post.title }
      : {}),
    ...((post.seo.ogDescription ?? post.seo.metaDescription ?? post.excerpt)
      ? { openGraphDescription: post.seo.ogDescription ?? post.seo.metaDescription ?? post.excerpt }
      : {}),
    ...((post.seo.ogImage ?? post.coverImage.src)
      ? { openGraphImage: post.seo.ogImage ?? post.coverImage.src }
      : {}),
    noIndex: post.seo.noIndex ?? false,
  };
}
