CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NULL,
  google_sub    TEXT UNIQUE NULL,
  display_name  TEXT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT users_has_auth_method CHECK (password_hash IS NOT NULL OR google_sub IS NOT NULL)
);
