# Local Setup

## Prerequisites

- Node.js 20+
- `pnpm` 10+

## Install

```bash
pnpm install
cp .env.example .env.local
```

## Run the app

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Environment Variables

Validation is centralized in `src/config/env.ts`, and the safe shared config snapshot is exposed from `src/config/app-config.ts`.

| Variable                   | Required                        | Purpose                                                                                                 |
| -------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`      | Yes for non-default deployments | Public base URL used by metadata and preview surfaces                                                   |
| `NEXT_PUBLIC_DEFAULT_CITY` | No                              | Launch-city label for the current Karachi-first storefront scaffold                                     |
| `NEXT_PUBLIC_ENABLE_ADMIN` | No                              | Enables or disables the admin preview placeholder                                                       |
| `NEXT_PUBLIC_ENABLE_AUTH`  | No                              | Enables or disables the auth preview placeholder                                                        |
| `DATABASE_URL`             | Yes for Prisma workflows        | PostgreSQL connection string used by Prisma CLI commands and server-side database access                |
| `APP_SECRET`               | Conditionally required          | Add before enabling a sensitive server-side integration that calls `getRequiredServerEnv("APP_SECRET")` |

If a required or invalid value is detected, the app throws a readable `CONFIG_ERROR` with guidance for updating `.env.local`.

## Database Workflow

- Run `pnpm prisma:validate` after schema edits.
- Use `pnpm prisma:migrate:dev` for local schema changes.
- Keep application queries behind `src/server/db` and feature-level repositories instead of importing Prisma directly into route handlers.
- See `docs/dev/database-access.md` for the repository/service/transaction pattern.

## Code Quality Workflow

Run these commands before opening or merging work:

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Use `pnpm test:watch` during local iteration.

## UI Foundation Checks

During local development, verify these manual flows:
- theme toggle switches between `system`, `light`, and `dark`
- storefront shell loads at `/` and `/preview`
- admin shell placeholder loads at `/admin`
- toast preview button on `/preview` (Storefront Preview page header) renders a frontend notification

See `docs/dev/ui-conventions.md` for the current design-system usage rules.
