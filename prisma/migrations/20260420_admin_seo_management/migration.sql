ALTER TABLE "Category"
  ADD COLUMN IF NOT EXISTS "seo_canonical_url" TEXT,
  ADD COLUMN IF NOT EXISTS "seo_og_title" TEXT,
  ADD COLUMN IF NOT EXISTS "seo_og_description" TEXT,
  ADD COLUMN IF NOT EXISTS "seo_image_url" TEXT,
  ADD COLUMN IF NOT EXISTS "seo_no_index" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "seo_schema_notes" TEXT;

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "seo_canonical_url" TEXT,
  ADD COLUMN IF NOT EXISTS "seo_og_title" TEXT,
  ADD COLUMN IF NOT EXISTS "seo_og_description" TEXT,
  ADD COLUMN IF NOT EXISTS "seo_image_url" TEXT,
  ADD COLUMN IF NOT EXISTS "seo_no_index" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "seo_schema_notes" TEXT;
