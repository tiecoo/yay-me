-- Opaque, DB-backed sessions (not JWT): the cookie only ever holds a random
-- token; we store sha256(token) here so a DB leak alone can't be replayed as
-- a live session, and logout can revoke immediately by deleting the row.
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  user_agent TEXT NULL
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
