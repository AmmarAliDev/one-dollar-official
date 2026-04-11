# Server Layer

Place server-only code here, including future database clients, repositories, auth services, background jobs, and integrations.

## Convention

- Keep route handlers thin.
- Move business logic into typed service or repository modules.
- Do not import server modules into client components.
- Put Prisma access and query helpers under `src/server/db`.
- Repositories should depend on a `db` executor so services can pass a transaction client when needed.
- Services should own transactional orchestration and compose repository calls rather than querying Prisma directly from routes.
