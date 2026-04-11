# AI Data Model Reference — One Dollar

This file provides a compact reference of the Prisma data model for AI tooling, generation, and prompt-context use.

Models (summary)
- `User`: { id, email?, phone?, name?, roleId?, createdAt, updatedAt }
- `Role`: { id, key, name, permissions: JSON }
- `Category`: { id, name, slug, parentId?, seoTitle?, seoDescription? }
-- `Product`: { id, masterSku?, name, slug, shortDescription?, description?, status, categoryId?, metadata?: JSON, seoTitle?, seoDescription?, seoImageUrl? }
	- Note: `masterSku` is a parent/master product code (optional). The actual SKU used for inventory, pricing, and fulfillment lives on `ProductVariant.sku`.
-- `ProductVariant`: { id, productId, sku?, title?, options?: JSON, price, compareAtPrice?, currency }
-- `Inventory`: { id, productVariantId, quantity, reserved, location }
-- `ProductImage`: { id, productId?, productVariantId?, url, alt, position }
	- Rule: A `ProductImage` must reference at least one of `productId` or `productVariantId`. This is enforced by a DB CHECK constraint (`product_id IS NOT NULL OR product_variant_id IS NOT NULL`).
- `ProductSpecification`: { id, productId, key, value }
- `Review`: { id, productId, userId?, rating, title?, body?, approved }
- `Wishlist` / `WishlistItem`: wishlist per user, items reference variants
- `Cart` / `CartItem`: carts accept optional userId and a `token` for guest sessions
- `Order` / `OrderItem` / `OrderAddress`: order snapshots contain productName, unitPrice, quantity and address snapshot fields
- `AuditLog`: generic audit trail with JSON changes
- `HomePageSection` / `Banner` / `DealCampaign`: marketing placeholders with `content`/`meta` JSON

Field types notes
- Monetary values are integers in the smallest currency unit to keep calculations precise.
- Flexible JSON fields (`metadata`, `permissions`, `content`) are intentionally used to reduce schema churn for marketing and feature flags.

How AI assistants should use this
- Prefer read-only access: use `Product`, `ProductVariant`, `Inventory` to answer availability and pricing questions.
- When drafting content (product descriptions, banners), fill SEO fields (`seoTitle`, `seoDescription`, `seoImageUrl`).
- For admin recommendations (pricing, promotions), consult `DealCampaign` and `HomePageSection` `content` JSON for placement and scope.

Migration / Seeding
- Seed creates the minimal role set and `uncategorized` category. Developers should run the included CLI scripts to generate migrations and apply them.
