-- BuildEcoGroup V17.0 Phase 3: Auth & RBAC Schema Upgrade
-- Author: BuildEcoGroup Architecture

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Ensure indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Update roles to standard taxonomy
-- Valid roles: 'CUSTOMER', 'CONSULTANT', 'EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'
-- Valid statuses: 'PENDING', 'ACTIVE', 'SUSPENDED', 'DISABLED'
