# Blog Foundation Guide

## Purpose

This milestone introduces an SEO-ready storefront blog with an English-first content model and a migration-safe path for future Urdu support and admin publishing.

## Routes

- `/blog` for listing published posts
- `/blog/[slug]` for article detail

## Current data source

The blog now uses Prisma-backed content (`BlogPost` model / `blog_post` table).

Published pages consume helper functions from `src/features/blog/service.ts`, which reads DB rows through `src/server/db/blog-queries.ts`.

## Content model

`BlogPost` currently supports:

- `title`
- `slug`
- `excerpt`
- `content` (typed blocks: paragraph, heading, list, quote)
- `coverImage`
- `status` (`draft`, `published`, `archived`)
- `publishedAt`
- `seo` fields:
  - `metaTitle`
  - `metaDescription`
  - `canonicalUrl`
  - `ogTitle`
  - `ogDescription`
  - `ogImage`
  - `noIndex`
  - `structuredDataNotes`
- `locale` (`en` now; `ur` reserved for next phase)

## SEO behavior

- Listing and post metadata are generated through `buildMetadata()` using `toBlogMetadataInput()`.
- `/blog` emits `CollectionPage` + `ItemList` JSON-LD.
- `/blog/[slug]` emits `BlogPosting` JSON-LD and `BreadcrumbList` JSON-LD.
- Draft and archived posts are excluded from storefront listing and slug rendering by default.

## Related posts behavior

Current behavior returns latest same-locale published posts excluding the current slug.

This is intentionally simple and deterministic for now so ranking logic can be replaced later by category/tag affinity or engagement signals.

## Future admin editing path

Admin blog CRUD is now available at `/admin/blog` and `/admin/blog/[postId]/edit`.

Current implementation:

1. Stores blog fields in Prisma `BlogPost` with unique `(locale, slug)` pairs for stable locale-scoped `/blog/[slug]` routes.
2. Reuses shared SEO admin controls from `src/features/admin/components/admin-seo-section.tsx`.
3. Uses server-side validation for slug rules, JSON content blocks, publish dates, and URL/path fields.
4. Persists audit entries for create/update/delete events.
5. Revalidates storefront and admin blog routes after mutations.

## Intentional deferrals

- Urdu storefront route strategy (for example `/ur/blog`)
- Rich markdown/MDX editor and sanitization pipeline (current editor uses structured JSON blocks)
