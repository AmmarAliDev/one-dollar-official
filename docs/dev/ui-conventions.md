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

## Deferred Items

- Product detail pages, cart interactions, and auth forms are intentionally deferred.
- Future features should compose the current primitives instead of duplicating layout and state styling.
