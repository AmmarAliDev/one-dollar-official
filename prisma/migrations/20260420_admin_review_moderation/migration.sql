-- Admin review moderation
-- Adds review status tracking plus moderation metadata for auditability

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_status') THEN
    CREATE TYPE review_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN');
  END IF;
END $$;

ALTER TABLE IF EXISTS "Review"
  ADD COLUMN IF NOT EXISTS status review_status NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS moderation_reason text,
  ADD COLUMN IF NOT EXISTS moderated_at timestamptz,
  ADD COLUMN IF NOT EXISTS moderated_by_id text,
  ADD COLUMN IF NOT EXISTS status_backfilled boolean NOT NULL DEFAULT false;

UPDATE "Review"
SET
  status = CASE
    WHEN approved = true THEN 'APPROVED'::review_status
    WHEN (moderated_at IS NOT NULL OR moderated_by_id IS NOT NULL) THEN 'REJECTED'::review_status
    ELSE 'PENDING'::review_status
  END,
  moderation_reason = CASE
    WHEN approved = false
      AND (moderated_at IS NOT NULL OR moderated_by_id IS NOT NULL)
      AND moderation_reason IS NULL
    THEN 'Backfilled during review moderation migration.'
    ELSE moderation_reason
  END,
  status_backfilled = true
WHERE status = 'PENDING'::review_status
  AND status_backfilled = false
  AND created_at < TIMESTAMPTZ '2026-04-20T00:00:00Z';

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Review_moderated_by_id_fkey'
  ) THEN
    -- Normalize orphaned moderator references to avoid immediate FK validation failures
    UPDATE "Review" r
    SET moderated_by_id = NULL
    WHERE r.moderated_by_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "User" u WHERE u.id = r.moderated_by_id
      );

    -- Add the foreign key without immediate validation to avoid heavy table locks.
    -- NOTE: Run `ALTER TABLE "Review" VALIDATE CONSTRAINT "Review_moderated_by_id_fkey";`
    -- after deployment once you've verified there are no orphaned values.
    ALTER TABLE "Review"
      ADD CONSTRAINT "Review_moderated_by_id_fkey"
      FOREIGN KEY (moderated_by_id) REFERENCES "User"(id)
      ON DELETE SET NULL
      ON UPDATE CASCADE
      NOT VALID;
  END IF;
END $$;

ALTER TABLE IF EXISTS "Review"
  DROP COLUMN IF EXISTS status_backfilled;

CREATE INDEX IF NOT EXISTS idx_review_status ON "Review"(status);
CREATE INDEX IF NOT EXISTS idx_review_product_status ON "Review"(product_id, status);
CREATE INDEX IF NOT EXISTS idx_review_moderated_by_id ON "Review"(moderated_by_id);
