-- BuildEcoGroup V18.15: Auth reliability — normalized identity indexes
-- Safe / idempotent migration for PostgreSQL

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255),
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone_normalized VARCHAR(20),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Normalize email uniqueness (case-insensitive) via unique index on lower(email)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid_unique ON users (firebase_uid) WHERE firebase_uid IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_normalized_unique ON users (phone_normalized) WHERE phone_normalized IS NOT NULL AND phone_normalized <> '';

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Profiles location fields used by registration
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pincode VARCHAR(12),
  ADD COLUMN IF NOT EXISTS district VARCHAR(100),
  ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]'::jsonb;

-- Security audit log table (if not already present via runtime JSON persistence)
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id TEXT,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id TEXT,
  ip_address VARCHAR(80),
  changes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON security_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_actor ON security_audit_logs(actor_id);
