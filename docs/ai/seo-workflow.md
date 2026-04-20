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

The admin SEO structure is therefore persistence-ready and reusable now, while direct live storefront wiring should be added later as part of persisted catalog integration rather than through ad-hoc shortcuts.
