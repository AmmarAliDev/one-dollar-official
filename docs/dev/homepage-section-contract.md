# Homepage Section Contract

This project now uses a section-based homepage foundation backed by admin-managed database content with fallback safety.

## Purpose

- Keep homepage composition modular.
- Allow future admin controls to reorder, enable/disable, and update section payloads without route rewrites.
- Ensure storefront still renders safely when CMS content is missing.

## Current Section Kinds

- `announcement-bar`
- `hero-banner`
- `featured-categories`
- `featured-products`
- `deal-spotlight`
- `blog-highlights`

## Type Contracts

Source of truth lives in `src/features/homepage/types.ts`:

- `HomepageSectionKind`: discriminated keys for supported blocks.
- `HomepageSection`: union type for all section payloads.
- `HomepageContent`: container payload from CMS/service.
- `HomepageContentResult`: resolved result with `source` (`cms` or `fallback`).

Each section includes:

- `id`: stable identifier.
- `kind`: section discriminator.
- `enabled?`: optional admin toggle.
- `displayOrder?`: optional ordering hint.

Admin management entrypoints now live under `/admin/homepage` with dedicated pages for:

- section content editing and ordering
- banners
- deal campaigns
- announcement-bar content via the section type or active banners

## Resolution Rules

Resolution logic is in `src/features/homepage/resolver.ts`.

- If CMS payload is `null`, `undefined`, or has no sections, fallback content is used.
- If all CMS sections are disabled (`enabled: false`), fallback content is used.
- Otherwise, only enabled CMS sections render.
- Sections are sorted by `displayOrder` first, then by static kind order:
  1. `announcement-bar`
  2. `hero-banner`
  3. `featured-categories`
  4. `featured-products`
  5. `deal-spotlight`
  6. `blog-highlights`
- Invalid content payloads are skipped safely and do not break storefront rendering.
- Scheduled records render only when the current time is inside their active window.
- Banner and deal-campaign records can contribute storefront-visible promotional blocks alongside directly managed homepage sections.

## Rendering Model

Rendering map is in `src/features/homepage/section-components.tsx`.

- `SECTION_COMPONENTS` maps each `kind` to a dedicated section block component.
- `renderHomepageSection()` renders blocks through the registry.
- `hasRegisteredSectionComponent()` supports test assertions for registry coverage.

Section components are located in `src/features/homepage/components/`.

## Service Layer

`src/features/homepage/service.ts` now resolves admin-managed content through the homepage admin module.

- `fetchHomepageContentFromCms()`: loads validated section records, active banners, and scheduled deal campaigns.
- `getHomepageContent()`: resolves those records through the fallback-aware rules.

Implementation notes:

- persistent admin records are managed from `src/features/admin/homepage`
- section config validation uses Zod before writes and again when records are read back for storefront use
- audit entries are written on section, banner, and campaign mutations
- fallback content still protects storefront availability if admin content is absent or fully disabled
