-- BuildEcoGroup V17.0 Phase 4: Requirement-to-Assignment & Coordination Engine
-- Migration: 003_phase4_orchestration.sql

-- 1. Service Categories Catalog Table
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  pillar VARCHAR(100) NOT NULL, -- 'CONSTRUCTION_SERVICES' | 'SURVEILLANCE_SITE_TECH' | 'LAND_PROPERTY' | 'CONSULTANTS' | 'INNOVATION_STARTUPS'
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  requires_location BOOLEAN NOT NULL DEFAULT TRUE,
  requires_site_details BOOLEAN NOT NULL DEFAULT TRUE,
  requires_budget BOOLEAN NOT NULL DEFAULT TRUE,
  requires_documents BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_categories_pillar ON service_categories(pillar);
CREATE INDEX IF NOT EXISTS idx_service_categories_slug ON service_categories(slug);

-- 2. Extend Cases Table with Phase 4 Pillars, Hierarchy & Workflow Fields
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS pillar VARCHAR(100) NOT NULL DEFAULT 'CONSTRUCTION_SERVICES',
  ADD COLUMN IF NOT EXISTS service_slug VARCHAR(100) NOT NULL DEFAULT 'structural-engineering',
  ADD COLUMN IF NOT EXISTS assigned_coordinator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_consultant_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS qualification_checklist JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS qualification_notes TEXT,
  ADD COLUMN IF NOT EXISTS scope_details JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS normalized_budget_min NUMERIC(15, 2),
  ADD COLUMN IF NOT EXISTS normalized_budget_max NUMERIC(15, 2);

CREATE INDEX IF NOT EXISTS idx_cases_pillar ON cases(pillar);
CREATE INDEX IF NOT EXISTS idx_cases_service_slug ON cases(service_slug);
CREATE INDEX IF NOT EXISTS idx_cases_coordinator ON cases(assigned_coordinator_id);
CREATE INDEX IF NOT EXISTS idx_cases_consultant ON cases(assigned_consultant_id);

-- 3. Case Status History Table
CREATE TABLE IF NOT EXISTS case_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  case_reference VARCHAR(50) NOT NULL,
  from_status VARCHAR(50) NOT NULL,
  to_status VARCHAR(50) NOT NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role VARCHAR(50) NOT NULL,
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_status_history_case_id ON case_status_history(case_id);
CREATE INDEX IF NOT EXISTS idx_case_status_history_created_at ON case_status_history(created_at);

-- 4. Extend / Create Assignments Table
ALTER TABLE assignments
  ADD COLUMN IF NOT EXISTS assignment_type VARCHAR(50) NOT NULL DEFAULT 'CONSULTANT',
  ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS response_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS decline_reason VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_assignments_case_id ON assignments(case_id);
CREATE INDEX IF NOT EXISTS idx_assignments_consultant_id ON assignments(consultant_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);

-- 5. Case Information Requests Table
CREATE TABLE IF NOT EXISTS case_information_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  response TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING' | 'RESPONDED' | 'RESOLVED' | 'CANCELLED'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_info_requests_case_id ON case_information_requests(case_id);
CREATE INDEX IF NOT EXISTS idx_info_requests_status ON case_information_requests(status);

-- 6. Case Notes Table
CREATE TABLE IF NOT EXISTS case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  author_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  visibility VARCHAR(50) NOT NULL DEFAULT 'INTERNAL', -- 'INTERNAL' | 'CUSTOMER_VISIBLE'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_notes_case_id ON case_notes(case_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_visibility ON case_notes(visibility);

-- 7. Case Messages Table
CREATE TABLE IF NOT EXISTS case_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_messages_case_id ON case_messages(case_id);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
