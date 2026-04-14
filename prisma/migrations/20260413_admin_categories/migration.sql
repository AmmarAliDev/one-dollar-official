-- Migration: 20260413_admin_categories
-- Adds CategoryStatus enum and status column so admin can manage category visibility.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CategoryStatus') THEN
    CREATE TYPE "CategoryStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Category' AND column_name = 'status'
  ) THEN
    ALTER TABLE "Category"
      ADD COLUMN "status" "CategoryStatus" NOT NULL DEFAULT 'DRAFT';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Category_status_idx" ON "Category"("status");
