-- Migration: 20260415_auth_support_tables
-- Creates the remaining auth/address tables required by Auth.js and the user address book.

CREATE TABLE IF NOT EXISTS "Account" (
  id text PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL,
  provider text NOT NULL,
  provider_account_id text NOT NULL,
  refresh_token text,
  access_token text,
  expires_at integer,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_account_user FOREIGN KEY(user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_account_provider_provider_account_id
  ON "Account"(provider, provider_account_id);

CREATE INDEX IF NOT EXISTS idx_account_user_id
  ON "Account"(user_id);

CREATE TABLE IF NOT EXISTS "Session" (
  id text PRIMARY KEY,
  session_token text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  expires timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_session_user FOREIGN KEY(user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_user_id
  ON "Session"(user_id);

CREATE TABLE IF NOT EXISTS "Address" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  label text,
  country country NOT NULL DEFAULT 'PAK',
  province text,
  city city NOT NULL DEFAULT 'KARACHI',
  postcode text,
  street1 text NOT NULL,
  street2 text,
  phone text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_address_user FOREIGN KEY(user_id) REFERENCES "User"(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_address_user_id
  ON "Address"(user_id);
