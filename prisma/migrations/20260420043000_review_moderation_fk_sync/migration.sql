-- Repair review moderation referential integrity for databases that already applied the
-- original moderation migration before the foreign key relation was modeled in Prisma.

UPDATE "Review" AS r
SET moderated_by_id = NULL
WHERE moderated_by_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "User" AS u
    WHERE u.id = r.moderated_by_id
  );

UPDATE "Review"
SET approved = (status = 'APPROVED'::review_status)
WHERE approved IS DISTINCT FROM (status = 'APPROVED'::review_status);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Review_moderated_by_id_fkey'
  ) THEN
    ALTER TABLE "Review"
      ADD CONSTRAINT "Review_moderated_by_id_fkey"
      FOREIGN KEY (moderated_by_id) REFERENCES "User"(id)
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_review_moderated_by_id ON "Review"(moderated_by_id);
