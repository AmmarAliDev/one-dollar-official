# Coding Conventions

## General Rules
- Use TypeScript everywhere.
- Prefer server components by default; add client components only when interactivity is required.
- Keep modules small, typed, and feature-oriented.
- Do not leak raw internal errors to the UI.

## Architecture Conventions
- `src/app` owns routing and high-level composition only.
- `src/components` contains shared presentational and layout building blocks.
- `src/features/<feature>` should own feature-specific UI, validation, and orchestration.
- `src/server` is reserved for server-only services, repositories, and integrations.
- `src/config` is the source of truth for routes, env defaults, metadata, and feature flags.

## Styling Conventions
- Use Tailwind utilities with shared design tokens from `src/app/globals.css`.
- Follow shadcn/ui-compatible patterns for reusable primitives.
- Keep styles composable through `cn()` from `src/lib/utils`.

## Documentation Conventions
- Record deferred work explicitly with `TODO` markers or docs notes.
- Update `docs/ai/task-status.md` after each major step.
- Keep AI-facing docs concise and token-efficient.
