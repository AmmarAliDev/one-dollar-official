# UI Conventions

## Design System Foundations

- Global design tokens live in `src/app/globals.css` and cover semantic colors, spacing, radii, and shadows.
- Reusable primitives should prefer `src/components/ui/*` instead of page-specific styling.
- Use `PageContainer` and `PageShell` for consistent horizontal rhythm and section spacing.

## Theme and Feedback

- Theme selection supports `system`, `light`, and `dark` through `next-themes`.
- Shared frontend notifications should use `notify.*()` from `src/lib/notify.ts`.
- Keep theme-dependent visuals tied to semantic tokens like `bg-card`, `text-muted-foreground`, and `border-border`.
- Current palette baseline:
	- Light theme anchor colors: `--background: #ffffff`, `--primary: #431b52`
	- Dark theme anchor colors: `--background: #000000`, `--primary: #431b52`
- Avoid hardcoded one-off hex values in feature components. Prefer semantic tokens so palette updates remain centralized and safe.
- Keep overlays, menus, and dialogs on semantic surfaces (`bg-popover`, `bg-card`) and preserve readable foreground contrast.

## Surface Consistency Rules

- Forms should rely on shared input controls (`Input`, `Textarea`, `Select`) that bind to semantic classes (`bg-background`, `text-foreground`, `border-input`, `focus:ring-ring`).
- Cards and table containers should keep semantic surface classes and shared elevation tokens (`--shadow-soft`, `--shadow-elevated`) for consistent depth across desktop and mobile.
- Navigation surfaces (sidebar and mobile nav) should use semantic hover/active states (`bg-muted`, `bg-accent`, `bg-primary/*`) instead of custom ad-hoc colors.
- Confirmation and high-impact dialogs should keep backdrop contrast strong enough for readability while preserving focus and keyboard behavior.

## UI State Patterns

- Use `SectionHeader` for page and section intros.
- Use `PageErrorFallback` for route-level or page-level failures and `SectionErrorState` for isolated modules that should fail without collapsing the whole screen.
- Use `FormErrorSummary` for validation feedback above forms; prefer friendly user-safe copy from `toUserMessage()` / `getFormErrorMessages()`.
- Use `EmptyState`, `LoadingState`, and `InlineSpinner` for predictable empty and loading feedback.
- Use `Skeleton`, `CardSkeleton`, `PageSkeleton`, and `TableSkeleton` while content is loading.
- Use `ConfirmationDialog` for destructive or high-impact actions instead of browser-native confirm prompts.
- Use `PriceDisplay` and `Badge` instead of ad-hoc inline styling for storefront metadata.

## Accessibility Notes

- Keep semantic landmarks in place: `header`, `nav`, `main`, `section`, and `footer`.
- Preserve visible focus states and `aria-label` support on interactive controls.
- Error summaries and page fallbacks should keep `role="alert"` / `aria-live` semantics so assistive tech announces important failures clearly.
- Prefer server components by default; only use client components for interactivity like theme switching, toast triggers, and confirmation dialogs.

## Storefront Navigation (Prompt 3.1)

- `AppHeader` now provides required storefront actions: logo, search trigger placeholder, account, wishlist, and cart links.
- Desktop and mobile navigation share the same `siteConfig.storefrontNav` source to avoid duplicated link logic.
- Mobile navigation behavior lives in `src/components/layout/storefront-mobile-nav.tsx` and must keep `aria-expanded`, `aria-controls`, and a labeled toggle button.
- `AppFooter` now has three sections: company links, policy links, and a newsletter placeholder block.
- Static storefront placeholders live under `src/app/(storefront)` for `/about`, `/contact`, `/privacy`, `/terms`, `/shipping-policy`, and `/return-policy`.

## Homepage Carousel Conventions

- Homepage category surfaces should use the shared shadcn-compatible carousel primitives in `src/components/ui/carousel.tsx` instead of bespoke slider logic.
- Featured category cards should use responsive carousel basis classes so card density scales with viewport width (`basis-[85%]`, `sm:basis-1/2`, `lg:basis-1/3`, `xl:basis-1/4`).
- Keep carousel controls keyboard accessible and touch-friendly: swipe/drag remains the primary interaction on mobile, while previous/next icon controls are shown on wider screens.
- Empty category payloads must render a user-safe `EmptyState` instead of a blank section.

## Product Listing Conventions (Prompt 3.3)

- Category discovery lives at `/categories`, while individual listing pages live at `/categories/[slug]` for clean, SEO-friendly storefront URLs.
- `src/features/catalog/components/product-grid-card.tsx` is the reusable catalog card; keep product price, compare price, stock badge, and review summary placeholder logic there.
- Listing filter UI should remain query-string-based, but it should now use the shared form layer for consistent labels, validation, and reset/apply actions.
- Use the shared empty and loading primitives for listing states instead of bespoke skeleton or empty-state markup.
- Treat variant-aware attributes as an additive scaffold for now; future implementation should extend the current filter contract instead of replacing it.

## Admin UX Conventions

- Keep admin copy plain-language and operational (for example: "Order queue" or "Low stock overview") so non-technical operators can understand screens quickly.
- Admin routes should use one shared shell with four predictable surfaces: sidebar navigation, topbar, breadcrumb, and user menu.
- Sidebar navigation must be role-aware. Only show destinations the signed-in role can access, instead of showing disabled or dead-end links.
- Every admin page should start with the shared page header pattern (`AdminPageHeader`) for consistent title, summary, and optional actions.
- Use `AdminTablePattern` for record-first screens (orders, inventory) and `AdminListPattern` for timeline/log-first screens (activity, summaries).
- Prefer explicit empty/loading/error states over blank placeholders:
	- Empty: `EmptyState`
	- Loading: `LoadingState` + `TableSkeleton` where tabular data is expected
	- Error: `PageErrorFallback` for route-level failures and `SectionErrorState` for module-level failures
- Keep admin actions discoverable in the top-right area (theme toggle, storefront shortcut, user menu) and avoid hidden critical controls.
- Use the shared shadcn-style sidebar primitives in `src/components/ui/sidebar.tsx` (`SidebarProvider`, `Sidebar`, `SidebarInset`, `SidebarTrigger`) for app-level admin navigation shells. This keeps desktop collapse and mobile drawer behavior consistent across future admin modules.
- Keep role-aware rendering in feature-level nav modules (for example `getVisibleAdminNavigation`) and pass only visible links into sidebar UI components.
- If a role resolves to zero sidebar links, render a user-friendly empty sidebar status instead of a blank panel.

## Form System Conventions

- Shared app-wide form abstractions now live in `src/components/forms` and should be preferred for new client-side forms.
- Start new forms with `useAppForm()` so Zod + React Hook Form defaults stay consistent and validation runs on change.
- Prefer `DynamicForm` / `SchemaForm` for standard CRUD and settings forms; drop down to explicit field composition only when layout or behavior truly needs it.
- Use `useServerActionSubmit()` when a client-side RHF form still needs to submit through a Next server action and redirect safely afterward.
- Do not swallow redirect-style server action responses inside client submit helpers. Let Next handle the navigation, and use the helper's optional success callback when a dialog or drawer form needs to close and reset after a non-redirect save.
- Field-level errors should render under the relevant control, while top-level validation summaries should use `FormErrorSummary` for broader feedback.
- Reuse the shared shadcn-style form primitives in `src/components/ui` (`Input`, `Textarea`, `Select`, `Checkbox`, `Switch`) instead of raw ad-hoc control markup.
- Current baseline: auth forms, checkout, admin category/product forms, and query-string filter forms should all follow this shared pattern.
- Keep form copy short, task-focused, and user-safe. Do not expose raw backend or schema internals in validation messages.

## Shared Data Table Conventions

- Use the shared TanStack table system in `src/components/data-table` for all new tabular UIs in admin and storefront-support tooling.
- Start with `DataTable` and `createDataTableColumnHelper<T>()` from `@/components/data-table` to keep column typing consistent.
- Keep feature-specific search/filter controls outside the table and pass them into the `toolbar` prop so query/filter concerns stay modular.
- Use built-in state patterns instead of custom table placeholders:
	- loading: `loading` + optional `loadingRows`/`loadingColumns`
	- empty: `emptyState`
	- module error: `errorState` or `renderErrorState`
- Use `rowActions` for per-row controls (edit/delete/view) and avoid embedding action buttons directly into every feature table body.
- Keep pagination architecture table-driven:
	- local pagination works by default
	- server pagination can be wired by providing `pagination` (`state`, `onPaginationChange`, `pageCount`)
	- custom pagination UI can be injected via `renderPagination`
- For responsive behavior, keep wide tables inside the default horizontal overflow wrapper provided by `src/components/ui/table.tsx`.
- Keep column headers descriptive and plain-language so sorting labels remain accessible.
- Feature-specific table components should wrap the shared `DataTable` with typed columns, cell rendering, and feature-specific actions (see `AdminProductsTable`, `AdminCategoriesTable`, `AdminOrdersTable`, `AdminInventoryTable` for reference patterns).
- Current standard tables now use the shared system: admin products, categories, orders, and inventory. Not all UIs benefit from tabular display; keep card-based layouts for moderation workflows (admin reviews) and storefront experiences (customer order history, wishlist) where readability and action density favor non-table patterns.

## Product Content Entry Guidelines

- Titles should be shopper-facing and specific. Prefer names like "Daily Face Wash" or "Classic Tee" over internal codes.
- Slugs must stay lowercase with single hyphens only. Keep them stable after publishing for SEO consistency.
- Short descriptions should answer "What is this and why should someone buy it?" in one or two lines.
- Use the full description for benefits, usage instructions, size details, or care notes.
- For simple products, fill the standard SKU, price, and stock fields and leave the variant rows empty.
- For variant-based products, turn on the variant toggle and enter one row per sellable option combination with its own SKU, price, and stock.
- Variant titles should be human-friendly, such as "Small / Blue" or "500ml / Lemon".
- Specifications should use plain labels customers recognize, such as Material, Size, or Fragrance.
- Product, banner, blog cover, and SEO image URL fields should use the shared `AdminImageUploadInput` so admins can upload directly while still retaining manual URL entry.
- Keep image form payload contracts stable by persisting final uploaded values back into the same string URL fields already used by server actions.
- Add alt text for important images so listings remain accessible and easier to manage later.
- Keep SEO titles under 70 characters and SEO descriptions under 160 characters. Reuse the strongest shopper-facing language instead of keyword stuffing.

## Deferred Items

- Non-image file uploads, multi-step wizards, and async remote field validation are still intentionally deferred.
- Future features should compose the current primitives instead of duplicating layout and state styling.
