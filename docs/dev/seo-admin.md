# Admin SEO Management Guide

## Purpose

The admin now uses one reusable SEO section for category and product forms, with the same pattern ready for future blog posts and key pages.

This keeps content entry consistent for non-technical team members and reduces one-off SEO field implementations.

## Supported fields

- page address (slug)
- meta title
- meta description
- canonical URL override
- OG title
- OG description
- OG image
- noindex toggle
- structured data notes

## How admins should fill these fields

### Slug

- Keep it short, readable, and stable.
- Use lowercase words separated by hyphens.
- Good example: `daily-face-wash`
- Avoid changing it after publishing unless necessary.

### Meta title

- Use the product or category name first.
- Add a brand or store suffix only if it helps clarity.
- Keep it concise so search engines do not cut it off.

### Meta description

- Write one natural sentence that explains why the page matters.
- Focus on customer value, not keyword stuffing.
- Good examples mention the use case, audience, or buying benefit.

### Canonical URL override

- Leave this blank for normal pages.
- Only use it when multiple URLs point to similar content and one must be treated as the main version.

### Social sharing fields

- OG title and OG description are optional.
- Use them when the shared preview should differ from the search result text.
- Add an OG image for higher-priority campaigns or pages that may be shared externally.

### Noindex

- Turn this on only for duplicate, temporary, or internal-only pages.
- Do not enable it on important category or product pages meant to rank.

### Structured data notes

- Use this to leave practical notes for future schema markup work.
- Example notes: FAQ ideas, product facts worth marking up, review proof points, or merchant details.

## Validation and conflict handling

- Slugs are validated for lowercase, hyphenated format.
- Reserved storefront paths are blocked.
- Duplicate slug conflicts return clear admin-safe messages so staff can adjust the page address quickly.
- The preview panel highlights title and description lengths when they run long.

## Reuse pattern for future content types

When blog post admin or key-page admin CRUD is added later, reuse:

- `src/features/admin/components/admin-seo-section.tsx`
- `src/features/admin/seo/schema.ts`

Do not duplicate SEO field definitions per feature unless a content type has a truly unique requirement.

## Intentional current limitation

Storefront catalog pages still rely on seeded fallback data in the current milestone.

That means the admin SEO fields are now persisted and ready for content operations, but full live storefront metadata output from admin-managed catalog records will be connected when the catalog moves fully onto persisted data.

## Product SEO content generator (admin product form)

The product form now includes a built-in SEO content helper focused on practical, simple English copy for Pakistan shoppers.

### What it generates

- product title improvement suggestions
- SEO title
- meta description
- short description
- product highlights
- FAQ ideas
- structured specification suggestions
- internal linking suggestions
- suggested slug

### UX behavior

- The helper shows a loading state while generating.
- If product title is missing, a user-friendly error is shown.
- If no generation has run yet, an explicit empty state is shown.
- Admins can apply generated SEO fields directly to slug/meta/OG/schema notes.
- Admins can apply generated short description separately.

### Why deterministic now

This step intentionally uses a deterministic local generator in the admin feature module. It avoids external provider dependency during product-entry workflows while still producing consistent, editable first drafts.

Future AI-provider integration can be added behind this seam without changing admin form structure.
