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
| `APP_SECRET`               | Conditionally required          | Add before enabling a sensitive server-side integration that calls `getRequiredServerEnv("APP_SECRET")` |

If a required or invalid value is detected, the app throws a readable `CONFIG_ERROR` with guidance for updating `.env.local`.

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
