# UI Conventions

## Design System Foundations

- Global design tokens live in `src/app/globals.css` and cover semantic colors, spacing, radii, and shadows.
- Reusable primitives should prefer `src/components/ui/*` instead of page-specific styling.
- Use `PageContainer` and `PageShell` for consistent horizontal rhythm and section spacing.

## Theme and Feedback

- Theme selection supports `system`, `light`, and `dark` through `next-themes`.
- Shared frontend notifications should use `notify.*()` from `src/lib/notify.ts`.
- Keep theme-dependent visuals tied to semantic tokens like `bg-card`, `text-muted-foreground`, and `border-border`.

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

## Product Listing Conventions (Prompt 3.3)

- Category discovery lives at `/categories`, while individual listing pages live at `/categories/[slug]` for clean, SEO-friendly storefront URLs.
- `src/features/catalog/components/product-grid-card.tsx` is the reusable catalog card; keep product price, compare price, stock badge, and review summary placeholder logic there.
- Listing filter UI should remain server-render-friendly and query-string-based until a later prompt requires richer client interactivity.
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

## Form System Conventions

- Shared app-wide form abstractions now live in `src/components/forms` and should be preferred for new client-side forms.
- Start new forms with `useAppForm()` so Zod + React Hook Form defaults stay consistent and validation runs on change.
- Prefer `DynamicForm` / `SchemaForm` for standard CRUD and settings forms; drop down to explicit field composition only when layout or behavior truly needs it.
- Field-level errors should render under the relevant control, while top-level validation summaries can use `FormErrorSummary` for broader feedback.
- Reuse the shared shadcn-style form primitives in `src/components/ui` (`Input`, `Textarea`, `Select`, `Checkbox`, `Switch`) instead of raw ad-hoc control markup.
- Keep form copy short, task-focused, and user-safe. Do not expose raw backend or schema internals in validation messages.

## Deferred Items

- Product detail pages, cart interactions, and auth forms are intentionally deferred.
- Future features should compose the current primitives instead of duplicating layout and state styling.
