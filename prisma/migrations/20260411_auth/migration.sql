-- Migration: 20260411_auth
-- Adds auth-required fields to User for NextAuth/Auth.js v5 compatibility.
-- emailVerified: set by the adapter after OAuth email verification
-- image: OAuth provider profile picture URL
-- password: bcrypt hash for credentials-based accounts (null for OAuth-only)

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "image" TEXT,
  ADD COLUMN IF NOT EXISTS "password" TEXT;
