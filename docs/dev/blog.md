# Blog Foundation Guide

## Purpose

This milestone introduces an SEO-ready storefront blog with an English-first content model and a migration-safe path for future Urdu support and admin publishing.

## Routes

- `/blog` for listing published posts
- `/blog/[slug]` for article detail

## Current data source

The blog currently uses a typed in-repo seed (`src/features/blog/content.ts`) to keep this step modular and low-risk.

Published pages consume helper functions from `src/features/blog/service.ts` rather than reading seed data directly.

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

When admin blog CRUD is added:

1. Persist `BlogPost` fields in Prisma with locale-aware uniqueness (`locale + slug`).
2. Reuse existing shared SEO admin controls from `src/features/admin/components/admin-seo-section.tsx` and `src/features/admin/seo/schema.ts`.
3. Replace static seed resolvers in `src/features/blog/service.ts` with repository-backed reads.
4. Add a publish scheduler and validation for `publishedAt` transitions.
5. Add moderation/audit events for create/update/publish/unpublish operations.

## Intentional deferrals

- Admin blog CRUD UI and mutations
- Urdu storefront route strategy (for example `/ur/blog`)
- Rich markdown/MDX editor and sanitization pipeline
