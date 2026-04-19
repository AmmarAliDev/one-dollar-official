# Domain model — One Dollar (initial)

This document explains the initial Prisma-based domain model implemented for the single-vendor One Dollar store.

Goals
- Single-vendor commerce (no multi-tenant complexity).
- Pakistan-only scope; Karachi only initially.
- Inventory tracked at the ProductVariant level (required).
- Support guest checkout (orders may be placed without a registered user).
- Admins split by roles (super admin, product manager, order manager).

Key entities
- `User` — customers and staff accounts. Optional `roleId` links to `Role` for permissions. `email` and `phone` unique where present.
- `Role` — authoritative role records. `permissions` is a flexible JSON blob for feature flags and fine-grained permissions.
- `Account` / `Session` — NextAuth-compatible tables are included to make integration straightforward.
- `Address` — user addresses. Orders use `OrderAddress` snapshots so address changes do not mutate historic orders.
- `Category` — currently managed as simple categories in admin (no parent assignment), with `name`, `slug`, `description`, `status`, and SEO fields.
- `Product` — product master record. It now has an admin management flow for both simple products and variant-based products, including content copy, related product links, images, specifications, stock inputs, and SEO fields.
- `ProductVariant` — SKU-level inventory, pricing, options JSON (color/size). `Inventory` is required per variant and powers both simple-product stock and multi-variant stock.
 - `Product` — product master record. Uses an optional `masterSku`/`product_code` as a parent identifier; it is a catalog-level record that groups variants and carries shared SEO/metadata.
 - `ProductVariant` — SKU-level record used for inventory, pricing and fulfillment. `ProductVariant.sku` is the authoritative SKU for orders and inventory. `Inventory` is required per variant.
- `Inventory` — tracks `quantity`, `reserved`, `safetyStock` and `location` (Karachi by default).
- `Review`, `Wishlist`, `Cart` (and their items) for UX flows.
- `Order` / `OrderItem` / `OrderAddress` — orders contain snapshot fields (productName, unitPrice, etc.) so historical data remains stable.
- `AuditLog` — simple auditing table to store actor, action and JSON diffs.
- `HomePageSection`, `Banner`, `DealCampaign` — lightweight CMS / marketing placeholders.

Data and indexing strategy
- Timestamps: `createdAt` and `updatedAt` are present on most models (`@default(now())` and `@updatedAt`).
- Unique constraints for `slug`, `sku`, and `orderNumber` to support lookups and safe indexing.
 - Unique constraints for `slug` and `orderNumber` to support lookups and safe indexing. The authoritative SKU lives on `ProductVariant.sku`; the product-level identifier is `masterSku` (optional) and not required to be unique.
- Indexes on foreign keys (`userId`, `productId`, `categoryId`) to support common queries.
- Price fields use integer in the smallest currency unit (PKR) to avoid floating point errors.

Auth & permissions
- Users reference a `Role` record and roles are exposed as an enum `RoleKey` for convenience.
- `Role.permissions` is a JSON field that allows adding granular flags (e.g., `{"products.create": true}`).

Guest checkout
- `Order.userId` is nullable. Orders use `OrderAddress` snapshot models so guest emails/phones are stored on the Order record.

Internationalization & future features
- Country/City enums are intentionally small to start (`PAK`, `KARACHI`). Add more entries as the app expands.
- Design anticipates adding payment gateways, referrals, loyalty programs, and Urdu localization — use `metadata`/`Json` fields and campaign tables.

Seeding and migrations
- Minimal seed script `prisma/seed.js` creates roles and a default category. Keep seed data lightweight.
- The included `prisma/schema.prisma` is the source of truth. Run `npm run prisma:validate` and `npm run prisma:migrate:dev` locally to generate migrations and apply them.

Notes and next steps
- Add full-text search indices for product search (Postgres `GIN`/`tsvector`).
- Add reporting materialized views or analytics tables as traffic grows.
- Add admin UI pages to manage `DealCampaign` and `HomePageSection` objects.
- Wishlist currently supports a seed-bridge write path: when a storefront item comes from the temporary catalog seed layer (`src/features/catalog/data`) rather than a fully persisted catalog record, the wishlist flow creates or reuses a `Wishlist` for the user, then upserts only the minimum relational shell needed for `WishlistItem` to stay valid. In practice this means `Category` gets `slug`, `name`, and a placeholder `description`; `Product` gets `slug`, `name`, `shortDescription`, `description`, `categoryId`, and `status`; `ProductVariant` gets `productId`, `sku`, `title`, `price`, `compareAtPrice`, `currency`, and `isDefault`; `Wishlist` stores `userId`; and `WishlistItem` stores `wishlistId`, `productVariantId`, and `quantity`. Fields outside that bridge path, such as richer product metadata/SEO, master identifiers, variant `options`, images, reviews, specifications, and `Inventory`, are left empty or absent until full catalog persistence exists. FIXME: this is technical debt. While it preserves foreign-key integrity for `WishlistItem`, consistency still depends on seed slugs/SKUs remaining stable and on the bridge rows not diverging from the eventual source of truth; until full catalog persistence is in place, `WishlistItem` relations point at catalog-lite records that may be incomplete for downstream flows that expect full `Product`/`ProductVariant` data.
