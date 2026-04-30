-- DropForeignKey
ALTER TABLE "EmailVerificationToken" DROP CONSTRAINT "fk_email_verification_token_user";

-- DropForeignKey
ALTER TABLE "PasswordResetToken" DROP CONSTRAINT "fk_password_reset_token_user";

-- AlterTable
ALTER TABLE "EmailVerificationToken" ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PasswordResetToken" ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "blog_post" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "email_subscriber" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "store_settings" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_email_verification_token_expires_at" RENAME TO "EmailVerificationToken_expires_at_idx";

-- RenameIndex
ALTER INDEX "idx_email_verification_token_user_id" RENAME TO "EmailVerificationToken_user_id_idx";

-- RenameIndex
ALTER INDEX "idx_password_reset_token_expires_at" RENAME TO "PasswordResetToken_expires_at_idx";

-- RenameIndex
ALTER INDEX "idx_password_reset_token_user_id" RENAME TO "PasswordResetToken_user_id_idx";
