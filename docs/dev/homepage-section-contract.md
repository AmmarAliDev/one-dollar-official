# Homepage Section Contract

This project now uses a section-based homepage foundation that is ready for CMS/admin wiring.

## Purpose

- Keep homepage composition modular.
- Allow future admin controls to reorder, enable/disable, and update section payloads without route rewrites.
- Ensure storefront still renders safely when CMS content is missing.

## Current Section Kinds

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

## Resolution Rules

Resolution logic is in `src/features/homepage/resolver.ts`.

- If CMS payload is `null`, `undefined`, or has no sections, fallback content is used.
- If all CMS sections are disabled (`enabled: false`), fallback content is used.
- Otherwise, only enabled CMS sections render.
- Sections are sorted by `displayOrder` first, then by static kind order:
  1. `hero-banner`
  2. `featured-categories`
  3. `featured-products`
  4. `deal-spotlight`
  5. `blog-highlights`

## Rendering Model

Rendering map is in `src/features/homepage/section-components.tsx`.

- `SECTION_COMPONENTS` maps each `kind` to a dedicated section block component.
- `renderHomepageSection()` renders blocks through the registry.
- `hasRegisteredSectionComponent()` supports test assertions for registry coverage.

Section components are located in `src/features/homepage/components/`.

## Service Layer Stub

`src/features/homepage/service.ts` defines the server-side loading seam:

- `fetchHomepageContentFromCms()`: currently returns `null` and logs that CMS is not yet configured.
- `getHomepageContent()`: resolves CMS payload through fallback-aware rules.

When CMS/admin module is added, replace the internals of `fetchHomepageContentFromCms()` while preserving `HomepageContent` contract.
