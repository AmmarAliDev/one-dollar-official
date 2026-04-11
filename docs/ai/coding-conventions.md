# Coding Conventions

## General Rules

- Use TypeScript everywhere.
- Prefer server components by default; add client components only when interactivity is required.
- Keep modules small, typed, and feature-oriented.
- Do not leak raw internal errors to the UI; route them through `toUserMessage()` and only surface safe `AppError` messages.
- Use `createLogger()` / `logger` from `src/lib/logger.ts` instead of ad-hoc `console.*` calls when logging app failures or operational context.

## Engineering Quality Rules

- Use the shared scripts before considering a step complete: `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` when relevant.
- Keep imports grouped and ordered consistently: framework/external first, `@/` aliases next, relative imports last.
- Prefer `import type` for type-only dependencies.
- Use Prettier defaults from `prettier.config.mjs`; do not hand-format around them.

## Architecture Conventions

- `src/app` owns routing and high-level composition only.
- `src/components` contains shared presentational and layout building blocks.
- `src/features/<feature>` should own feature-specific UI, validation, and orchestration.
- `src/server` is reserved for server-only services, repositories, and integrations.
- `src/config` is the source of truth for routes, env validation, metadata, feature flags, and safe app config loading.
- Avoid direct `process.env` reads outside `src/config/env.ts`; use `env`, `loadAppConfig()`, or `getRequiredServerEnv()` instead.

## Styling Conventions

- Use Tailwind utilities with shared design tokens from `src/app/globals.css`; avoid hard-coded page-only color values when a semantic token already exists.
- Follow shadcn/ui-compatible patterns for reusable primitives.
- Prefer the shared UI wrappers before creating one-off markup:
  - `PageContainer` / `PageShell`
  - `SectionHeader`
  - `PageErrorFallback`, `SectionErrorState`, `FormErrorSummary`
  - `EmptyState`, `LoadingState`, `InlineSpinner`
  - `Badge`, `PriceDisplay`, `Skeleton`, `CardSkeleton`, `PageSkeleton`, and `TableSkeleton`
  - `ConfirmationDialog` for destructive or high-impact confirmation flows
- Keep styles composable through `cn()` from `src/lib/utils`.
- Use `notify.*()` from `src/lib/notify.ts` for frontend toast feedback instead of ad-hoc alert patterns.

## Documentation Conventions

- Record deferred work explicitly with `TODO` markers or docs notes.
- Update `docs/ai/task-status.md` after each major step.
- Keep AI-facing docs concise and token-efficient.
