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
- Use `EmptyState`, `LoadingState`, and `ErrorState` for predictable UX patterns.
- Use `Skeleton`, `CardSkeleton`, and `PageSkeleton` while content is loading.
- Use `PriceDisplay` and `Badge` instead of ad-hoc inline styling for storefront metadata.

## Accessibility Notes

- Keep semantic landmarks in place: `header`, `nav`, `main`, `section`, and `footer`.
- Preserve visible focus states and `aria-label` support on interactive controls.
- Prefer server components by default; only use client components for interactivity like theme switching and toast triggers.

## Deferred Items

- Product listing cards, cart interactions, and auth forms are intentionally deferred.
- Future features should compose the current primitives instead of duplicating layout and state styling.
