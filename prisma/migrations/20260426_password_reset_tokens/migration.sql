-- Migration: 20260426_password_reset_tokens
-- Adds one-time password reset tokens with server-side hashed storage.

CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_password_reset_token_user FOREIGN KEY(user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_password_reset_token_user_id
  ON "PasswordResetToken"(user_id);

CREATE INDEX IF NOT EXISTS idx_password_reset_token_expires_at
  ON "PasswordResetToken"(expires_at);
