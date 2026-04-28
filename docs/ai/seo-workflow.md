# AI SEO Workflow

## Goal

Use one shared admin SEO pattern for categories, products, future blog posts, and future key pages.

## Required implementation pattern

For new admin content forms:

1. Reuse the shared component in `src/features/admin/components/admin-seo-section.tsx`
2. Reuse the shared validation helpers in `src/features/admin/seo/schema.ts`
3. Preserve user-friendly field labels and validation messages
4. Keep preview behavior live and readable for non-technical operators
5. Prefer extension over duplication

## Field rules

Support the following whenever the content model allows it:

- slug
- meta title
- meta description
- canonical URL override
- OG title
- OG description
- OG image
- noindex
- structured data notes

## Copy rules for AI-generated SEO suggestions

- Keep language natural and human-readable
- Avoid keyword stuffing
- Prefer benefit-led summaries
- Keep titles concise and descriptions scannable
- Treat canonical and noindex as advanced controls, not defaults

## Validation expectations

- reject malformed slugs
- reject reserved storefront slugs
- show clear duplicate-slug conflict copy
- keep canonical and OG image inputs restricted to valid paths or URLs

## Current repository note

Catalog storefront pages are still using seeded fallback data in this milestone.

The storefront blog foundation is now live with metadata and JSON-LD wiring, but admin blog CRUD and persistence-backed publishing remain deferred.

Reuse the same SEO field contract when admin blog editing is introduced.

## Category SEO content generator

`src/features/catalog/seo/category-seo-content.ts` provides `generateCategorySeoContent(category, options?)`.

- Returns `CategorySeoContent`: title, description, introCopy, faqs, internalLinks, blogTopics, schemaNotes.
- Template-driven; no external API.  Per-slug templates for `home-care`, `grocery`, `personal-care`. Generic fallback for any other slug.
- Call with `allCategorySlugs` option to generate accurate sibling internal links.
- Deferred: dynamic content enrichment from live product data (price ranges, product counts) pending full DB-backed storefront data.
- Tests: `tests/features/catalog/category-seo-content.test.ts`.
