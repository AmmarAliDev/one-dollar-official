-- Migration: 20260413_order_lifecycle
-- Updates order lifecycle enum to the fulfillment statuses required by Prompt 4.3.
-- Also adds RefundStatus enum and refundStatus field to track refunded orders.

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
          ELSE 'PENDING'
        END
      )::order_status_next,
      ALTER COLUMN "status" SET DEFAULT 'PENDING';

    DROP TYPE order_status_old;
    ALTER TYPE order_status_next RENAME TO order_status;
  END IF;
END $$;

-- Add RefundStatus enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RefundStatus') THEN
    CREATE TYPE "RefundStatus" AS ENUM ('NONE', 'PENDING', 'COMPLETED', 'REVERSED');
  END IF;
END $$;

-- Add refundStatus column to Order if it doesn't exist
-- Note: We'll set it via UPDATE after adding the column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Order' AND column_name = 'refundStatus'
  ) THEN
    ALTER TABLE "Order" ADD COLUMN "refundStatus" "RefundStatus" NOT NULL DEFAULT 'NONE';
  END IF;
END $$;