import { z } from 'zod';

// ==========================================
// 5 Canonical Pillars
// ==========================================
export type PillarType = 
  | 'CONSTRUCTION_SERVICES' 
  | 'SURVEILLANCE_SITE_TECH' 
  | 'LAND_PROPERTY' 
  | 'CONSULTANTS' 
  | 'INNOVATION_STARTUPS';

export interface ServiceCategoryRecord {
  id: string;
  slug: string;
  name: string;
  pillar: PillarType;
  description: string;
  active: boolean;
  requiresLocation: boolean;
  requiresSiteDetails: boolean;
  requiresBudget: boolean;
  requiresDocuments: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Verification & Status Enums
// ==========================================
export type ConsultantVerificationStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'UNDER_REVIEW' 
  | 'VERIFIED' 
  | 'REJECTED' 
  | 'SUSPENDED';

export type CaseStatus = 
  | 'NEW' 
  | 'QUALIFICATION_PENDING'
  | 'QUALIFIED'
  | 'NEEDS_INFORMATION'
  | 'COORDINATOR_ASSIGNED'
  | 'MATCHING'
  | 'CONSULTANT_ASSIGNED'
  | 'CONSULTANT_ACCEPTED'
  | 'CONSULTANT_DECLINED'
  | 'SCOPE_DISCOVERY'
  | 'BOQ_PREPARATION'
  | 'PROPOSAL_PENDING'
  | 'CUSTOMER_REVIEW'
  | 'APPROVED'
  | 'PROJECT_READY'
  | 'REJECTED'
  | 'ON_HOLD'
  | 'CANCELLED'
  | 'CLOSED'
  // Legacy aliases for backward compatibility
  | 'QUALIFICATION'
  | 'SPECIALIST_MATCHING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'UNDER_REVIEW'
  | 'COMPLETED';

export type LeadAssignmentStatus = 
  | 'OFFERED'
  | 'PENDING' 
  | 'ACCEPTED' 
  | 'DECLINED' 
  | 'SUPERSEDED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REVOKED';

export type MilestoneStatus = 
  | 'UPCOMING' 
  | 'IN_PROGRESS' 
  | 'UNDER_REVIEW' 
  | 'COMPLETED' 
  | 'BLOCKED';

// BuildEcoGroup Event Taxonomy
export type CaseEventType = 
  | 'CASE_CREATED'
  | 'CASE_UPDATED'
  | 'CASE_QUALIFIED'
  | 'INFO_REQUESTED'
  | 'INFO_RESPONDED'
  | 'COORDINATOR_ASSIGNED'
  | 'MATCHING_STARTED'
  | 'CONSULTANT_ASSIGNED'
  | 'ASSIGNMENT_ACCEPTED'
  | 'ASSIGNMENT_DECLINED'
  | 'SCOPE_DISCOVERY_STARTED'
  | 'PROPOSAL_SUBMITTED'
  | 'PROPOSAL_APPROVED'
  | 'PROPOSAL_GENERATED'
  | 'PROPOSAL_ACCEPTED'
  | 'BOQ_CREATED'
  | 'BOQ_REVISION_CREATED'
  | 'BOQ_APPROVED'
  | 'BOQ_CHANGES_REQUESTED'
  | 'QUOTATION_SUBMITTED'
  | 'QUOTATION_ACCEPTED'
  | 'PROJECT_READY'
  | 'PROJECT_CREATED'
  | 'STATUS_CHANGED'
  | 'INTERNAL_NOTE_ADDED'
  | 'MESSAGE_SENT'
  | 'DOCUMENT_ADDED';

// ==========================================
// Zod Validation Schemas
// ==========================================

export const CaseIntakeSchema = z.object({
  // Step 1: Need & Pillar
  pillar: z.enum([
    'CONSTRUCTION_SERVICES',
    'SURVEILLANCE_SITE_TECH',
    'LAND_PROPERTY',
    'CONSULTANTS',
    'INNOVATION_STARTUPS'
  ]).default('CONSTRUCTION_SERVICES'),
  serviceSlug: z.string().default('structural-engineering'),
  primaryDiscipline: z.string().min(2, 'Primary discipline is required'),
  subDisciplines: z.array(z.string()).default([]),

  // Step 2: Location
  address: z.string().min(3, 'Site address/landmark is required'),
  city: z.string().min(2, 'City is required'),
  stateRegion: z.string().min(2, 'State or region is required'),
  pincode: z.string().optional(),
  plotSizeSqFt: z.string().min(1, 'Plot size is required'),
  terrainType: z.string().min(2, 'Terrain character is required'),

  // Step 3: Scope & Details
  projectTitle: z.string().min(3, 'Project title is required'),
  buildingType: z.string().min(2, 'Building typology is required'),
  scopeDescription: z.string().min(10, 'Please provide at least 10 characters describing scope'),
  scopeDetails: z.record(z.string(), z.any()).default({}).superRefine((details, ctx) => {
    if (details.sitePhotos !== undefined) {
      const photoResult = z.array(z.object({
        id: z.string().min(1).max(100),
        name: z.string().min(1).max(120),
        type: z.literal('image/jpeg'),
        sizeBytes: z.number().int().positive().max(600_000),
        sizeLabel: z.string().min(1).max(30),
        dataUrl: z.string().max(750_000).regex(/^data:image\/jpeg;base64,/i),
        shotType: z.string().max(60).optional(),
        shotLabel: z.string().max(100).optional(),
        captureMethod: z.enum(['UPLOAD', 'MOBILE_CAMERA', 'LIVE_CAMERA']).optional(),
        capturedAt: z.string().max(50).optional(),
      })).max(8).safeParse(details.sitePhotos);
      if (!photoResult.success) {
        ctx.addIssue({ code: 'custom', message: 'Up to 8 compressed JPG site photos are allowed.', path: ['sitePhotos'] });
      }
    }
    if (details.siteMeasurements !== undefined) {
      const measurementResult = z.array(z.object({
        key: z.string().min(1).max(60),
        label: z.string().min(1).max(100),
        value: z.string().min(1).max(40),
        unit: z.string().min(1).max(20),
      })).max(8).safeParse(details.siteMeasurements);
      if (!measurementResult.success) {
        ctx.addIssue({ code: 'custom', message: 'Site measurements are invalid.', path: ['siteMeasurements'] });
      }
    }
    if (details.siteCoordinates !== undefined) {
      const coordinateResult = z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        accuracyMeters: z.number().nonnegative().max(100_000),
        capturedAt: z.string().min(1).max(50),
      }).safeParse(details.siteCoordinates);
      if (!coordinateResult.success) {
        ctx.addIssue({ code: 'custom', message: 'Site coordinates are invalid.', path: ['siteCoordinates'] });
      }
    }
  }),
  specialRequirements: z.array(z.string()).default([]),

  // Step 4: Budget
  budgetRange: z.string().min(1, 'Budget range is required'),
  normalizedBudgetMin: z.number().optional(),
  normalizedBudgetMax: z.number().optional(),
  financingStatus: z.string().default('Self-Funded / Approved'),

  // Step 5: Timeline
  startDateUrgency: z.string().min(1, 'Start urgency is required'),
  expectedDuration: z.string().default('6 - 9 Months'),

  // Step 6: Contact & Credentials
  clientName: z.string().min(2, 'Client name is required'),
  clientEmail: z.string().email('Valid email address is required'),
  clientPhone: z.string().min(8, 'Valid phone number is required'),
  clientOrg: z.string().default('Individual Client'),
  preferredCommunication: z.string().default('Email & Portal Updates'),

  // Consent & optional matching context
  targetSpecialist: z.string().optional(),
  consentAccepted: z.boolean().default(true),
});

export type CaseIntakeInput = z.infer<typeof CaseIntakeSchema>;

export const QualificationChecklistSchema = z.object({
  requirementUnderstood: z.boolean(),
  locationVerified: z.boolean(),
  serviceCategoryConfirmed: z.boolean(),
  contactUsable: z.boolean(),
  criticalDocsIdentified: z.boolean(),
  notes: z.string().optional(),
});

export type QualificationChecklistInput = z.infer<typeof QualificationChecklistSchema>;
export type QualificationChecklist = QualificationChecklistInput;

export const InformationRequestSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
});

export type InformationRequestInput = z.infer<typeof InformationRequestSchema>;

export const InformationResponseSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  response: z.string().min(2, 'Response is required'),
});

export type InformationResponseInput = z.infer<typeof InformationResponseSchema>;

export const CoordinatorAssignmentSchema = z.object({
  coordinatorId: z.string().min(1, 'Coordinator user ID is required'),
  notes: z.string().optional(),
});

export type CoordinatorAssignmentInput = z.infer<typeof CoordinatorAssignmentSchema>;

export const ConsultantAssignmentSchema = z.object({
  consultantId: z.string().min(1, 'Consultant user ID is required'),
  feeEstimate: z.string().optional(),
  responseDueHours: z.number().min(1).max(168).default(48), // Default 48h
  notes: z.string().optional(),
  overrideJustification: z.string().optional(),
});

export type ConsultantAssignmentInput = z.infer<typeof ConsultantAssignmentSchema>;

export const AssignmentActionSchema = z.object({
  action: z.enum(['accept', 'decline']),
  reason: z.string().optional(),
  responseNotes: z.string().optional(),
});

export type AssignmentActionInput = z.infer<typeof AssignmentActionSchema>;

export const CaseNoteSchema = z.object({
  note: z.string().min(3, 'Note must be at least 3 characters'),
  visibility: z.enum(['INTERNAL', 'CUSTOMER_VISIBLE']).default('INTERNAL'),
});

export type CaseNoteInput = z.infer<typeof CaseNoteSchema>;

export const CaseMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
});

export type CaseMessageInput = z.infer<typeof CaseMessageSchema>;

export const ConsultantOnboardingSchema = z.object({
  fullName: z.string().min(2, 'Full name with honorific is required'),
  firmName: z.string().min(2, 'Firm or practice name is required'),
  email: z.string().email('Valid work email is required'),
  phone: z.string().min(8, 'Contact phone number is required'),
  city: z.string().min(2, 'Base metro is required'),
  yearsExp: z.number().min(0, 'Experience years must be 0 or greater'),
  discipline: z.string().min(2, 'Primary discipline is required'),
  specialties: z.array(z.string()).min(1, 'At least one specialty tag is required'),
  statutoryRegNumber: z.string().min(3, 'Council or statutory licensing ID is required'),
  educationDegree: z.string().min(3, 'Highest academic qualification is required'),
  hourlyRateEst: z.string().min(1, 'Target rate scope is required'),
  declarationAccepted: z.boolean().refine(val => val === true, {
    message: 'You must certify statutory credential validity',
  }),
});

export type ConsultantOnboardingInput = z.infer<typeof ConsultantOnboardingSchema>;

export const LeadActionSchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
  action: z.enum(['accept', 'decline']),
  consultantId: z.string().optional(),
  reason: z.string().optional(),
});

export type LeadActionInput = z.infer<typeof LeadActionSchema>;

// ==========================================
// Provider Enrollment Schemas
// ==========================================

export const EnrollmentIntakeSchema = z.object({
  role: z.enum([
    'PROFESSIONAL',
    'SKILLED_PERSON',
    'SERVICE_PROVIDER',
    'CONTRACTOR',
    'VENDOR_SUPPLIER',
    'SHOP_DEALER',
    'BRAND_DISTRIBUTOR',
    'MACHINERY_PROVIDER',
    'LAND_PROVIDER',
    'DEVELOPER_BUILDER',
  ]),
  fullName: z.string().min(2, 'Full name is required'),
  businessName: z.string().optional(),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(8, 'Valid phone number is required'),
  city: z.string().min(2, 'City is required'),
  pincode: z.string().min(4, 'PIN code is required'),
  serviceRadiusKm: z.number().min(1).max(500).default(50),
  details: z.record(z.string(), z.any()).default({}),
  documents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    size: z.string(),
    type: z.string().optional(),
    url: z.string().optional(),
  })).default([]),
  consentAccepted: z.boolean().refine(v => v === true, { message: 'Consent is required' }),
});

export type EnrollmentIntakeInput = z.infer<typeof EnrollmentIntakeSchema>;

export const EnrollmentActionSchema = z.object({
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export type EnrollmentActionInput = z.infer<typeof EnrollmentActionSchema>;

export type EnrollmentStatus = 'PENDING_VERIFICATION' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface EnrollmentRecord {
  id: string;
  enrollmentReference: string;
  role: EnrollmentIntakeInput['role'];
  fullName: string;
  businessName?: string;
  email: string;
  phone: string;
  city: string;
  pincode: string;
  serviceRadiusKm: number;
  profileCompletion: number;
  kycStatus: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  categoryVerification: 'PENDING' | 'VERIFIED';
  serviceAreaStatus: 'COMPLETE' | 'INCOMPLETE';
  catalogStatus: 'COMPLETE' | 'INCOMPLETE';
  status: EnrollmentStatus;
  details: Record<string, any>;
  documents: Array<{ id: string; name: string; size: string; type?: string; url?: string }>;
  submittedByUserId?: string;
  reviewedByUserId?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TrackRecordType = 'CASE' | 'ENROLLMENT';

export interface TrackStatusHistoryEntry {
  fromStatus: string;
  toStatus: string;
  reason: string;
  createdAt: string;
  actorRole?: string;
}

export interface TrackMilestoneEntry {
  title: string;
  status: string;
  date?: string;
  step?: number;
}

export interface PublicTrackRecord {
  id: string;
  reference: string;
  type: TrackRecordType;
  title: string;
  status: string;
  displayStatus: string;
  location?: string;
  city?: string;
  pincode?: string;
  createdAt: string;
  updatedAt: string;
  assignedDesk?: string;
  primaryDiscipline?: string;
  role?: string;
  kycStatus?: string;
  profileCompletion?: number;
  statusHistory: TrackStatusHistoryEntry[];
  milestones: TrackMilestoneEntry[];
  isFullAccess: boolean;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  projectId?: string;
  caseReference?: string;
}

// ==========================================
// Core Entity Interfaces
// ==========================================

export interface SafeUser {
  id: string;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'CONSULTANT' | 'VENDOR' | 'EMPLOYEE' | 'ADMIN' | 'SUPER_ADMIN';
  phone?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'DISABLED';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CaseRecord {
  id: string; // Server generated UUID
  caseReference: string; // Server generated BEG-2026-XXXXXXXX
  clientId?: string;
  pillar: PillarType;
  serviceSlug: string;
  primaryDiscipline: string;
  subDisciplines: string[];
  address: string;
  city: string;
  stateRegion: string;
  pincode?: string;
  plotSizeSqFt: string;
  terrainType: string;
  projectTitle: string;
  buildingType: string;
  scopeDescription: string;
  scopeDetails?: Record<string, any>;
  specialRequirements: string[];
  budgetRange: string;
  normalizedBudgetMin?: number;
  normalizedBudgetMax?: number;
  financingStatus: string;
  startDateUrgency: string;
  expectedDuration: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientOrg: string;
  status: CaseStatus;
  assignedCoordinatorId?: string;
  assignedCoordinatorName?: string;
  assignedConsultantId?: string;
  assignedSpecialistId?: string;
  leadSpecialistName?: string;
  targetSpecialist?: string;
  qualificationChecklist?: Record<string, boolean>;
  qualificationNotes?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface CaseStatusHistoryRecord {
  id: string;
  caseId: string;
  caseReference: string;
  fromStatus: CaseStatus;
  toStatus: CaseStatus;
  actorId?: string;
  actorName?: string;
  actorRole: string;
  changedByName?: string;
  changedByRole?: string;
  reason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AssignmentRecord {
  id: string;
  caseId: string;
  caseReference?: string;
  projectTitle?: string;
  consultantId: string;
  consultantName?: string;
  assignmentType: 'COORDINATOR' | 'CONSULTANT' | 'PROVIDER';
  status: LeadAssignmentStatus;
  assignedBy?: string;
  feeEstimate?: string;
  deadline?: string;
  responseDueAt?: string;
  declineReason?: string;
  responseNotes?: string;
  notes?: string;
  assignedAt?: string;
  acceptedAt?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Summary fields for consultant view
  case?: CaseRecord | any;
  caseSummary?: {
    caseReference: string;
    projectTitle: string;
    pillar: PillarType;
    serviceSlug: string;
    primaryDiscipline: string;
    city: string;
    stateRegion: string;
    scopeDescription: string;
    budgetRange: string;
    status: string;
    startDateUrgency: string;
  };
}

export interface CaseInformationRequestRecord {
  id: string;
  caseId: string;
  requestedBy?: string;
  requestedByName?: string;
  requestedByRole?: string;
  requestedAt?: string;
  question: string;
  response?: string;
  status: 'PENDING' | 'RESPONDED' | 'ANSWERED' | 'RESOLVED' | 'CANCELLED';
  createdAt: string;
  respondedAt?: string;
}

export interface CaseNoteRecord {
  id: string;
  caseId: string;
  authorUserId?: string;
  authorName?: string;
  authorRole?: string;
  note: string;
  visibility: 'INTERNAL' | 'CUSTOMER_VISIBLE';
  createdAt: string;
}

export interface CaseMessageRecord {
  id: string;
  caseId: string;
  senderUserId: string;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  caseId?: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ConsultantMatchResult {
  consultant: ConsultantRecord;
  matchScore: number; // 0 - 100
  matchReasons: string[];
  isPrimaryMatch: boolean;
  activeCasesCount: number;
}

export interface CaseEvent {
  event_id: string; // UUID
  case_id: string;
  event_type: CaseEventType;
  user_id: string;
  role: 'CUSTOMER' | 'CONSULTANT' | 'ADMIN' | 'COORDINATOR' | 'EMPLOYEE' | 'SUPER_ADMIN' | 'SYSTEM';
  service: string;
  location: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface ConsultantRecord {
  id: string;
  userId?: string;
  name: string;
  avatar: string;
  title: string;
  department: string;
  specialization: string;
  city: string;
  country: string;
  experienceYears: number;
  rating: number;
  completedCases: number;
  verificationStatus: ConsultantVerificationStatus;
  status: 'Available' | 'Assigned' | 'Consulting' | 'Suspended';
  focusAreas: string[];
  bio: string;
  certifications: string[];
  education: string;
  hourlyRateEst: string;
  statutoryRegNumber?: string;
  firmName?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  isDemo?: boolean;
}

export interface ProjectMilestoneRecord {
  id: string;
  step: number;
  title: string;
  description?: string;
  targetDate?: string;
  status: MilestoneStatus;
  date: string;
  lead: string;
  deliverables: string[];
  budgetAllocated: string;
  budgetStatus: 'UNFUNDED' | 'IN_ESCROW' | 'RELEASED';
}

export interface DocumentRecord {
  id: string;
  name: string;
  size: string;
  category?: string;
  fileSize?: string;
  uploadedByName?: string;
  type: string;
  date: string;
  author: string;
  storagePath?: string;
  isVerified: boolean;
}

// ==========================================
// Phase 6: Commercial Engine (BOQ, Quotations, Comparisons, Approvals)
// ==========================================

export type BOQEstimateType = 
  | 'CONCEPTUAL_ESTIMATE'
  | 'PRELIMINARY_ESTIMATE'
  | 'PRELIMINARY_BOQ'
  | 'DETAILED_BOQ'
  | 'REVISED_ESTIMATE'
  | 'FINAL_EXECUTION_BILL'
  | 'RENOVATION_ESTIMATE'
  | 'MEP_ESTIMATE'
  | 'MATERIAL_ESTIMATE'
  | 'SERVICE_ESTIMATE';

export type EstimateType = BOQEstimateType;

export type BOQStatus = 
  | 'DRAFT'
  | 'IN_PREPARATION'
  | 'READY_FOR_REVIEW'
  | 'CUSTOMER_REVIEW'
  | 'REVISION_REQUESTED'
  | 'APPROVED'
  | 'LOCKED'
  | 'CANCELLED';

export type BOQRevisionStatus = 
  | 'DRAFT'
  | 'READY_FOR_REVIEW'
  | 'CUSTOMER_REVIEW'
  | 'REVISION_REQUESTED'
  | 'APPROVED'
  | 'SUPERSEDED'
  | 'CANCELLED';

export type RateSource = 
  | 'MANUAL'
  | 'CONSULTANT_ESTIMATE'
  | 'VENDOR_QUOTE'
  | 'CATALOG'
  | 'CPWD_DSR'
  | 'MARKET_SURVEY'
  | 'HISTORICAL_PROJECT'
  | 'ADMIN_RATE'
  | 'OTHER';

export type BOQAdjustmentType = 
  | 'DISCOUNT'
  | 'CONTINGENCY'
  | 'OVERHEAD'
  | 'FREIGHT'
  | 'SITE_SAFETY'
  | 'SUPERVISION_FEE'
  | 'LOGISTICS_MARGIN'
  | 'OTHER';

export type CalculationType = 
  | 'PERCENTAGE'
  | 'FIXED_AMOUNT';

export type QuotationStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'WITHDRAWN';

export type QuotationSpecCompliance = 
  | 'EXACT'
  | 'EQUIVALENT'
  | 'DEVIATED'
  | 'SUPERIOR';

export interface TaxCodeRecord {
  id: string;
  code: string;
  name: string;
  rate: number; // e.g. 18 for 18%
  hsnSacCode?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  active: boolean;
}

export interface BOQItemRecord {
  id: string;
  revisionId: string;
  section: string;
  itemCode: string;
  description: string;
  specification: string;
  brand?: string;
  grade?: string;
  size?: string;
  thickness?: string;
  model?: string;
  quantity: number;
  unit: string;
  baseRate: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
  rateSource: RateSource;
  rateSourceReference?: string;
  rateDate?: string;
  sortOrder: number;
  createdAt?: string;
}

export interface BOQAdjustmentRecord {
  id: string;
  revisionId: string;
  type: BOQAdjustmentType;
  label: string;
  calculationType: CalculationType;
  value: number;
  amount: number;
}

export interface BOQApprovalRecord {
  id: string;
  boqId: string;
  revisionId: string;
  approvedBy: string;
  approvedByName?: string;
  decision: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED';
  reasonCategory?: string;
  comment: string;
  createdAt: string;
}

export interface BOQRevisionRecord {
  id: string;
  boqId: string;
  revisionNumber: number;
  status: BOQRevisionStatus;
  notes?: string;
  subtotal: number;
  taxTotal: number;
  adjustmentTotal: number;
  grandTotal: number;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  items?: BOQItemRecord[];
  adjustments?: BOQAdjustmentRecord[];
  approvals?: BOQApprovalRecord[];
}

export interface BOQRecord {
  id: string;
  caseId: string;
  caseReference: string;
  projectId?: string;
  boqReference: string;
  estimateType: BOQEstimateType;
  title: string;
  status: BOQStatus;
  currency: string;
  scopeDescription?: string;
  approximateAreaSqFt?: string;
  preferredSpecification?: string;
  notes?: string;
  currentRevisionId?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  currentRevision?: BOQRevisionRecord;
  revisions?: BOQRevisionRecord[];
  approvals?: BOQApprovalRecord[];
}

export interface QuotationItemRecord {
  id: string;
  quotationId: string;
  boqItemId: string;
  itemCode?: string;
  description?: string;
  offeredBrand: string;
  offeredSpecification: string;
  quantity: number;
  unit: string;
  unitRate: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
  availability: string;
  leadTime: string;
  specCompliance: QuotationSpecCompliance;
  notes?: string;
}

export interface QuotationRecord {
  id: string;
  caseId: string;
  boqId: string;
  boqReference?: string;
  providerId: string;
  providerName: string;
  providerFirm: string;
  providerCity?: string;
  quotationReference: string;
  status: QuotationStatus;
  validityDate: string;
  subtotal: number;
  taxTotal: number;
  freight: number;
  discount: number;
  grandTotal: number;
  leadTimeDays: number;
  warrantyMonths?: number;
  paymentTerms?: string;
  notes?: string;
  items?: QuotationItemRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface NormalizedComparisonItem {
  boqItemId: string;
  itemCode: string;
  section: string;
  description: string;
  canonicalSpec: string;
  canonicalBrand?: string;
  quantity: number;
  unit: string;
  estimatedRate: number;
  estimatedTotal: number;
  quotes: Array<{
    quotationId: string;
    providerId: string;
    providerFirm: string;
    offeredBrand: string;
    offeredSpecification: string;
    unitRate: number;
    taxRate: number;
    lineTotal: number;
    leadTime: string;
    availability: string;
    specCompliance: QuotationSpecCompliance;
    variancePercent: number; // diff from estimated rate
  }>;
}

export interface QuotationComparisonSummary {
  boq: BOQRecord;
  revision: BOQRevisionRecord;
  quotations: QuotationRecord[];
  comparisonItems: NormalizedComparisonItem[];
  lowestCommercialQuoteId: string | null;
  highestSpecComplianceQuoteId: string | null;
  fastestDeliveryQuoteId: string | null;
  boqBaselineTotal?: number;
  itemsComparison?: any[];
  summary?: any;
}

export type QuotationComparisonMatrix = QuotationComparisonSummary;

// Zod Input Schemas
export const CreateBOQRequestSchema = z.object({
  caseId: z.string().min(1, 'Case ID is required'),
  title: z.string().min(3, 'Title is required'),
  estimateType: z.enum([
    'CONCEPTUAL_ESTIMATE',
    'PRELIMINARY_ESTIMATE',
    'PRELIMINARY_BOQ',
    'DETAILED_BOQ',
    'REVISED_ESTIMATE',
    'FINAL_EXECUTION_BILL',
    'RENOVATION_ESTIMATE',
    'MEP_ESTIMATE',
    'MATERIAL_ESTIMATE',
    'SERVICE_ESTIMATE',
  ]),
  scopeDescription: z.string().optional(),
  approximateAreaSqFt: z.string().optional(),
  preferredSpecification: z.string().optional(),
  notes: z.string().optional(),
  projectId: z.string().optional(),
});

export type CreateBOQRequestInput = z.infer<typeof CreateBOQRequestSchema>;

export const BOQItemInputSchema = z.object({
  id: z.string().optional(),
  section: z.string().min(1, 'Section is required'),
  itemCode: z.string().default(''),
  description: z.string().min(1, 'Description is required'),
  specification: z.string().default(''),
  brand: z.string().optional(),
  grade: z.string().optional(),
  size: z.string().optional(),
  thickness: z.string().optional(),
  model: z.string().optional(),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit is required'),
  baseRate: z.number().nonnegative('Base rate cannot be negative'),
  taxRate: z.number().nonnegative().default(18),
  rateSource: z.enum(['MANUAL', 'CONSULTANT_ESTIMATE', 'VENDOR_QUOTE', 'CATALOG', 'CPWD_DSR', 'MARKET_SURVEY', 'HISTORICAL_PROJECT', 'ADMIN_RATE', 'OTHER']).default('CONSULTANT_ESTIMATE'),
  rateSourceReference: z.string().optional(),
  sortOrder: z.number().default(0),
});

export const BOQAdjustmentInputSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['DISCOUNT', 'CONTINGENCY', 'OVERHEAD', 'FREIGHT', 'SITE_SAFETY', 'SUPERVISION_FEE', 'LOGISTICS_MARGIN', 'OTHER']),
  label: z.string().min(1, 'Label is required'),
  calculationType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  value: z.number(),
});

export const SaveBOQRevisionInputSchema = z.object({
  notes: z.string().optional(),
  items: z.array(BOQItemInputSchema).min(1, 'At least one BOQ item is required'),
  adjustments: z.array(BOQAdjustmentInputSchema).optional(),
});

export type SaveBOQRevisionInput = z.infer<typeof SaveBOQRevisionInputSchema>;

export const BOQApprovalInputSchema = z.object({
  decision: z.enum(['APPROVED', 'CHANGES_REQUESTED', 'REJECTED']),
  reasonCategory: z.string().optional(),
  comment: z.string().min(3, 'Comment or reason is required'),
});

export const CreateQuotationInputSchema = z.object({
  boqId: z.string().min(1, 'BOQ ID is required'),
  providerFirm: z.string().min(1, 'Provider firm name is required'),
  providerCity: z.string().optional(),
  validityDays: z.number().int().positive().default(30),
  freight: z.number().nonnegative().default(0),
  discount: z.number().nonnegative().default(0),
  leadTimeDays: z.number().int().positive().default(7),
  warrantyMonths: z.number().int().nonnegative().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    boqItemId: z.string().min(1),
    offeredBrand: z.string().min(1, 'Brand is required'),
    offeredSpecification: z.string().min(1, 'Specification is required'),
    quantity: z.number().positive(),
    unitRate: z.number().nonnegative(),
    taxRate: z.number().nonnegative().default(18),
    availability: z.string().default('In Stock'),
    leadTime: z.string().default('3-5 Days'),
    specCompliance: z.enum(['EXACT', 'EQUIVALENT', 'DEVIATED', 'SUPERIOR']).default('EXACT'),
    notes: z.string().optional(),
  })).min(1, 'At least one quotation item is required'),
});

export type CreateQuotationInput = z.infer<typeof CreateQuotationInputSchema>;

// ==========================================
// Phase 9: Commercial & Outsourcing Engine
// ==========================================

export type WorkModelType = 
  | 'IN_HOUSE' 
  | 'CONSULTANT' 
  | 'FREELANCER' 
  | 'OUTSOURCE_AGENCY' 
  | 'VENDOR' 
  | 'EPC_PARTNER' 
  | 'HYBRID' 
  | 'REFERRAL_ONLY';

export type CommercialModelType = 
  | 'REVENUE_SHARE' 
  | 'FIXED_COMMISSION' 
  | 'MILESTONE_COMMISSION';

export type MarginType = 
  | 'PERCENTAGE' 
  | 'FIXED' 
  | 'SLAB_BASED' 
  | 'CATEGORY_WISE' 
  | 'PARTNER_WISE' 
  | 'LOCATION_WISE' 
  | 'URGENCY';

export type WorkPackageStatus = 
  | 'PENDING_ASSIGNMENT' 
  | 'BIDDING_OPEN' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'SUBMITTED' 
  | 'APPROVED' 
  | 'COMPLETED' 
  | 'ON_HOLD'
  | 'DISPUTED';

export type MarginHealthStatus = 
  | 'HEALTHY' 
  | 'LOW_MARGIN_WARNING' 
  | 'NEGATIVE_MARGIN_ALERT';

export interface ServiceWorkPackageTemplate {
  packageKey: string;
  name: string;
  scope: string;
  defaultWorkModel: WorkModelType;
  defaultSkill: string;
  indicativeCostPercentage: number; // % of total project base cost
  estimatedDays: number;
}

export interface ServiceCommercialRuleRecord {
  id: string;
  serviceSlug: string;
  serviceName: string;
  pillar: PillarType;
  active: boolean;
  defaultWorkModel: WorkModelType;
  allowedWorkModels: WorkModelType[];
  commercialModel: CommercialModelType;
  
  // Margin Engine Config
  marginType: MarginType;
  defaultMarginPercent: number; // e.g. 15 for 15%
  fixedMarginAmount?: number; // e.g. 5000
  slabRules?: Array<{ minAmount: number; maxAmount: number; marginPercent: number }>;
  minMarginPercent: number; // e.g. 8% protection floor
  expressMultiplier: number; // e.g. 1.25 for express delivery
  
  // Multi-Party Revenue Sharing Percentages (totaling ~100% or defined split)
  defaultSplit: {
    providerSharePercent: number;    // e.g. 65%
    consultantSharePercent: number;  // e.g. 10%
    freelancerSharePercent: number;  // e.g. 0-25%
    referralSharePercent: number;    // e.g. 5%
    coordinatorSharePercent: number; // e.g. 5%
    platformGrossMarginPercent: number; // e.g. 15%
  };
  
  // Freelancer & Partner Rules
  freelancerMaxPayPercent: number; // e.g. 70% of work package value
  referralFixedBonus?: number;
  
  // Work Packages Breakdown definition for this service
  workPackageTemplates: ServiceWorkPackageTemplate[];
  
  taxRatePercent: number; // default 18
  version: number;
  effectiveFrom: string;
  updatedAt: string;
}

export interface WorkPackageRecord {
  id: string;
  packageReference: string; // e.g. BEG-WP-SOLAR-001
  caseId: string;
  caseReference: string;
  projectId?: string;
  title: string;
  serviceSlug: string;
  packageCategory: string;
  scopeDescription: string;
  deliverablesSummary: string[];
  
  // Financial & Commercial
  budget: number;           // Target client / package budget
  estimatedCost: number;    // Direct cost payable to executor (Freelancer/Agency/Vendor)
  sellPrice: number;        // Final billed price to client
  marginAmount: number;     // sellPrice - estimatedCost
  marginPercentage: number; // (marginAmount / sellPrice) * 100
  marginStatus: MarginHealthStatus;
  
  // Outsourcing & Assignment
  workModel: WorkModelType;
  commercialModel: CommercialModelType;
  assignedPartyId?: string;
  assignedPartyName?: string;
  assignedPartyRole?: 'FREELANCER' | 'CONSULTANT' | 'AGENCY' | 'VENDOR' | 'EPC_PARTNER' | 'EMPLOYEE';
  assignedPartyEmail?: string;
  
  // Schedule & Execution
  status: WorkPackageStatus;
  dueDate: string;
  startedAt?: string;
  submittedAt?: string;
  approvedAt?: string;
  completedAt?: string;
  
  // Multi-party Payout Distribution for this package
  payoutBreakdown: {
    payableToExecutor: number;
    consultantReviewFee: number;
    platformRetainedMargin: number;
    tdsApplicable: number;
    netPayout: number;
    payoutStatus: 'PENDING_APPROVAL' | 'APPROVED' | 'HELD' | 'PROCESSED' | 'PAID';
  };
  
  // Bidding & Quotes
  allowsBidding: boolean;
  bidsCount: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface FreelancerOpportunityRecord {
  id: string;
  opportunityReference: string; // e.g. BEG-OPP-2026-4421
  title: string;
  serviceSlug: string;
  serviceName: string;
  pillar: PillarType;
  category: string;
  scopeSummary: string;
  skillsRequired: string[];
  location: string;
  workType: 'REMOTE' | 'ON_SITE' | 'HYBRID';
  budgetMin: number;
  budgetMax: number;
  urgency: 'NORMAL' | 'EXPRESS' | 'CRITICAL';
  deadline: string;
  status: 'OPEN' | 'SHORTLISTING' | 'AWARDED' | 'CLOSED';
  workPackageId?: string;
  caseId?: string;
  applicationsCount: number;
  createdAt: string;
}

export interface FreelancerBidRecord {
  id: string;
  opportunityId: string;
  freelancerId: string;
  freelancerName: string;
  freelancerRating: number;
  freelancerExperienceYears: number;
  freelancerCity: string;
  bidAmount: number;
  deliveryDays: number;
  proposedTimeline: string;
  coverNote: string;
  portfolioUrl?: string;
  status: 'SUBMITTED' | 'SHORTLISTED' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
}

export interface FreelancerProfileRecord {
  id: string;
  userId: string;
  fullName: string;
  email: string; // internal protected
  phone?: string; // internal protected
  city: string;
  state: string;
  verifiedStatus: 'VERIFIED' | 'UNDER_REVIEW' | 'PENDING';
  tier: 'PREFERRED_PARTNER' | 'VERIFIED_FREELANCER' | 'PROBATION';
  skills: string[];
  categories: string[];
  experienceYears: number;
  workPreference: 'REMOTE' | 'ON_SITE' | 'HYBRID';
  rating: number;
  reviewCount: number;
  responseTimeHours: number;
  completedAssignments: number;
  onTimeDeliveryPercent: number;
  reworkRatePercent: number;
  totalEarnings: number;
  pendingPayout: number;
  bio: string;
  certifications: string[];
  portfolioItems: Array<{ title: string; category: string; description: string }>;
  activeWorkPackagesCount: number;
}

export interface ReferralRecord {
  id: string;
  referralCode: string; // e.g. BEG-REF-8921
  referrerId: string;
  referrerName: string;
  referrerRole: 'CONSULTANT' | 'FREELANCER' | 'PARTNER' | 'CUSTOMER';
  referredClientName: string;
  referredClientCity: string;
  serviceCategory: string;
  caseId?: string;
  caseReference?: string;
  status: 
    | 'ENQUIRY_RECEIVED' 
    | 'QUALIFIED' 
    | 'CONVERTED' 
    | 'COMMISSION_ELIGIBLE' 
    | 'COMMISSION_APPROVED' 
    | 'COMMISSION_PAID';
  projectValue: number;
  commissionRatePercent: number;
  commissionAmount: number;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerLedgerTransaction {
  id: string;
  date: string;
  type: 'EARNING' | 'PAYOUT' | 'COMMISSION' | 'REFERRAL' | 'ADJUSTMENT' | 'TDS_DEDUCTION';
  referenceNo: string;
  description: string;
  grossAmount: number;
  tdsDeducted: number;
  netAmount: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'PROCESSING' | 'SETTLED' | 'HELD';
  notes?: string;
}

export interface PartnerWalletLedgerRecord {
  partnerId: string;
  partnerName: string;
  partnerRole: 'FREELANCER' | 'CONSULTANT' | 'AGENCY' | 'REFERRAL_PARTNER' | 'VENDOR';
  openingBalance: number;
  newEarnings: number;
  pendingApproval: number;
  payableAmount: number;
  paidAmount: number;
  totalTdsDeducted: number;
  currency: string;
  transactions: PartnerLedgerTransaction[];
}

export interface MultiPartySplitCalculationInput {
  serviceSlug: string;
  quoteAmount: number;
  workModel?: WorkModelType;
  urgency?: 'NORMAL' | 'EXPRESS';
  customOverrides?: {
    providerPercent?: number;
    consultantPercent?: number;
    freelancerPercent?: number;
    referralPercent?: number;
    coordinatorPercent?: number;
    marginPercent?: number;
  };
}

export interface MultiPartySplitCalculationResult {
  serviceSlug: string;
  serviceName: string;
  workModel: WorkModelType;
  grossCustomerQuote: number;
  taxAmount: number; // 18% GST
  netCustomerQuoteBeforeTax: number;
  
  // Breakdown
  providerPayable: number;
  providerPercent: number;
  
  consultantCommission: number;
  consultantPercent: number;
  
  freelancerPayable: number;
  freelancerPercent: number;
  
  referralShare: number;
  referralPercent: number;
  
  coordinatorFee: number;
  coordinatorPercent: number;
  
  platformGrossMargin: number;
  platformGrossMarginPercent: number;
  
  estimatedPlatformDirectCosts: number;
  platformNetMargin: number;
  platformNetMarginPercent: number;
  
  marginStatus: MarginHealthStatus;
  marginWarningMessage?: string;
  effectiveRuleVersion: number;
}

export interface CommercialAnalyticsOverviewRecord {
  totalWorkValue: number;
  outsourcedValue: number;
  freelancerValue: number;
  consultantPayoutsTotal: number;
  vendorPayoutsTotal: number;
  commissionsGeneratedTotal: number;
  commissionsPaidTotal: number;
  referralCostsTotal: number;
  platformGrossMarginTotal: number;
  platformNetMarginTotal: number;
  averageMarginPercentage: number;
  
  categoryPerformance: Array<{
    serviceSlug: string;
    serviceName: string;
    pillar: PillarType;
    enquiriesCount: number;
    convertedCount: number;
    conversionRatePercent: number;
    totalRevenue: number;
    outsourceCost: number;
    grossMargin: number;
    marginPercent: number;
    avgCompletionDays: number;
    complaintRatePercent: number;
  }>;
  
  freelancerNetworkStats: {
    totalFreelancers: number;
    activeWorkPackages: number;
    avgAcceptanceRatePercent: number;
    avgOnTimeDeliveryPercent: number;
    avgReworkRatePercent: number;
    topPerformersCount: number;
  };
}

export type CommercialAnalyticsSummary = CommercialAnalyticsOverviewRecord;

// Zod Schemas for API Validation
export const CreateWorkPackageInputSchema = z.object({
  caseId: z.string().min(1, 'Case ID is required'),
  title: z.string().min(3, 'Title is required'),
  serviceSlug: z.string().min(1, 'Service category is required'),
  packageCategory: z.string().default('GENERAL'),
  scopeDescription: z.string().min(5, 'Scope description is required'),
  deliverablesSummary: z.array(z.string()).default([]),
  budget: z.number().positive('Budget must be positive'),
  estimatedCost: z.number().nonnegative('Estimated cost cannot be negative'),
  sellPrice: z.number().positive('Sell price must be positive'),
  workModel: z.enum(['IN_HOUSE', 'CONSULTANT', 'FREELANCER', 'OUTSOURCE_AGENCY', 'VENDOR', 'EPC_PARTNER', 'HYBRID', 'REFERRAL_ONLY']).default('FREELANCER'),
  commercialModel: z.enum(['REVENUE_SHARE', 'FIXED_COMMISSION', 'MILESTONE_COMMISSION']).default('REVENUE_SHARE'),
  assignedPartyId: z.string().optional(),
  assignedPartyName: z.string().optional(),
  assignedPartyRole: z.enum(['FREELANCER', 'CONSULTANT', 'AGENCY', 'VENDOR', 'EPC_PARTNER', 'EMPLOYEE']).optional(),
  dueDate: z.string().min(4, 'Due date is required'),
  allowsBidding: z.boolean().default(false),
});

export type CreateWorkPackageInput = z.infer<typeof CreateWorkPackageInputSchema>;

export const UpdateServiceCommercialRuleInputSchema = z.object({
  serviceSlug: z.string().min(1),
  defaultWorkModel: z.enum(['IN_HOUSE', 'CONSULTANT', 'FREELANCER', 'OUTSOURCE_AGENCY', 'VENDOR', 'EPC_PARTNER', 'HYBRID', 'REFERRAL_ONLY']),
  commercialModel: z.enum(['REVENUE_SHARE', 'FIXED_COMMISSION', 'MILESTONE_COMMISSION']),
  marginType: z.enum(['PERCENTAGE', 'FIXED', 'SLAB_BASED', 'CATEGORY_WISE', 'PARTNER_WISE', 'LOCATION_WISE', 'URGENCY']),
  defaultMarginPercent: z.number().min(0).max(100),
  fixedMarginAmount: z.number().min(0).optional(),
  minMarginPercent: z.number().min(0).max(100).default(8),
  expressMultiplier: z.number().min(1).default(1.25),
  defaultSplit: z.object({
    providerSharePercent: z.number().min(0).max(100),
    consultantSharePercent: z.number().min(0).max(100),
    freelancerSharePercent: z.number().min(0).max(100),
    referralSharePercent: z.number().min(0).max(100),
    coordinatorSharePercent: z.number().min(0).max(100),
    platformGrossMarginPercent: z.number().min(0).max(100),
  }),
  freelancerMaxPayPercent: z.number().min(0).max(100).default(70),
  taxRatePercent: z.number().default(18),
});

export type UpdateServiceCommercialRuleInput = z.infer<typeof UpdateServiceCommercialRuleInputSchema>;

export const SubmitFreelancerBidInputSchema = z.object({
  opportunityId: z.string().min(1),
  bidAmount: z.number().positive('Bid amount must be positive'),
  deliveryDays: z.number().int().positive('Delivery days must be at least 1'),
  proposedTimeline: z.string().min(3, 'Timeline summary is required'),
  coverNote: z.string().min(10, 'Cover note is required'),
  portfolioUrl: z.string().optional(),
});

export type SubmitFreelancerBidInput = z.infer<typeof SubmitFreelancerBidInputSchema>;

export const CreateReferralInputSchema = z.object({
  referredClientName: z.string().min(2, 'Client name is required'),
  referredClientCity: z.string().min(2, 'Client city is required'),
  serviceCategory: z.string().min(2, 'Service category is required'),
  projectValueEstimate: z.number().positive().default(100000),
});

export type CreateReferralInput = z.infer<typeof CreateReferralInputSchema>;
