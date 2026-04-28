# AI Blog Content Model

## Goal

Keep blog content SEO-ready, English-first, locale-safe, and compatible with a future admin workflow.

## Current implementation surface

- Feature entrypoint: `src/features/blog/index.ts`
- DB query layer: `src/server/db/blog-queries.ts`
- Data helpers: `src/features/blog/service.ts`
- Structured data helpers: `src/features/blog/seo.ts`
- Routes:
  - `src/app/(storefront)/blog/page.tsx`
  - `src/app/(storefront)/blog/[slug]/page.tsx`
- Admin routes:
  - `src/app/(admin)/admin/blog/page.tsx`
  - `src/app/(admin)/admin/blog/[postId]/edit/page.tsx`

## Model constraints

`BlogPost` supports:

- `title`, `slug`, `excerpt`, `content`, `coverImage`, `status`, `publishedAt`, `seo`, `locale`
- Locales currently allowed: `en`, `ur`
- Storefront currently serves `en` only

## Publishing rules

- Only `published` items with `publishedAt <= now` are visible on storefront routes.
- `draft` and `archived` are hidden by default.
- Slugs must be lowercase kebab-case.

## SEO workflow notes

- Route metadata uses `toBlogMetadataInput()` before `buildMetadata()`.
- Listing emits `CollectionPage` and `ItemList` JSON-LD.
- Post page emits `BlogPosting` and `BreadcrumbList` JSON-LD.

## Extension guidance

- Prefer extending the service API over reading direct Prisma queries in route UI.
- Preserve typed content blocks unless migrating to a sanitizer-backed rich text/MDX flow.
- Reuse shared admin SEO section for any future content entities.
