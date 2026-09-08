-- ====================================================================
-- BuildEcoGroup V17.0 Database Schema Definition
-- Core PostgreSQL Tables & Foreign Keys for Project Orchestration
-- ====================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('CUSTOMER', 'CONSULTANT', 'COORDINATOR', 'ADMIN')),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization VARCHAR(255),
    designation VARCHAR(150),
    city VARCHAR(100),
    state_region VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Cases Table (Orchestrated Requirement Intake)
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_reference VARCHAR(50) UNIQUE NOT NULL, -- Server-generated authoritative reference (e.g. BEG-2026-4092)
    client_id UUID REFERENCES users(id) ON DELETE SET NULL,
    project_title VARCHAR(255) NOT NULL,
    primary_discipline VARCHAR(150) NOT NULL,
    sub_disciplines JSONB DEFAULT '[]'::jsonb,
    site_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_region VARCHAR(100) NOT NULL,
    plot_size_sq_ft VARCHAR(50) NOT NULL,
    terrain_type VARCHAR(100) NOT NULL,
    building_type VARCHAR(150) NOT NULL,
    scope_description TEXT NOT NULL,
    special_requirements JSONB DEFAULT '[]'::jsonb,
    budget_range VARCHAR(100) NOT NULL,
    financing_status VARCHAR(100) DEFAULT 'Self-Funded / Approved',
    start_date_urgency VARCHAR(100) NOT NULL,
    expected_duration VARCHAR(100) DEFAULT '6 - 9 Months',
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    client_org VARCHAR(255) DEFAULT 'Individual Client',
    status VARCHAR(50) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'QUALIFICATION', 'SPECIALIST_MATCHING', 'ASSIGNED', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'CANCELLED')),
    assigned_specialist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Case Events Table (BuildEcoGroup Canonical Event Log)
CREATE TABLE IF NOT EXISTS case_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    case_reference VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL CHECK (event_type IN (
        'CASE_CREATED',
        'CASE_UPDATED',
        'CASE_QUALIFIED',
        'CASE_ASSIGNED',
        'ASSIGNMENT_ACCEPTED',
        'ASSIGNMENT_DECLINED',
        'PROJECT_CREATED',
        'MILESTONE_STARTED',
        'MILESTONE_COMPLETED',
        'DOCUMENT_ADDED'
    )),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    role VARCHAR(50) NOT NULL,
    service VARCHAR(150) NOT NULL,
    location VARCHAR(150) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 5. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    consultant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'SUPERSEDED')),
    fee_estimate VARCHAR(100),
    deadline TIMESTAMPTZ,
    response_notes TEXT,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Projects Table (Activated Execution Stage)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID UNIQUE NOT NULL REFERENCES cases(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    client_id UUID REFERENCES users(id) ON DELETE SET NULL,
    lead_specialist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    current_stage VARCHAR(150) NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    budget_allocated NUMERIC(15, 2) DEFAULT 0.00,
    budget_used NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Project Milestones Table
CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'BLOCKED')),
    target_date DATE,
    completed_date DATE,
    allocated_budget NUMERIC(15, 2) DEFAULT 0.00,
    released_budget NUMERIC(15, 2) DEFAULT 0.00,
    budget_status VARCHAR(50) DEFAULT 'UNFUNDED' CHECK (budget_status IN ('UNFUNDED', 'IN_ESCROW', 'RELEASED')),
    assigned_lead_id UUID REFERENCES users(id) ON DELETE SET NULL,
    deliverables JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Documents Table (Project Documents & Deliverables)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_path TEXT NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    document_type VARCHAR(100) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    ip_address VARCHAR(50),
    changes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. Consultant Profiles Table
CREATE TABLE IF NOT EXISTS consultant_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    firm_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    years_experience INTEGER NOT NULL CHECK (years_experience >= 0),
    discipline VARCHAR(150) NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    completed_cases_count INTEGER DEFAULT 0,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED' CHECK (verification_status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED')),
    avatar_url TEXT,
    bio TEXT,
    hourly_rate_est VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. Consultant Specializations Table
CREATE TABLE IF NOT EXISTS consultant_specializations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_profile_id UUID NOT NULL REFERENCES consultant_profiles(id) ON DELETE CASCADE,
    tag_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(consultant_profile_id, tag_name)
);

-- 12. Consultant Credentials Table (Council & Statutory Registrations)
CREATE TABLE IF NOT EXISTS consultant_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_profile_id UUID NOT NULL REFERENCES consultant_profiles(id) ON DELETE CASCADE,
    credential_type VARCHAR(100) NOT NULL, -- e.g. 'COUNCIL_OF_ARCHITECTURE', 'ISTRUCTE', 'PE_LICENSE', 'ACADEMIC_DEGREE'
    registration_number VARCHAR(150) NOT NULL,
    academic_degree VARCHAR(255),
    issuing_institution VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high performance querying
CREATE INDEX IF NOT EXISTS idx_cases_case_reference ON cases(case_reference);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_case_events_case_id ON case_events(case_id);
CREATE INDEX IF NOT EXISTS idx_case_events_type ON case_events(event_type);
CREATE INDEX IF NOT EXISTS idx_consultant_profiles_status ON consultant_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_consultant_specializations_tag ON consultant_specializations(tag_name);
