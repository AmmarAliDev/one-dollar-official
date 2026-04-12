-- Migration: 20260413_order_lifecycle
-- Updates order lifecycle enum to the fulfillment statuses required by Prompt 4.3.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status')
    AND NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_next') THEN
    ALTER TYPE order_status RENAME TO order_status_old;
    CREATE TYPE order_status_next AS ENUM ('PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

    ALTER TABLE "Order"
      ALTER COLUMN "status" DROP DEFAULT,
      ALTER COLUMN "status" TYPE order_status_next USING (
        CASE
          WHEN "status"::text = 'PAID' THEN 'CONFIRMED'
          WHEN "status"::text = 'FULFILLED' THEN 'DELIVERED'
          WHEN "status"::text = 'REFUNDED' THEN 'CANCELLED'
          ELSE "status"::text
        END
      )::order_status_next,
      ALTER COLUMN "status" SET DEFAULT 'PENDING';

    DROP TYPE order_status_old;
    ALTER TYPE order_status_next RENAME TO order_status;
  END IF;
END $$;