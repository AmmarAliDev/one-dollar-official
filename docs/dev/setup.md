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
| `DATABASE_URL`             | Yes for Prisma workflows        | Main PostgreSQL connection string for local development, Prisma CLI commands, and server-side DB access |
| `POSTGRES_URL_NON_POOLING` | Recommended for Prisma Migrate  | Direct non-pooling PostgreSQL URL for Prisma migrations; for local Postgres this can match `DATABASE_URL` |
| `SHADOW_DATABASE_URL`      | Optional                        | Separate shadow database used only when `prisma migrate dev` needs one for a hosted dev setup           |
| `APP_SECRET`               | Conditionally required          | Add before enabling a sensitive server-side integration that calls `getRequiredServerEnv("APP_SECRET")` |
| `AUTH_SECRET`              | Yes outside development         | Auth.js secret for any non-development environment                                                      |

If a required or invalid value is detected, the app throws a readable `CONFIG_ERROR` with guidance for updating `.env.local`.

The Prisma scripts in this repo read local environment files and fall back to `DATABASE_URL` when `POSTGRES_URL_NON_POOLING` is omitted during local development.

## Database Workflow

### Local development

1. Point `DATABASE_URL` at your local PostgreSQL database.
2. Set `POSTGRES_URL_NON_POOLING` to the same local value, or leave it unset and let the local-safe script fall back automatically.
3. Run the local migration workflow:

```bash
pnpm prisma:validate
pnpm prisma:migrate:dev --name your_change
pnpm prisma:generate
```

### Production / deployment

- Do **not** run `prisma migrate dev` in Vercel or other hosted deployment environments.
- Use `pnpm prisma:migrate:deploy` for deployment-safe schema application.
- Use `pnpm build` for a local-safe app build.
- Use `pnpm build:deploy` when the deployment pipeline should apply Prisma migrations before the production build.

Keep application queries behind `src/server/db` and feature-level repositories instead of importing Prisma directly into route handlers. See `docs/dev/database-access.md` for the repository/service/transaction pattern.

### Prisma troubleshooting

- If `prisma migrate dev` is blocked, check whether `DATABASE_URL` points to a hosted Supabase or pooled production-like URL.
- If you intentionally use a remote development database, set `PRISMA_ALLOW_HOSTED_MIGRATE_DEV=true` for that shell session and ensure you understand the risk.
- If a hosted development database cannot create the shadow database automatically, provide `SHADOW_DATABASE_URL`.
- If you only want to verify the app build locally, use `pnpm build`; it does not run deployment migrations.

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
