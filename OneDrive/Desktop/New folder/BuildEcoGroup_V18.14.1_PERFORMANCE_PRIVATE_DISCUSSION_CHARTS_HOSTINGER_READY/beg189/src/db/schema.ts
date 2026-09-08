import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  boolean, 
  timestamp, 
  jsonb, 
  integer, 
  numeric, 
  bigint,
  index,
  unique
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// 1. Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firebaseUid: varchar('firebase_uid', { length: 255 }).unique(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  role: varchar('role', { length: 50 }).notNull().default('CUSTOMER'), // 'CUSTOMER' | 'CONSULTANT' | 'EMPLOYEE' | 'ADMIN' | 'SUPER_ADMIN' | 'VENDOR'
  status: varchar('status', { length: 50 }).notNull().default('ACTIVE'), // 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED'
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  phoneNormalized: varchar('phone_normalized', { length: 20 }),
  emailVerified: boolean('email_verified').default(false),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  mustChangePassword: boolean('must_change_password').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_users_email').on(table.email),
  index('idx_users_firebase_uid').on(table.firebaseUid),
  index('idx_users_role').on(table.role),
  index('idx_users_status').on(table.status),
  index('idx_users_created_at').on(table.createdAt),
  index('idx_users_phone_normalized').on(table.phoneNormalized),
]);

// 2. Profiles Table
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organization: varchar('organization', { length: 255 }),
  designation: varchar('designation', { length: 150 }),
  city: varchar('city', { length: 100 }),
  stateRegion: varchar('state_region', { length: 100 }),
  country: varchar('country', { length: 100 }).default('India'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 3. Service Categories Catalog Table (Database-backed taxonomy)
export const serviceCategories = pgTable('service_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  pillar: varchar('pillar', { length: 100 }).notNull(), // 'CONSTRUCTION_SERVICES' | 'SURVEILLANCE_SITE_TECH' | 'LAND_PROPERTY' | 'CONSULTANTS' | 'INNOVATION_STARTUPS'
  description: text('description'),
  active: boolean('active').notNull().default(true),
  requiresLocation: boolean('requires_location').notNull().default(true),
  requiresSiteDetails: boolean('requires_site_details').notNull().default(true),
  requiresBudget: boolean('requires_budget').notNull().default(true),
  requiresDocuments: boolean('requires_documents').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_service_categories_pillar').on(table.pillar),
  index('idx_service_categories_slug').on(table.slug),
]);

// 4. Cases Table (Orchestrated Project Requirements)
export const cases = pgTable('cases', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseReference: varchar('case_reference', { length: 50 }).unique().notNull(), // e.g. BEG-2026-XXXXXXXX
  clientId: uuid('client_id').references(() => users.id, { onDelete: 'set null' }),
  pillar: varchar('pillar', { length: 100 }).notNull().default('CONSTRUCTION_SERVICES'),
  serviceSlug: varchar('service_slug', { length: 100 }).notNull().default('structural-engineering'),
  projectTitle: varchar('project_title', { length: 255 }).notNull(),
  primaryDiscipline: varchar('primary_discipline', { length: 150 }).notNull(),
  subDisciplines: jsonb('sub_disciplines').default(sql`'[]'::jsonb`),
  siteAddress: text('site_address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  stateRegion: varchar('state_region', { length: 100 }).notNull(),
  plotSizeSqFt: varchar('plot_size_sq_ft', { length: 50 }).notNull(),
  terrainType: varchar('terrain_type', { length: 100 }).notNull(),
  buildingType: varchar('building_type', { length: 150 }).notNull(),
  scopeDescription: text('scope_description').notNull(),
  scopeDetails: jsonb('scope_details').default(sql`'{}'::jsonb`),
  specialRequirements: jsonb('special_requirements').default(sql`'[]'::jsonb`),
  budgetRange: varchar('budget_range', { length: 100 }).notNull(),
  normalizedBudgetMin: numeric('normalized_budget_min', { precision: 15, scale: 2 }),
  normalizedBudgetMax: numeric('normalized_budget_max', { precision: 15, scale: 2 }),
  financingStatus: varchar('financing_status', { length: 100 }).default('Self-Funded / Approved'),
  startDateUrgency: varchar('start_date_urgency', { length: 100 }).notNull(),
  expectedDuration: varchar('expected_duration', { length: 100 }).default('6 - 9 Months'),
  clientName: varchar('client_name', { length: 255 }).notNull(),
  clientEmail: varchar('client_email', { length: 255 }).notNull(),
  clientPhone: varchar('client_phone', { length: 50 }).notNull(),
  clientOrg: varchar('client_org', { length: 255 }).default('Individual Client'),
  status: varchar('status', { length: 50 }).notNull().default('NEW'), 
  assignedCoordinatorId: uuid('assigned_coordinator_id').references(() => users.id, { onDelete: 'set null' }),
  assignedConsultantId: uuid('assigned_consultant_id').references(() => users.id, { onDelete: 'set null' }),
  assignedSpecialistId: uuid('assigned_specialist_id').references(() => users.id, { onDelete: 'set null' }),
  qualificationChecklist: jsonb('qualification_checklist').default(sql`'{}'::jsonb`),
  qualificationNotes: text('qualification_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_cases_case_reference').on(table.caseReference),
  index('idx_cases_status').on(table.status),
  index('idx_cases_pillar').on(table.pillar),
  index('idx_cases_service_slug').on(table.serviceSlug),
]);

// 5. Case Status History Table (Authoritative Workflow Transitions)
export const caseStatusHistory = pgTable('case_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  caseReference: varchar('case_reference', { length: 50 }).notNull(),
  fromStatus: varchar('from_status', { length: 50 }).notNull(),
  toStatus: varchar('to_status', { length: 50 }).notNull(),
  actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
  actorRole: varchar('actor_role', { length: 50 }).notNull(),
  reason: text('reason'),
  metadata: jsonb('metadata').default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_case_status_history_case_id').on(table.caseId),
  index('idx_case_status_history_created_at').on(table.createdAt),
]);

// 6. Case Events Table (BuildEcoGroup Canonical Audit Stream)
export const caseEvents = pgTable('case_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').references(() => cases.id, { onDelete: 'cascade' }),
  caseReference: varchar('case_reference', { length: 50 }).notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  role: varchar('role', { length: 50 }).notNull(),
  service: varchar('service', { length: 150 }).notNull(),
  location: varchar('location', { length: 150 }).notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
  metadata: jsonb('metadata').default(sql`'{}'::jsonb`),
}, (table) => [
  index('idx_case_events_case_id').on(table.caseId),
  index('idx_case_events_type').on(table.eventType),
]);

// 7. Assignments Table
export const assignments = pgTable('assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  consultantId: uuid('consultant_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  assignmentType: varchar('assignment_type', { length: 50 }).notNull().default('CONSULTANT'), // 'COORDINATOR' | 'CONSULTANT' | 'PROVIDER'
  status: varchar('status', { length: 50 }).notNull().default('PENDING'), // 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'SUPERSEDED' | 'CANCELLED'
  assignedBy: uuid('assigned_by').references(() => users.id, { onDelete: 'set null' }),
  feeEstimate: varchar('fee_estimate', { length: 100 }),
  deadline: timestamp('deadline', { withTimezone: true }),
  responseDueAt: timestamp('response_due_at', { withTimezone: true }),
  declineReason: varchar('decline_reason', { length: 255 }),
  responseNotes: text('response_notes'),
  respondedAt: timestamp('responded_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_assignments_case_id').on(table.caseId),
  index('idx_assignments_consultant_id').on(table.consultantId),
  index('idx_assignments_status').on(table.status),
]);

// 8. Case Information Requests Table
export const caseInformationRequests = pgTable('case_information_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  requestedBy: uuid('requested_by').references(() => users.id, { onDelete: 'set null' }),
  question: text('question').notNull(),
  response: text('response'),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'), // 'PENDING' | 'RESPONDED' | 'RESOLVED' | 'CANCELLED'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  respondedAt: timestamp('responded_at', { withTimezone: true }),
}, (table) => [
  index('idx_info_requests_case_id').on(table.caseId),
  index('idx_info_requests_status').on(table.status),
]);

// 9. Case Notes Table
export const caseNotes = pgTable('case_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  authorUserId: uuid('author_user_id').references(() => users.id, { onDelete: 'set null' }),
  note: text('note').notNull(),
  visibility: varchar('visibility', { length: 50 }).notNull().default('INTERNAL'), // 'INTERNAL' | 'CUSTOMER_VISIBLE'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_case_notes_case_id').on(table.caseId),
  index('idx_case_notes_visibility').on(table.visibility),
]);

// 10. Case Messages Table
export const caseMessages = pgTable('case_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  senderUserId: uuid('sender_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_case_messages_case_id').on(table.caseId),
]);

// 11. Notifications Table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  caseId: uuid('case_id').references(() => cases.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 100 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_notifications_user_id').on(table.userId),
  index('idx_notifications_read').on(table.read),
]);

// 6. Projects Table (Execution Stage)
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').unique().notNull().references(() => cases.id, { onDelete: 'restrict' }),
  title: varchar('title', { length: 255 }).notNull(),
  clientId: uuid('client_id').references(() => users.id, { onDelete: 'set null' }),
  leadSpecialistId: uuid('lead_specialist_id').references(() => users.id, { onDelete: 'set null' }),
  currentStage: varchar('current_stage', { length: 150 }).notNull(),
  progressPercentage: integer('progress_percentage').default(0),
  budgetAllocated: numeric('budget_allocated', { precision: 15, scale: 2 }).default('0.00'),
  budgetUsed: numeric('budget_used', { precision: 15, scale: 2 }).default('0.00'),
  status: varchar('status', { length: 50 }).default('ACTIVE'), // 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 7. Project Milestones Table
export const projectMilestones = pgTable('project_milestones', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  stepNumber: integer('step_number').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('UPCOMING'), // 'UPCOMING' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'BLOCKED'
  targetDate: timestamp('target_date'),
  completedDate: timestamp('completed_date'),
  allocatedBudget: numeric('allocated_budget', { precision: 15, scale: 2 }).default('0.00'),
  releasedBudget: numeric('released_budget', { precision: 15, scale: 2 }).default('0.00'),
  budgetStatus: varchar('budget_status', { length: 50 }).default('UNFUNDED'), // 'UNFUNDED' | 'IN_ESCROW' | 'RELEASED'
  assignedLeadId: uuid('assigned_lead_id').references(() => users.id, { onDelete: 'set null' }),
  deliverables: jsonb('deliverables').default(sql`'[]'::jsonb`),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 8. Documents Table
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  caseId: uuid('case_id').references(() => cases.id, { onDelete: 'set null' }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  storagePath: text('storage_path').notNull(),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
  documentType: varchar('document_type', { length: 100 }).notNull(),
  isVerified: boolean('is_verified').default(false),
  verifiedBy: uuid('verified_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 9. Audit Logs Table
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  ipAddress: varchar('ip_address', { length: 50 }),
  changes: jsonb('changes').default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 10. Consultant Profiles Table
export const consultantProfiles = pgTable('consultant_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').unique().references(() => users.id, { onDelete: 'cascade' }),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  firmName: varchar('firm_name', { length: 255 }),
  email: varchar('email', { length: 255 }).unique().notNull(),
  phone: varchar('phone', { length: 50 }),
  city: varchar('city', { length: 100 }).notNull(),
  country: varchar('country', { length: 100 }).default('India'),
  yearsExperience: integer('years_experience').notNull(),
  discipline: varchar('discipline', { length: 150 }).notNull(),
  rating: numeric('rating', { precision: 3, scale: 2 }).default('5.00'),
  completedCasesCount: integer('completed_cases_count').default(0),
  verificationStatus: varchar('verification_status', { length: 50 }).notNull().default('SUBMITTED'), // 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED'
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  hourlyRateEst: varchar('hourly_rate_est', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_consultant_profiles_status').on(table.verificationStatus),
]);

// 11. Consultant Specializations Table
export const consultantSpecializations = pgTable('consultant_specializations', {
  id: uuid('id').primaryKey().defaultRandom(),
  consultantProfileId: uuid('consultant_profile_id').notNull().references(() => consultantProfiles.id, { onDelete: 'cascade' }),
  tagName: varchar('tag_name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_consultant_specializations_tag').on(table.tagName),
  unique().on(table.consultantProfileId, table.tagName),
]);

// 12. Consultant Credentials Table
export const consultantCredentials = pgTable('consultant_credentials', {
  id: uuid('id').primaryKey().defaultRandom(),
  consultantProfileId: uuid('consultant_profile_id').notNull().references(() => consultantProfiles.id, { onDelete: 'cascade' }),
  credentialType: varchar('credential_type', { length: 100 }).notNull(), // 'COUNCIL_OF_ARCHITECTURE', 'ISTRUCTE', etc.
  registrationNumber: varchar('registration_number', { length: 150 }).notNull(),
  academicDegree: varchar('academic_degree', { length: 255 }),
  issuingInstitution: varchar('issuing_institution', { length: 255 }),
  isVerified: boolean('is_verified').default(false),
  verifiedBy: uuid('verified_by').references(() => users.id, { onDelete: 'set null' }),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ============================================================================
// Drizzle Relations Declarations
// ============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  consultantProfile: one(consultantProfiles, {
    fields: [users.id],
    references: [consultantProfiles.userId],
  }),
  casesAsClient: many(cases),
  assignments: many(assignments),
  caseEvents: many(caseEvents),
}));

export const casesRelations = relations(cases, ({ one, many }) => ({
  client: one(users, {
    fields: [cases.clientId],
    references: [users.id],
  }),
  assignedCoordinator: one(users, {
    fields: [cases.assignedCoordinatorId],
    references: [users.id],
  }),
  assignedConsultant: one(users, {
    fields: [cases.assignedConsultantId],
    references: [users.id],
  }),
  assignedSpecialist: one(users, {
    fields: [cases.assignedSpecialistId],
    references: [users.id],
  }),
  events: many(caseEvents),
  statusHistory: many(caseStatusHistory),
  assignments: many(assignments),
  informationRequests: many(caseInformationRequests),
  notes: many(caseNotes),
  messages: many(caseMessages),
  project: one(projects, {
    fields: [cases.id],
    references: [projects.caseId],
  }),
  documents: many(documents),
}));

export const caseStatusHistoryRelations = relations(caseStatusHistory, ({ one }) => ({
  case: one(cases, {
    fields: [caseStatusHistory.caseId],
    references: [cases.id],
  }),
  actor: one(users, {
    fields: [caseStatusHistory.actorId],
    references: [users.id],
  }),
}));

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  case: one(cases, {
    fields: [assignments.caseId],
    references: [cases.id],
  }),
  consultant: one(users, {
    fields: [assignments.consultantId],
    references: [users.id],
  }),
  assigner: one(users, {
    fields: [assignments.assignedBy],
    references: [users.id],
  }),
}));

export const caseInformationRequestsRelations = relations(caseInformationRequests, ({ one }) => ({
  case: one(cases, {
    fields: [caseInformationRequests.caseId],
    references: [cases.id],
  }),
  requester: one(users, {
    fields: [caseInformationRequests.requestedBy],
    references: [users.id],
  }),
}));

export const caseNotesRelations = relations(caseNotes, ({ one }) => ({
  case: one(cases, {
    fields: [caseNotes.caseId],
    references: [cases.id],
  }),
  author: one(users, {
    fields: [caseNotes.authorUserId],
    references: [users.id],
  }),
}));

export const caseMessagesRelations = relations(caseMessages, ({ one }) => ({
  case: one(cases, {
    fields: [caseMessages.caseId],
    references: [cases.id],
  }),
  sender: one(users, {
    fields: [caseMessages.senderUserId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  case: one(cases, {
    fields: [notifications.caseId],
    references: [cases.id],
  }),
}));

export const caseEventsRelations = relations(caseEvents, ({ one }) => ({
  case: one(cases, {
    fields: [caseEvents.caseId],
    references: [cases.id],
  }),
  actor: one(users, {
    fields: [caseEvents.userId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  case: one(cases, {
    fields: [projects.caseId],
    references: [cases.id],
  }),
  client: one(users, {
    fields: [projects.clientId],
    references: [users.id],
  }),
  leadSpecialist: one(users, {
    fields: [projects.leadSpecialistId],
    references: [users.id],
  }),
  milestones: many(projectMilestones),
  documents: many(documents),
}));

export const projectMilestonesRelations = relations(projectMilestones, ({ one }) => ({
  project: one(projects, {
    fields: [projectMilestones.projectId],
    references: [projects.id],
  }),
  assignedLead: one(users, {
    fields: [projectMilestones.assignedLeadId],
    references: [users.id],
  }),
}));

export const consultantProfilesRelations = relations(consultantProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [consultantProfiles.userId],
    references: [users.id],
  }),
  specializations: many(consultantSpecializations),
  credentials: many(consultantCredentials),
}));

// ============================================================================
// Phase 6: Commercial Engine Tables (BOQ, Quotations, Comparisons, Approvals)
// ============================================================================

// 13. Tax Codes Table
export const taxCodes = pgTable('tax_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).unique().notNull(), // e.g. 'GST_18', 'GST_12', 'GST_5', 'GST_0'
  name: varchar('name', { length: 255 }).notNull(),
  rate: numeric('rate', { precision: 5, scale: 2 }).notNull(), // e.g. 18.00
  hsnSacCode: varchar('hsn_sac_code', { length: 50 }),
  effectiveFrom: timestamp('effective_from', { withTimezone: true }).defaultNow(),
  effectiveTo: timestamp('effective_to', { withTimezone: true }),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 14. BOQs Table
export const boqs = pgTable('boqs', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  boqReference: varchar('boq_reference', { length: 50 }).unique().notNull(), // BEG-BOQ-2026-XXXXXXXX
  estimateType: varchar('estimate_type', { length: 100 }).notNull(), // 'PRELIMINARY_ESTIMATE' | 'DETAILED_BOQ' | ...
  title: varchar('title', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('DRAFT'), // 'DRAFT' | 'IN_PREPARATION' | 'READY_FOR_REVIEW' | 'REVISION_REQUESTED' | 'APPROVED' | 'LOCKED' | 'CANCELLED'
  currency: varchar('currency', { length: 10 }).notNull().default('INR'),
  scopeDescription: text('scope_description'),
  approximateAreaSqFt: varchar('approximate_area_sq_ft', { length: 50 }),
  preferredSpecification: text('preferred_specification'),
  notes: text('notes'),
  currentRevisionId: uuid('current_revision_id'),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_boqs_case_id').on(table.caseId),
  index('idx_boqs_reference').on(table.boqReference),
  index('idx_boqs_status').on(table.status),
]);

// 15. BOQ Revisions Table
export const boqRevisions = pgTable('boq_revisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  boqId: uuid('boq_id').notNull().references(() => boqs.id, { onDelete: 'cascade' }),
  revisionNumber: integer('revision_number').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('DRAFT'), // 'DRAFT' | 'READY_FOR_REVIEW' | 'REVISION_REQUESTED' | 'APPROVED' | 'SUPERSEDED'
  notes: text('notes'),
  subtotal: numeric('subtotal', { precision: 15, scale: 2 }).notNull().default('0.00'),
  taxTotal: numeric('tax_total', { precision: 15, scale: 2 }).notNull().default('0.00'),
  adjustmentTotal: numeric('adjustment_total', { precision: 15, scale: 2 }).notNull().default('0.00'),
  grandTotal: numeric('grand_total', { precision: 15, scale: 2 }).notNull().default('0.00'),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_boq_revisions_boq_id').on(table.boqId),
  unique().on(table.boqId, table.revisionNumber),
]);

// 16. BOQ Items Table
export const boqItems = pgTable('boq_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().references(() => boqRevisions.id, { onDelete: 'cascade' }),
  section: varchar('section', { length: 100 }).notNull(), // Civil, Structural, Finishing, Electrical, Plumbing, etc.
  itemCode: varchar('item_code', { length: 50 }).notNull(),
  description: text('description').notNull(),
  specification: text('specification').notNull(),
  brand: varchar('brand', { length: 150 }),
  grade: varchar('grade', { length: 100 }),
  size: varchar('size', { length: 100 }),
  thickness: varchar('thickness', { length: 100 }),
  model: varchar('model', { length: 100 }),
  quantity: numeric('quantity', { precision: 12, scale: 3 }).notNull(),
  unit: varchar('unit', { length: 50 }).notNull(), // Nos, Sq Ft, MT, Bag, etc.
  baseRate: numeric('base_rate', { precision: 15, scale: 2 }).notNull(),
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).notNull().default('18.00'),
  taxAmount: numeric('tax_amount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  lineTotal: numeric('line_total', { precision: 15, scale: 2 }).notNull().default('0.00'),
  rateSource: varchar('rate_source', { length: 50 }).notNull().default('CONSULTANT_ESTIMATE'), // MANUAL, CONSULTANT_ESTIMATE, VENDOR_QUOTE, CATALOG, ADMIN_RATE, OTHER
  rateSourceReference: varchar('rate_source_reference', { length: 100 }),
  rateDate: timestamp('rate_date', { withTimezone: true }),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_boq_items_revision_id').on(table.revisionId),
  index('idx_boq_items_section').on(table.section),
]);

// 17. BOQ Adjustments Table
export const boqAdjustments = pgTable('boq_adjustments', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().references(() => boqRevisions.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // DISCOUNT, CONTINGENCY, OVERHEAD, FREIGHT, SITE_SAFETY, OTHER
  label: varchar('label', { length: 255 }).notNull(),
  calculationType: varchar('calculation_type', { length: 50 }).notNull(), // PERCENTAGE, FIXED_AMOUNT
  value: numeric('value', { precision: 15, scale: 2 }).notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
}, (table) => [
  index('idx_boq_adjustments_revision_id').on(table.revisionId),
]);

// 18. BOQ Approvals Table
export const boqApprovals = pgTable('boq_approvals', {
  id: uuid('id').primaryKey().defaultRandom(),
  boqId: uuid('boq_id').notNull().references(() => boqs.id, { onDelete: 'cascade' }),
  revisionId: uuid('revision_id').notNull().references(() => boqRevisions.id, { onDelete: 'cascade' }),
  approvedBy: uuid('approved_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  decision: varchar('decision', { length: 50 }).notNull(), // APPROVED, CHANGES_REQUESTED, REJECTED
  reasonCategory: varchar('reason_category', { length: 100 }),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_boq_approvals_boq_id').on(table.boqId),
  index('idx_boq_approvals_revision_id').on(table.revisionId),
]);

// 19. Quotations Table (Independent Providers / Vendors)
export const quotations = pgTable('quotations', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  boqId: uuid('boq_id').notNull().references(() => boqs.id, { onDelete: 'cascade' }),
  providerId: uuid('provider_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  providerFirm: varchar('provider_firm', { length: 255 }).notNull(),
  providerCity: varchar('provider_city', { length: 100 }),
  quotationReference: varchar('quotation_reference', { length: 50 }).unique().notNull(), // BEG-QUO-2026-XXXXXXXX
  status: varchar('status', { length: 50 }).notNull().default('SUBMITTED'), // DRAFT, SUBMITTED, UNDER_REVIEW, SHORTLISTED, ACCEPTED, REJECTED, EXPIRED, WITHDRAWN
  validityDate: timestamp('validity_date', { withTimezone: true }).notNull(),
  subtotal: numeric('subtotal', { precision: 15, scale: 2 }).notNull().default('0.00'),
  taxTotal: numeric('tax_total', { precision: 15, scale: 2 }).notNull().default('0.00'),
  freight: numeric('freight', { precision: 15, scale: 2 }).notNull().default('0.00'),
  discount: numeric('discount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  grandTotal: numeric('grand_total', { precision: 15, scale: 2 }).notNull().default('0.00'),
  leadTimeDays: integer('lead_time_days').notNull().default(7),
  warrantyMonths: integer('warranty_months'),
  paymentTerms: text('payment_terms'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_quotations_boq_id').on(table.boqId),
  index('idx_quotations_provider_id').on(table.providerId),
  index('idx_quotations_status').on(table.status),
]);

// 20. Quotation Items Table
export const quotationItems = pgTable('quotation_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  quotationId: uuid('quotation_id').notNull().references(() => quotations.id, { onDelete: 'cascade' }),
  boqItemId: uuid('boq_item_id').notNull().references(() => boqItems.id, { onDelete: 'cascade' }),
  offeredBrand: varchar('offered_brand', { length: 150 }).notNull(),
  offeredSpecification: text('offered_specification').notNull(),
  quantity: numeric('quantity', { precision: 12, scale: 3 }).notNull(),
  unitRate: numeric('unit_rate', { precision: 15, scale: 2 }).notNull(),
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).notNull().default('18.00'),
  taxAmount: numeric('tax_amount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  lineTotal: numeric('line_total', { precision: 15, scale: 2 }).notNull().default('0.00'),
  availability: varchar('availability', { length: 100 }).notNull().default('In Stock'),
  leadTime: varchar('lead_time', { length: 100 }).notNull().default('3-5 Days'),
  specCompliance: varchar('spec_compliance', { length: 50 }).notNull().default('EXACT'), // EXACT, EQUIVALENT, DEVIATED, SUPERIOR
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_quotation_items_quotation_id').on(table.quotationId),
  index('idx_quotation_items_boq_item_id').on(table.boqItemId),
]);

// ============================================================================
// Phase 7: Solar & Construction Hardware Catalog Table (Products)
// ============================================================================

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  sku: varchar('sku', { length: 100 }).unique().notNull(),
  name: varchar('255', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(), // 'MODULE' | 'INVERTER' | 'BATTERY' | 'STRUCTURE_BOS'
  subcategory: varchar('subcategory', { length: 100 }),
  brand: varchar('brand', { length: 150 }).notNull(),
  model: varchar('model', { length: 150 }).notNull(),
  technologyType: varchar('technology_type', { length: 100 }).notNull(), // 'TOPCon' | 'Mono PERC' | 'LFP' | etc.
  capacityRating: varchar('capacity_rating', { length: 100 }).notNull(), // e.g. '580 Wp', '110 kW', '10.24 kWh'
  capacityValue: numeric('capacity_value', { precision: 12, scale: 2 }),
  capacityUnit: varchar('capacity_unit', { length: 50 }), // 'Wp' | 'kW' | 'kWh' | 'VA'
  efficiencyPercentage: numeric('efficiency_percentage', { precision: 5, scale: 2 }).notNull(),
  warrantyYears: integer('warranty_years').notNull().default(10),
  linearWarrantyYears: integer('linear_warranty_years'),
  almmApproved: boolean('almm_approved').notNull().default(false),
  bessCycleLife: integer('bess_cycle_life'),
  depthOfDischarge: varchar('depth_of_discharge', { length: 50 }),
  protectionRating: varchar('protection_rating', { length: 50 }),
  mpptChannels: varchar('mppt_channels', { length: 100 }),
  temperatureCoefficient: varchar('temperature_coefficient', { length: 100 }),
  bifacialityFactor: varchar('bifaciality_factor', { length: 100 }),
  countryOfOrigin: varchar('country_of_origin', { length: 100 }).default('India'),
  tier: varchar('tier', { length: 50 }).default('Tier-1 Premium'), // 'Tier-1 Premium' | 'Tier-1 Standard' | 'Industrial Utility'
  basePrice: numeric('base_price', { precision: 15, scale: 2 }),
  currency: varchar('currency', { length: 10 }).default('INR'),
  priceDisplay: varchar('price_display', { length: 100 }),
  inStock: boolean('in_stock').default(true),
  leadTimeDays: integer('lead_time_days').default(3),
  specifications: jsonb('specifications').default(sql`'{}'::jsonb`),
  keyFeatures: jsonb('key_features').default(sql`'[]'::jsonb`),
  datasheetSummary: text('datasheet_summary'),
  datasheetUrl: text('datasheet_url'),
  imageUrl: text('image_url'),
  status: varchar('status', { length: 50 }).notNull().default('ACTIVE'), // 'ACTIVE' | 'ARCHIVED' | 'OUT_OF_STOCK'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_products_category').on(table.category),
  index('idx_products_brand').on(table.brand),
  index('idx_products_tech_type').on(table.technologyType),
  index('idx_products_almm').on(table.almmApproved),
  index('idx_products_sku').on(table.sku),
]);

// Relations for Phase 6 Tables
export const boqsRelations = relations(boqs, ({ one, many }) => ({
  case: one(cases, {
    fields: [boqs.caseId],
    references: [cases.id],
  }),
  project: one(projects, {
    fields: [boqs.projectId],
    references: [projects.id],
  }),
  creator: one(users, {
    fields: [boqs.createdBy],
    references: [users.id],
  }),
  revisions: many(boqRevisions),
  quotations: many(quotations),
  approvals: many(boqApprovals),
}));

export const boqRevisionsRelations = relations(boqRevisions, ({ one, many }) => ({
  boq: one(boqs, {
    fields: [boqRevisions.boqId],
    references: [boqs.id],
  }),
  creator: one(users, {
    fields: [boqRevisions.createdBy],
    references: [users.id],
  }),
  items: many(boqItems),
  adjustments: many(boqAdjustments),
  approvals: many(boqApprovals),
}));

export const boqItemsRelations = relations(boqItems, ({ one, many }) => ({
  revision: one(boqRevisions, {
    fields: [boqItems.revisionId],
    references: [boqRevisions.id],
  }),
  quotationItems: many(quotationItems),
}));

export const quotationsRelations = relations(quotations, ({ one, many }) => ({
  boq: one(boqs, {
    fields: [quotations.boqId],
    references: [boqs.id],
  }),
  case: one(cases, {
    fields: [quotations.caseId],
    references: [cases.id],
  }),
  provider: one(users, {
    fields: [quotations.providerId],
    references: [users.id],
  }),
  items: many(quotationItems),
}));

export const quotationItemsRelations = relations(quotationItems, ({ one }) => ({
  quotation: one(quotations, {
    fields: [quotationItems.quotationId],
    references: [quotations.id],
  }),
  boqItem: one(boqItems, {
    fields: [quotationItems.boqItemId],
    references: [boqItems.id],
  }),
}));

