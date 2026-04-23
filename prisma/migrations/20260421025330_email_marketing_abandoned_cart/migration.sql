/*
  Warnings:

  - A unique constraint covering the columns `[recovery_token]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "subscriber_status" AS ENUM ('PENDING', 'ACTIVE', 'UNSUBSCRIBED', 'BOUNCED');

-- CreateEnum
CREATE TYPE "abandoned_cart_event_type" AS ENUM ('CART_CREATED', 'CART_UPDATED', 'REMINDER_QUEUED', 'REMINDER_SENT', 'CART_RECOVERED', 'CART_EXPIRED');

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "abandoned_at" TIMESTAMP(3),
ADD COLUMN     "recovery_email_sent_at" TIMESTAMP(3),
ADD COLUMN     "recovery_token" TEXT;

-- CreateTable
CREATE TABLE "email_subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "source" TEXT NOT NULL,
    "status" "subscriber_status" NOT NULL DEFAULT 'PENDING',
    "tags" TEXT[],
    "unsubscribe_token" TEXT NOT NULL,
    "confirmed_at" TIMESTAMP(3),
    "unsubscribed_at" TIMESTAMP(3),
    "provider_meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    CONSTRAINT "email_subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abandoned_cart_event" (
    "id" TEXT NOT NULL,
    "cart_id" TEXT NOT NULL,
    "cart_token" TEXT NOT NULL,
    "user_id" TEXT,
    "email" TEXT,
    "event_type" "abandoned_cart_event_type" NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abandoned_cart_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_subscriber_email_key" ON "email_subscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "email_subscriber_unsubscribe_token_key" ON "email_subscriber"("unsubscribe_token");

-- CreateIndex
CREATE INDEX "email_subscriber_status_idx" ON "email_subscriber"("status");

-- CreateIndex
CREATE INDEX "email_subscriber_created_at_idx" ON "email_subscriber"("created_at");

-- CreateIndex
CREATE INDEX "abandoned_cart_event_cart_token_idx" ON "abandoned_cart_event"("cart_token");

-- CreateIndex
CREATE INDEX "abandoned_cart_event_user_id_idx" ON "abandoned_cart_event"("user_id");

-- CreateIndex
CREATE INDEX "abandoned_cart_event_email_idx" ON "abandoned_cart_event"("email");

-- CreateIndex
CREATE INDEX "abandoned_cart_event_event_type_idx" ON "abandoned_cart_event"("event_type");

-- CreateIndex
CREATE INDEX "abandoned_cart_event_created_at_idx" ON "abandoned_cart_event"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_recovery_token_key" ON "Cart"("recovery_token");
