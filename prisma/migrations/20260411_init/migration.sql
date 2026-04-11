-- Initial schema migration (best-effort placeholder)
-- NOTE: This file is included to provide an initial migration artifact.
-- For canonical migration SQL that matches Prisma's runtime behavior,
-- run: `pnpm prisma migrate dev --name init` (or `npm run prisma:migrate:dev`).

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'country') THEN
    CREATE TYPE country AS ENUM ('PAK');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'city') THEN
    CREATE TYPE city AS ENUM ('KARACHI');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_key') THEN
    CREATE TYPE role_key AS ENUM ('SUPER_ADMIN','PRODUCT_MANAGER','ORDER_MANAGER','CUSTOMER','GUEST');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
    CREATE TYPE product_status AS ENUM ('DRAFT','PUBLISHED','ARCHIVED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('PENDING','CONFIRMED','PAID','FULFILLED','CANCELLED','REFUNDED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cart_status') THEN
    CREATE TYPE cart_status AS ENUM ('ACTIVE','COMPLETED','ABANDONED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'currency') THEN
    CREATE TYPE currency AS ENUM ('PKR');
  END IF;
END$$;

-- Roles
CREATE TABLE IF NOT EXISTS "Role" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key role_key NOT NULL UNIQUE,
  name text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Users
CREATE TABLE IF NOT EXISTS "User" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  phone text UNIQUE,
  name text,
  role_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_user_role FOREIGN KEY(role_id) REFERENCES "Role"(id) ON DELETE SET NULL
);

-- Categories
CREATE TABLE IF NOT EXISTS "Category" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  parent_id uuid,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_category_parent FOREIGN KEY(parent_id) REFERENCES "Category"(id) ON DELETE SET NULL
);

-- Products (skeleton)
CREATE TABLE IF NOT EXISTS "Product" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_sku text,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  short_description text,
  description text,
  status product_status NOT NULL DEFAULT 'DRAFT',
  category_id uuid,
  weight_gram int,
  height_mm int,
  width_mm int,
  depth_mm int,
  metadata jsonb,
  seo_title text,
  seo_description text,
  seo_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_product_category FOREIGN KEY(category_id) REFERENCES "Category"(id) ON DELETE SET NULL
);

-- Index for master_sku (non-unique parent product code)
CREATE INDEX IF NOT EXISTS idx_product_master_sku ON "Product"(master_sku);

-- Product variants
CREATE TABLE IF NOT EXISTS "ProductVariant" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  sku text UNIQUE,
  title text,
  options jsonb,
  price integer NOT NULL,
  compare_at_price integer,
  currency currency NOT NULL DEFAULT 'PKR',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_variant_product FOREIGN KEY(product_id) REFERENCES "Product"(id) ON DELETE CASCADE
);

-- Inventory per variant
CREATE TABLE IF NOT EXISTS "Inventory" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_variant_id uuid UNIQUE NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  reserved integer NOT NULL DEFAULT 0,
  location city NOT NULL DEFAULT 'KARACHI',
  safety_stock integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_inventory_variant FOREIGN KEY(product_variant_id) REFERENCES "ProductVariant"(id) ON DELETE CASCADE
);

-- Ensure inventory counts are non-negative
ALTER TABLE IF EXISTS "Inventory" ADD CONSTRAINT chk_inventory_non_negative CHECK (quantity >= 0 AND reserved >= 0 AND safety_stock >= 0);

-- Product images
CREATE TABLE IF NOT EXISTS "ProductImage" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid,
  product_variant_id uuid,
  url text NOT NULL,
  alt text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_image_product FOREIGN KEY(product_id) REFERENCES "Product"(id) ON DELETE CASCADE,
  CONSTRAINT fk_image_variant FOREIGN KEY(product_variant_id) REFERENCES "ProductVariant"(id) ON DELETE CASCADE
);

-- Enforce that a ProductImage references either a product or a product variant (or both)
ALTER TABLE IF EXISTS "ProductImage" ADD CONSTRAINT chk_productimage_one_fk CHECK (product_id IS NOT NULL OR product_variant_id IS NOT NULL);

-- Product specifications
CREATE TABLE IF NOT EXISTS "ProductSpecification" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  key text NOT NULL,
  value text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_spec_product FOREIGN KEY(product_id) REFERENCES "Product"(id) ON DELETE CASCADE
);

-- Reviews
CREATE TABLE IF NOT EXISTS "Review" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  user_id uuid,
  rating integer NOT NULL,
  title text,
  body text,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_review_product FOREIGN KEY(product_id) REFERENCES "Product"(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_user FOREIGN KEY(user_id) REFERENCES "User"(id) ON DELETE SET NULL
);

-- Ensure ratings are within expected bounds
ALTER TABLE IF EXISTS "Review" ADD CONSTRAINT chk_review_rating_bounds CHECK (rating BETWEEN 1 AND 5);

-- Wishlist + items
CREATE TABLE IF NOT EXISTS "Wishlist" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_wishlist_user FOREIGN KEY(user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "WishlistItem" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id uuid NOT NULL,
  product_variant_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_wishlistitem_wishlist FOREIGN KEY(wishlist_id) REFERENCES "Wishlist"(id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlistitem_variant FOREIGN KEY(product_variant_id) REFERENCES "ProductVariant"(id) ON DELETE CASCADE
);

-- Prevent duplicate wishlist entries for the same wishlist + variant
ALTER TABLE IF EXISTS "WishlistItem" ADD CONSTRAINT uniq_wishlistitem_wishlist_variant UNIQUE (wishlist_id, product_variant_id);

-- Cart + items
CREATE TABLE IF NOT EXISTS "Cart" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE,
  user_id uuid,
  status cart_status NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_cart_user FOREIGN KEY(user_id) REFERENCES "User"(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "CartItem" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL,
  product_variant_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_cartitem_cart FOREIGN KEY(cart_id) REFERENCES "Cart"(id) ON DELETE CASCADE,
  CONSTRAINT fk_cartitem_variant FOREIGN KEY(product_variant_id) REFERENCES "ProductVariant"(id) ON DELETE CASCADE
);

-- Prevent duplicate cart entries for same cart + variant
ALTER TABLE IF EXISTS "CartItem" ADD CONSTRAINT uk_cartitem_cart_variant UNIQUE (cart_id, product_variant_id);

-- Orders + items + address snapshot
CREATE TABLE IF NOT EXISTS "Order" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid,
  status order_status NOT NULL DEFAULT 'PENDING',
  subtotal integer NOT NULL,
  shipping integer NOT NULL DEFAULT 0,
  tax integer NOT NULL DEFAULT 0,
  discount integer NOT NULL DEFAULT 0,
  total integer NOT NULL,
  currency currency NOT NULL DEFAULT 'PKR',
  payment_method text,
  payment_provider text,
  payment_status text,
  placed_at timestamptz NOT NULL DEFAULT now(),
  shipping_address_id uuid,
  billing_address_id uuid,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Referential integrity: ensure order.user_id references an existing user
ALTER TABLE IF EXISTS "Order" ADD CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS "OrderItem" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_id uuid,
  product_name text NOT NULL,
  variant_title text,
  sku text,
  unit_price integer NOT NULL,
  quantity integer NOT NULL,
  subtotal integer NOT NULL,
  tax integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_orderitem_order FOREIGN KEY(order_id) REFERENCES "Order"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "OrderAddress" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text,
  email text,
  street1 text NOT NULL,
  street2 text,
  city city NOT NULL DEFAULT 'KARACHI',
  province text,
  country country NOT NULL DEFAULT 'PAK',
  postcode text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Link order address fields
ALTER TABLE IF EXISTS "Order" ADD CONSTRAINT fk_order_shipping_address FOREIGN KEY (shipping_address_id) REFERENCES "OrderAddress"(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS "Order" ADD CONSTRAINT fk_order_billing_address FOREIGN KEY (billing_address_id) REFERENCES "OrderAddress"(id) ON DELETE SET NULL;

-- Audit log
CREATE TABLE IF NOT EXISTS "AuditLog" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  model text,
  model_id text,
  changes jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Simple CMS placeholders
CREATE TABLE IF NOT EXISTS "HomePageSection" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  title text NOT NULL,
  type text NOT NULL,
  content jsonb,
  meta jsonb,
  position integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Banner" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  href text,
  start_at timestamptz,
  end_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "DealCampaign" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "DealCampaignProduct" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL,
  product_id uuid NOT NULL,
  CONSTRAINT fk_dcp_campaign FOREIGN KEY(campaign_id) REFERENCES "DealCampaign"(id) ON DELETE CASCADE,
  CONSTRAINT fk_dcp_product FOREIGN KEY(product_id) REFERENCES "Product"(id) ON DELETE CASCADE
);

-- Prevent duplicate (campaign_id, product_id) pairs
ALTER TABLE IF EXISTS "DealCampaignProduct" ADD CONSTRAINT unique_dcp_campaign_product UNIQUE (campaign_id, product_id);

-- NextAuth Account + Session are intentionally lightweight here; use Prisma's generated migration when possible

-- End of placeholder migration
