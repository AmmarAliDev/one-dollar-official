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

## Environment
The scaffold currently uses these public defaults:
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_DEFAULT_CITY`
- `NEXT_PUBLIC_ENABLE_ADMIN`
- `NEXT_PUBLIC_ENABLE_AUTH`

More strict validation is intentionally deferred to the next engineering-standards step.

## Verification
```bash
pnpm lint
pnpm test
pnpm build
```
