# Server Layer

Place server-only code here, including future database clients, repositories, auth services, background jobs, and integrations.

## Convention
- Keep route handlers thin.
- Move business logic into typed service or repository modules.
- Do not import server modules into client components.
