# Database Access Conventions

This project now treats Prisma as a server-only dependency behind the shared `src/server/db` layer.

## Goals

- keep route handlers and server actions thin
- make repository logic transaction-friendly
- standardize pagination and result shapes
- avoid scattered `new PrismaClient()` calls or direct `process.env` coupling

## Core entrypoints

- `getPrismaClient()` returns the app-wide lazy singleton for Next.js server usage
- `runInTransaction()` always starts a new transaction from the root Prisma client
- `runWithTransaction()` reuses an existing transaction client when one is already in scope
- `normalizePagination()` and `createPaginatedResult()` standardize offset pagination behavior
- `createQuerySuccess()` / `createQueryFailure()` provide a shared typed result contract for explicit non-throw flows

## Layering rule

Use the database through three layers:

1. routes, server actions, and loaders call a service
2. services orchestrate business logic and transaction boundaries
3. repositories perform Prisma queries using the provided `db` executor

## Recommended repository pattern

```ts
import { defineRepository } from '@/server/db';

export const createProductRepository = defineRepository(({ db }) => ({
  findBySlug(slug: string) {
    return db.product.findUnique({ where: { slug } });
  },
}));
```

## Recommended service pattern

```ts
import { defineService, runWithTransaction } from '@/server/db';
import { createProductRepository } from '@/server/products/product.repository';

export const createProductService = defineService(({ db }) => {
  const products = createProductRepository(db);

  return {
    async updateProduct(input: UpdateProductInput) {
      return runWithTransaction(async (transaction) => {
        const transactionalProducts = createProductRepository(transaction);
        return transactionalProducts.update(input);
      }, db);
    },
  };
});
```

## Practical rules for future features

- Do not instantiate Prisma clients inside features, route handlers, or tests.
- Prefer repository factories that accept `db` so they can run against either the root client or a transaction.
- Keep cross-entity workflows in services, not repositories.
- Use pagination helpers for list endpoints instead of ad-hoc `skip` / `take` parsing.
- Use explicit `QueryResult` helpers only when the caller benefits from a non-throw contract; otherwise throw typed errors.
- Keep Prisma imports inside `src/server` whenever possible.

## Deferred items

- model-specific repositories and services will be added with each feature module
- cursor-based pagination can be added later if catalog scale requires it
- test database factories and integration harnesses will come with feature-level server tests