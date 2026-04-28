-- Migration: 20260426_email_verification_tokens
-- Adds one-time email verification tokens for credentials sign-up.

CREATE TABLE IF NOT EXISTS "EmailVerificationToken" (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_email_verification_token_user FOREIGN KEY(user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_verification_token_user_id
  ON "EmailVerificationToken"(user_id);

CREATE INDEX IF NOT EXISTS idx_email_verification_token_expires_at
  ON "EmailVerificationToken"(expires_at);
