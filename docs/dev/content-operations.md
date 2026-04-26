# Content Operations

## Scope

This guide documents operational workflows for database-backed storefront content with the current focus on blog posts.

## Blog content source of truth

- Blog content now lives in the `BlogPost` Prisma model (`blog_post` table).
- Storefront blog routes (`/blog`, `/blog/[slug]`) read from DB only.
- Legacy hardcoded content has been migrated into a Prisma migration seed insert and is no longer used at runtime.

## Admin blog workflow

- Admin entrypoint: `/admin/blog`
- Edit route: `/admin/blog/[postId]/edit`
- Supported fields:
  - `title`
  - `slug`
  - `excerpt`
  - `contentJson` (array of supported content blocks)
  - `coverImageUrl`, `coverImageAlt`, `coverImageWidth`, `coverImageHeight`
  - `status` (`DRAFT`, `PUBLISHED`, `ARCHIVED`)
  - `publishedAt`
  - SEO fields (`seoTitle`, `seoDescription`, `seoCanonicalUrl`, `seoOgTitle`, `seoOgDescription`, `seoImageUrl`, `seoNoIndex`, `seoSchemaNotes`)

## Publish visibility rules

- Storefront defaults:
  - Show only `PUBLISHED` posts
  - Hide `DRAFT` and `ARCHIVED`
  - Hide scheduled posts where `publishedAt` is in the future
- Internal/admin preview helpers can opt into non-public visibility via `includeDrafts`.

## Error handling and safety

- Slug collisions are mapped to user-friendly admin errors.
- Validation rejects malformed slugs, invalid content JSON, invalid publish date values, and malformed URL/path fields.
- Admin mutations enforce trusted-origin checks and RBAC (`admin:access` + `catalog:write`).

## Cache invalidation

After blog create/update/delete mutations:

- Revalidate `/blog`
- Revalidate dynamic blog detail route pattern (`/blog/[slug]`, page scope)
- Revalidate `/admin/blog`

## Current limitations and planned improvements

- Content editor currently expects structured JSON blocks in a textarea.
- Rich-text/MDX editor UX is intentionally deferred.
- Locale-specific blog route strategy (for example localized prefixes) is still deferred.
