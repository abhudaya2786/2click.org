import crypto from 'crypto';
import { 
  CaseRecord, 
  CaseEvent, 
  CaseEventType,
  CaseStatus,
  ConsultantRecord, 
  ProjectMilestoneRecord, 
  DocumentRecord,
  CaseIntakeInput,
  ConsultantOnboardingInput,
  PillarType,
  ServiceCategoryRecord,
  CaseStatusHistoryRecord,
  AssignmentRecord,
  LeadAssignmentStatus,
  CaseInformationRequestRecord,
  CaseNoteRecord,
  CaseMessageRecord,
  NotificationRecord,
  ConsultantMatchResult,
  BOQEstimateType,
  BOQStatus,
  BOQRevisionStatus,
  RateSource,
  BOQAdjustmentType,
  CalculationType,
  QuotationStatus,
  QuotationSpecCompliance,
  TaxCodeRecord,
  BOQItemRecord,
  BOQAdjustmentRecord,
  BOQApprovalRecord,
  BOQRevisionRecord,
  BOQRecord,
  QuotationItemRecord,
  QuotationRecord,
  NormalizedComparisonItem,
  QuotationComparisonSummary,
  WorkModelType,
  CommercialModelType,
  MarginType,
  WorkPackageStatus,
  MarginHealthStatus,
  ServiceCommercialRuleRecord,
  WorkPackageRecord,
  FreelancerOpportunityRecord,
  FreelancerBidRecord,
  FreelancerProfileRecord,
  ReferralRecord,
  PartnerLedgerTransaction,
  PartnerWalletLedgerRecord,
  MultiPartySplitCalculationInput,
  MultiPartySplitCalculationResult,
  CommercialAnalyticsOverviewRecord,
  CreateWorkPackageInput,
  UpdateServiceCommercialRuleInput,
  SubmitFreelancerBidInput,
  CreateReferralInput
} from '../src/types/backend';
import type { EnrollmentRecord, EnrollmentIntakeInput, EnrollmentStatus, PublicTrackRecord, TrackMilestoneEntry, TrackStatusHistoryEntry } from '../src/types/backend';
import { SafeUser, UserRole, UserStatus } from '../src/types/auth';
import { assertCaseAccess, userCanAccessCase } from './security/caseAccess';
import { 
  calculateBOQItemLine, 
  calculateBOQRevisionTotals, 
  round2, 
  formatINR 
} from '../src/lib/money';

export interface AuditLogRecord {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress?: string;
  changes?: Record<string, any>;
  timestamp: string;
}

/** Starter line items so new BOQs are immediately quotable (matches BOQEditorModal defaults). */
function buildStarterBOQTemplate(revisionId: string, now: string): {
  items: BOQItemRecord[];
  adjustments: BOQAdjustmentRecord[];
  totals: ReturnType<typeof calculateBOQRevisionTotals>;
} {
  const rawItems = [
    {
      section: 'Civil & Foundation',
      itemCode: 'CIV-001',
      description: 'Foundation Excavation & Raft Footings',
      specification: 'Depth up to 3m, mechanical backhoe',
      brand: 'Standard JCB',
      quantity: 100,
      unit: 'Cu M',
      baseRate: 350,
      taxRate: 18,
    },
    {
      section: 'Civil & Foundation',
      itemCode: 'CIV-002',
      description: 'Ready Mix Concrete M30 for RCC',
      specification: 'M30 design mix per IS 456:2000',
      brand: 'UltraTech RMC',
      quantity: 50,
      unit: 'Cu M',
      baseRate: 5800,
      taxRate: 18,
    },
    {
      section: 'Structural Steel',
      itemCode: 'STR-001',
      description: 'Fe 550D TMT Rebar for columns & beams',
      specification: 'IS 1786:2008 compliant',
      brand: 'Tata Tiscon',
      quantity: 12,
      unit: 'MT',
      baseRate: 72000,
      taxRate: 18,
    },
  ];

  const items: BOQItemRecord[] = rawItems.map((raw, idx) => {
    const { taxAmount, lineTotal } = calculateBOQItemLine({
      quantity: raw.quantity,
      baseRate: raw.baseRate,
      taxRate: raw.taxRate,
    });
    return {
      id: `item-${crypto.randomUUID().slice(0, 8)}`,
      revisionId,
      section: raw.section,
      itemCode: raw.itemCode,
      description: raw.description,
      specification: raw.specification,
      brand: raw.brand,
      quantity: raw.quantity,
      unit: raw.unit,
      baseRate: raw.baseRate,
      taxRate: raw.taxRate,
      taxAmount,
      lineTotal,
      rateSource: 'CONSULTANT_ESTIMATE' as RateSource,
      sortOrder: idx + 1,
      createdAt: now,
    };
  });

  const adjustments: BOQAdjustmentRecord[] = [
    {
      id: `adj-${crypto.randomUUID().slice(0, 8)}`,
      revisionId,
      type: 'CONTINGENCY',
      label: 'Unforeseen Site Contingency (3%)',
      calculationType: 'PERCENTAGE',
      value: 3,
      amount: 0,
    },
  ];

  const totals = calculateBOQRevisionTotals(items, adjustments);
  adjustments[0].amount = totals.adjustmentTotal;

  return { items, adjustments, totals };
}

// Runtime store acting as repository layer with event sourcing log
class DataStore {
  private users: Map<string, SafeUser> = new Map(); // By ID
  private usersByEmail: Map<string, string> = new Map(); // Email -> ID
  private usersByFirebaseUid: Map<string, string> = new Map(); // FirebaseUid -> ID
  private auditLogs: AuditLogRecord[] = [];
  
  private serviceCategories: Map<string, ServiceCategoryRecord> = new Map(); // slug -> category
  private cases: Map<string, CaseRecord> = new Map(); // caseId and caseReference -> CaseRecord
  private caseStatusHistory: CaseStatusHistoryRecord[] = [];
  private assignments: Map<string, AssignmentRecord> = new Map(); // assignmentId -> AssignmentRecord
  private informationRequests: Map<string, CaseInformationRequestRecord> = new Map();
  private caseNotes: CaseNoteRecord[] = [];
  private caseMessages: CaseMessageRecord[] = [];
  private notifications: NotificationRecord[] = [];

  // Phase 6: Commercial Storage
  private taxCodes: Map<string, TaxCodeRecord> = new Map();
  private boqs: Map<string, BOQRecord> = new Map(); // boqId and boqReference -> BOQRecord
  private boqRevisions: Map<string, BOQRevisionRecord> = new Map(); // revisionId -> BOQRevisionRecord
  private boqItems: Map<string, BOQItemRecord[]> = new Map(); // revisionId -> BOQItemRecord[]
  private boqAdjustments: Map<string, BOQAdjustmentRecord[]> = new Map(); // revisionId -> BOQAdjustmentRecord[]
  private boqApprovals: Map<string, BOQApprovalRecord[]> = new Map(); // boqId -> BOQApprovalRecord[]
  private quotations: Map<string, QuotationRecord> = new Map(); // quotationId and quotationReference -> QuotationRecord
  private quotationItems: Map<string, QuotationItemRecord[]> = new Map(); // quotationId -> QuotationItemRecord[]

  // Phase 9: Category-wise Outsourcing & Commercial Engine Storage
  private serviceCommercialRules: Map<string, ServiceCommercialRuleRecord> = new Map(); // serviceSlug -> Rule
  private workPackages: Map<string, WorkPackageRecord> = new Map(); // id & packageReference -> Record
  private freelancerOpportunities: Map<string, FreelancerOpportunityRecord> = new Map(); // id & ref -> Record
  private freelancerBids: Map<string, FreelancerBidRecord[]> = new Map(); // opportunityId -> bids
  private freelancerProfiles: Map<string, FreelancerProfileRecord> = new Map(); // userId & id -> Profile
  private referrals: Map<string, ReferralRecord> = new Map(); // id & referralCode -> Record
  private partnerLedgers: Map<string, PartnerWalletLedgerRecord> = new Map(); // partnerId -> Ledger

  private events: CaseEvent[] = [];
  private consultants: Map<string, ConsultantRecord> = new Map();
  private milestones: Map<string, ProjectMilestoneRecord[]> = new Map();
  private documents: Map<string, DocumentRecord[]> = new Map();
  private caseCounter = 4093;
  private enrollments: Map<string, EnrollmentRecord> = new Map();
  private enrollmentCounter = 882;

  constructor() {
    this.seedInitialData();
    this.seedCommercialAndOutsourcingData();
  }

  private seedInitialData() {
    // Seed initial users for all roles
    const initialUsers: SafeUser[] = [
      {
        id: 'usr-superadmin-01',
        email: 'superadmin@buildecogroup.in',
        fullName: 'Rajeshwar Varma (Super Admin)',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        createdAt: new Date('2025-01-01T00:00:00Z').toISOString(),
        profile: {
          organization: 'BuildEcoGroup Directorate',
          designation: 'Chief Platform Architect',
          city: 'Bengaluru',
          stateRegion: 'Karnataka',
        }
      },
      {
        id: 'usr-admin-01',
        email: 'admin@buildecogroup.in',
        fullName: 'Priya Sundaram (Admin Ops)',
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        createdAt: new Date('2025-01-05T00:00:00Z').toISOString(),
        profile: {
          organization: 'BuildEcoGroup Operations',
          designation: 'Director of Specialist Empanelment',
          city: 'Mumbai',
          stateRegion: 'Maharashtra',
        }
      },
      {
        id: 'usr-coord-01',
        email: 'coordinator@buildecogroup.in',
        fullName: 'Rohan Sharma (Coordinator)',
        role: 'EMPLOYEE',
        status: 'ACTIVE',
        emailVerified: true,
        createdAt: new Date('2025-01-08T00:00:00Z').toISOString(),
        profile: {
          organization: 'BuildEcoGroup Technical Coordination',
          designation: 'Lead Case Coordinator',
          city: 'Bengaluru',
          stateRegion: 'Karnataka',
        }
      },
      {
        id: 'usr-consultant-01',
        email: 'elena.rostova@beg-partner.in',
        fullName: 'Dr. Elena Rostova',
        phone: '+91 98450 99881',
        role: 'CONSULTANT',
        status: 'ACTIVE',
        emailVerified: true,
        createdAt: new Date('2025-01-10T10:00:00Z').toISOString(),
        profile: {
          organization: 'Rostova Structural Dynamics',
          designation: 'Principal Structural Engineer',
          city: 'Bengaluru',
          stateRegion: 'Karnataka',
        }
      },
      {
        id: 'usr-consultant-02',
        email: 'marcus.chen@bioclimatic-studio.com',
        fullName: 'Marcus Chen',
        phone: '+91 98200 44551',
        role: 'CONSULTANT',
        status: 'ACTIVE',
        emailVerified: true,
        createdAt: new Date('2025-02-14T10:00:00Z').toISOString(),
        profile: {
          organization: 'BioClimatic Studio LLP',
          designation: 'Lead Bioclimatic Architect',
          city: 'Mumbai',
          stateRegion: 'Maharashtra',
        }
      },
      {
        id: 'usr-consultant-03',
        email: 'sarah.jenkins@spatialgeo.in',
        fullName: 'Sarah Jenkins, PE',
        phone: '+91 98490 11223',
        role: 'CONSULTANT',
        status: 'ACTIVE',
        emailVerified: true,
        createdAt: new Date('2025-03-01T10:00:00Z').toISOString(),
        profile: {
          organization: 'Jenkins Geospatial Systems',
          designation: 'Senior Geospatial Lead',
          city: 'Hyderabad',
          stateRegion: 'Telangana',
        }
      },
      {
        id: 'usr-consultant-04',
        email: 'david.kalu@mepdynamics.in',
        fullName: 'David Kalu',
        phone: '+91 98110 33445',
        role: 'CONSULTANT',
        status: 'ACTIVE',
        emailVerified: true,
        createdAt: new Date('2025-01-20T10:00:00Z').toISOString(),
        profile: {
          organization: 'Kalu MEP Directorate',
          designation: 'Director of MEP & Building Physics',
          city: 'New Delhi',
          stateRegion: 'Delhi',
        }
      },
      {
        id: 'usr-consultant-abbhudaya',
        email: 'abbhudaya@buildecogroup.in',
        fullName: 'Abbhudaya',
        phone: '+91 98380 11234',
        role: 'CONSULTANT',
        status: 'ACTIVE',
        emailVerified: true,
        createdAt: new Date('2025-04-01T10:00:00Z').toISOString(),
        profile: {
          organization: 'Abbhudaya Architecture Studio',
          designation: 'Principal Architect & Land Development Specialist',
          city: 'Lucknow',
          stateRegion: 'Uttar Pradesh',
        }
      },
      {
        id: 'usr-consultant-abhishek',
        email: 'abhishek.mishra@buildecogroup.in',
        fullName: 'Abhishek Mishra',
        phone: '+91 98380 55678',
        role: 'CONSULTANT',
        status: 'ACTIVE',
        emailVerified: true,
        createdAt: new Date('2025-04-15T10:00:00Z').toISOString(),
        profile: {
          organization: 'Mishra Structural Consultants',
          designation: 'Senior Structural Engineer & BOQ Specialist',
          city: 'Gorakhpur',
          stateRegion: 'Uttar Pradesh',
        }
      },
      {
        id: 'usr-client-01',
        email: 'aditya.vardhan@ecoventures.in',
        fullName: 'Aditya Vardhan',
        phone: '+91 98450 12345',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        emailVerified: true,
        createdAt: new Date('2025-02-01T10:00:00Z').toISOString(),
        profile: {
          organization: 'EcoVentures Living LLP',
          designation: 'Managing Director',
          city: 'Bengaluru',
          stateRegion: 'Karnataka',
        }
      },
      {
        id: 'usr-client-02',
        email: 'customer.test@example.com',
        fullName: 'Siddharth Rao',
        phone: '+91 98765 43210',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        emailVerified: true,
        createdAt: new Date('2025-02-10T10:00:00Z').toISOString(),
        profile: {
          organization: 'Green Ridge Homes',
          designation: 'Property Owner',
          city: 'Pune',
          stateRegion: 'Maharashtra',
        }
      },
      {
        id: 'usr-suspended-01',
        email: 'suspended.user@example.com',
        fullName: 'Suspended Account User',
        role: 'CUSTOMER',
        status: 'SUSPENDED',
        emailVerified: true,
        createdAt: new Date('2025-02-15T10:00:00Z').toISOString(),
        profile: {
          organization: 'Flagged Entity',
          city: 'Delhi',
        }
      },
      // Independent Providers / Suppliers
      {
        id: 'usr-provider-01',
        email: 'supply@ultratech-direct.in',
        fullName: 'Vikramaditya Singhania',
        phone: '+91 98200 44551',
        role: 'EMPLOYEE', // or supplier role
        status: 'ACTIVE',
        emailVerified: true,
        createdAt: new Date('2025-01-15T10:00:00Z').toISOString(),
        profile: {
          organization: 'Apex Building Materials & Cement Supplies Ltd',
          designation: 'Commercial Sales Director',
          city: 'Mumbai',
          stateRegion: 'Maharashtra',
        }
      },
      {
        id: 'usr-provider-02',
        email: 'infra@tatasteel-channel.in',
        fullName: 'Sanjay Deshmukh',
        phone: '+91 98111 22334',
        role: 'EMPLOYEE',
        status: 'ACTIVE',
        emailVerified: true,
        createdAt: new Date('2025-01-20T10:00:00Z').toISOString(),
        profile: {
          organization: 'Tata Structural Steel & Infrastructure LLP',
          designation: 'Regional Supply Manager',
          city: 'Pune',
          stateRegion: 'Maharashtra',
        }
      },
      {
        id: 'usr-provider-03',
        email: 'mep@ecosmart-tech.in',
        fullName: 'Kavita Chawla',
        phone: '+91 98333 77889',
        role: 'EMPLOYEE',
        status: 'ACTIVE',
        emailVerified: true,
        createdAt: new Date('2025-01-25T10:00:00Z').toISOString(),
        profile: {
          organization: 'EcoSmart MEP & Solar Solutions Private Ltd',
          designation: 'Technical Operations Head',
          city: 'Bengaluru',
          stateRegion: 'Karnataka',
        }
      }
    ];

    for (const u of initialUsers) {
      this.users.set(u.id, u);
      this.usersByEmail.set(u.email.toLowerCase(), u.id);
      if (u.firebaseUid) {
        this.usersByFirebaseUid.set(u.firebaseUid, u.id);
      }
    }

    // Seed Configurable Tax Codes
    const defaultTaxCodes: TaxCodeRecord[] = [
      {
        id: 'tax-00',
        code: 'GST_0',
        name: 'Exempt / Zero Rated (0%)',
        rate: 0,
        hsnSacCode: '9954',
        effectiveFrom: new Date('2024-01-01').toISOString(),
        active: true,
      },
      {
        id: 'tax-05',
        code: 'GST_5',
        name: 'GST 5% (Specified Materials & Affordable Housing)',
        rate: 5,
        hsnSacCode: '6810',
        effectiveFrom: new Date('2024-01-01').toISOString(),
        active: true,
      },
      {
        id: 'tax-12',
        code: 'GST_12',
        name: 'GST 12% (Government Infrastructure / Works Contract)',
        rate: 12,
        hsnSacCode: '995411',
        effectiveFrom: new Date('2024-01-01').toISOString(),
        active: true,
      },
      {
        id: 'tax-18',
        code: 'GST_18',
        name: 'GST 18% (Standard Construction & Consulting Services)',
        rate: 18,
        hsnSacCode: '998331',
        effectiveFrom: new Date('2024-01-01').toISOString(),
        active: true,
      },
      {
        id: 'tax-28',
        code: 'GST_28',
        name: 'GST 28% (Luxury Finishes & High-End Materials)',
        rate: 28,
        hsnSacCode: '2523',
        effectiveFrom: new Date('2024-01-01').toISOString(),
        active: true,
      },
    ];

    for (const tc of defaultTaxCodes) {
      this.taxCodes.set(tc.id, tc);
      this.taxCodes.set(tc.code, tc);
    }

    // Seed 5 Pillars & Database-backed Service Catalog
    const catalogData: ServiceCategoryRecord[] = [
      // 1. CONSTRUCTION_SERVICES
      {
        id: 'srv-101',
        slug: 'boq-estimation',
        name: 'BOQ & Bill of Quantities Estimation',
        pillar: 'CONSTRUCTION_SERVICES',
        description: 'Comprehensive itemized bill of quantities, material takeoff, rate analysis, and CPWD/DSR compliance benchmarking.',
        active: true,
        requiresLocation: true,
        requiresSiteDetails: true,
        requiresBudget: true,
        requiresDocuments: true,
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
      },
      {
        id: 'srv-102',
        slug: 'structural-engineering',
        name: 'Structural Engineering & Seismic Vetting',
        pillar: 'CONSTRUCTION_SERVICES',
        description: 'Seismic Zone compliance, mass timber and RCC framing structural calculations, and statutory foundation vetting.',
        active: true,
        requiresLocation: true,
        requiresSiteDetails: true,
        requiresBudget: true,
        requiresDocuments: true,
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
      },
      {
        id: 'srv-103',
        slug: 'turnkey-contracting',
        name: 'Turnkey Green Construction Execution',
        pillar: 'CONSTRUCTION_SERVICES',
        description: 'End-to-end low-carbon construction contracting with verified green materials and milestone-based supervisory QA/QC.',
        active: true,
        requiresLocation: true,
        requiresSiteDetails: true,
        requiresBudget: true,
        requiresDocuments: false,
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
      },
      {
        id: 'srv-104',
        slug: 'renovation-retrofitting',
        name: 'Ecological Renovation & Retrofitting',
        pillar: 'CONSTRUCTION_SERVICES',
        description: 'Structural reinforcement, building envelope thermal retrofitting, and energy efficiency upgrades for existing structures.',
        active: true,
        requiresLocation: true,
        requiresSiteDetails: true,
        requiresBudget: true,
        requiresDocuments: false,
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
      },

      // 2. SURVEILLANCE_SITE_TECH
      {
        id: 'srv-201',
        slug: 'site-surveillance-iot',
        name: 'AI Site Surveillance & 4G/5G Remote Cameras',
        pillar: 'SURVEILLANCE_SITE_TECH',
        description: 'Solar-powered PTZ cameras, autonomous perimeter intrusion detection, time-lapse construction feeds, and central monitoring.',
        active: true,
        requiresLocation: true,
        requiresSiteDetails: true,
        requiresBudget: true,
        requiresDocuments: false,
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
      },
      {
        id: 'srv-202',
        slug: 'smart-access-perimeter',
        name: 'Biometric Access Control & Smart Gates',
        pillar: 'SURVEILLANCE_SITE_TECH',
        description: 'Automated boom barriers, ANPR vehicle tracking, labor RFID/biometric attendance, and visitor management gateways.',
        active: true,
        requiresLocation: true,
        requiresSiteDetails: true,
        requiresBudget: true,
        requiresDocuments: false,
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
      },
      {
        id: 'srv-203',
        slug: 'iot-environmental-sensors',
        name: 'Site Environmental & Microclimate IoT',
        pillar: 'SURVEILLANCE_SITE_TECH',
        description: 'Real-time air particulate (PM2.5/PM10), acoustic decibel monitoring, concrete curing thermal probes, and weather telemetry.',
        active: true,
        requiresLocation: true,
        requiresSiteDetails: true,
        requiresBudget: false,
        requiresDocuments: false,
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
      },

      // 3. LAND_PROPERTY
      {
        id: 'srv-301',
        slug: 'property-due-diligence',
        name: 'Land Due Diligence & Title Verification',
        pillar: 'LAND_PROPERTY',
        description: '30-year revenue record search, RTC/7/12 check, encumbrance audit, master plan zoning compliance, and litigation risk check.',
        active: true,
        requiresLocation: true,
        requiresSiteDetails: true,
        requiresBudget: true,
        requiresDocuments: true,
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
      },
      {
        id: 'srv-302',
        slug: 'gis-terrain-modeling',
        name: 'GIS Spatial Modeling & Slope Hydrology',
        pillar: 'LAND_PROPERTY',
        description: 'LiDAR contour extraction, Digital Elevation Models (DEM), cut/fill optimization, watershed catchment, and slope stability.',
        active: true,
        requiresLocation: true,
        requiresSiteDetails: true,
        requiresBudget: true,
        requiresDocuments: false,
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
      },
      {
        id: 'srv-303',
        slug: 'boundary-survey-drone',
        name: 'Drone Photogrammetry & Boundary Survey',
        pillar: 'LAND_PROPERTY',
        description: 'Sub-centimeter RTK GPS boundary demarcation, high-resolution orthomosaic maps, and cadastral survey superposition.',
        active: true,
        requiresLocation: true,
        requiresSiteDetails: true,
        requiresBudget: true,
        requiresDocuments: false,
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
      },

      // 4. CONSULTANTS
      {
        id: 'srv-401',
        slug: 'bioclimatic-architecture',
        name: 'Bioclimatic Architecture & Passive Solar Design',
        pillar: 'CONSULTANTS',
        description: 'Climate-responsive building envelopes, daylight simulation, CFD natural ventilation loops, and GRIHA/IGBC certification design.',
        active: true,
        requiresLocation: true,
        requiresSiteDetails: true,
        requiresBudget: true,
        requiresDocuments: false,
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
      },
      {
        id: 'srv-402',
        slug: 'mep-systems',
        name: 'High-Efficiency MEP & Building Physics',
        pillar: 'CONSULTANTS',
        description: 'VRF HVAC engineering, greywater filtration plumbing loops, high-efficiency electrical layouts, and acoustic attenuation.',
        active: true,
        requiresLocation: true,
        requiresSiteDetails: true,
        requiresBudget: true,
        requiresDocuments: false,
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
      },
      {
        id: 'srv-403',
        slug: 'water-waste-treatment',
        name: 'Ecological Water & Wastewater Engineering',
        pillar: 'CONSULTANTS',
        description: 'Constructed wetland phytorid STP, rainwater harvesting aquifer recharge, and zero liquid discharge (ZLD) closed loops.',
        active: true,
        requiresLocation: true,
        requiresSiteDetails: true,
        requiresBudget: true,
        requiresDocuments: false,
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
      },
      {
        id: 'srv-404',
        slug: 'vastu-environmental-alignment',
        name: 'Vastu & Environmental Geobiology Alignment',
        pillar: 'CONSULTANTS',
        description: 'Scientific magnetic orientation audit, Vedic spatial grid alignment, and geo-pathic stress detection for holistic well-being.',
        active: true,
        requiresLocation: true,
        requiresSiteDetails: true,
        requiresBudget: true,
        requiresDocuments: false,
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
      },

      // 5. INNOVATION_STARTUPS
      {
        id: 'srv-501',
        slug: 'solar-pv-bipv',
        name: 'Rooftop Solar PV & Building Integrated PV (BIPV)',
        pillar: 'INNOVATION_STARTUPS',
        description: 'On-grid/hybrid solar power systems, solar glass facades, battery storage bank sizing, and DISCOM net-metering liaison.',
        active: true,
        requiresLocation: true,
        requiresSiteDetails: true,
        requiresBudget: true,
        requiresDocuments: false,
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
      },
      {
        id: 'srv-502',
        slug: 'low-carbon-materials',
        name: 'Low-Carbon Cement & Mass Timber Materials',
        pillar: 'INNOVATION_STARTUPS',
        description: 'Geopolymer cement, AAC blocks, compressed stabilized earth blocks (CSEB), and FSC-certified cross-laminated timber (CLT).',
        active: true,
        requiresLocation: true,
        requiresSiteDetails: true,
        requiresBudget: true,
        requiresDocuments: false,
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
      },
      {
        id: 'srv-503',
        slug: 'cleantech-incubation',
        name: 'Cleantech Pilot Deployment & Technology Licensing',
        pillar: 'INNOVATION_STARTUPS',
        description: 'Site testbeds for green construction hardware, carbon-capture additives, and smart energy optimization microgrids.',
        active: true,
        requiresLocation: true,
        requiresSiteDetails: true,
        requiresBudget: true,
        requiresDocuments: false,
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
      },
    ];

    for (const cat of catalogData) {
      this.serviceCategories.set(cat.slug, cat);
    }

    // Seed initial verified consultants
    const initialConsultants: ConsultantRecord[] = [
      {
        id: 'c-1',
        userId: 'usr-consultant-01',
        name: 'Dr. Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        title: 'Principal Structural & Seismic Consultant',
        department: 'Structural Engineering',
        specialization: 'Mass Timber & Seismic Resilience',
        city: 'Bengaluru',
        country: 'India',
        experienceYears: 18,
        rating: 4.98,
        completedCases: 42,
        verificationStatus: 'VERIFIED',
        status: 'Available',
        focusAreas: ['Seismic Audits', 'Mass Timber Engineering', 'High-Rise Foundation Vetting', 'Eurocode 5', 'Structural Engineering & Seismic Vetting', 'structural-engineering', 'boq-estimation'],
        bio: 'Former technical lead at global engineering consortiums with extensive experience in high-performance mass timber structures and deep-foundation geotechnical assessments across sensitive seismic zones.',
        certifications: ['Chartered Structural Engineer (IStructE)', 'LEED AP BD+C', 'PE Licensed'],
        education: 'Ph.D. in Structural Engineering, ETH Zurich',
        hourlyRateEst: '₹7,500 / hr',
        statutoryRegNumber: 'IStructE-UK-88492',
        firmName: 'Rostova Structural Dynamics',
        email: 'elena.rostova@beg-partner.in',
        phone: '+91 98450 99881',
        createdAt: new Date('2025-01-10T10:00:00Z').toISOString(),
        isDemo: true,
      },
      {
        id: 'c-2',
        userId: 'usr-consultant-02',
        name: 'Marcus Chen',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
        title: 'Lead Bioclimatic Architect & Passive Specialist',
        department: 'Architecture & Sustainable Design',
        specialization: 'Passive Solar & Tropical Bioclimatic Design',
        city: 'Mumbai',
        country: 'India',
        experienceYears: 15,
        rating: 4.95,
        completedCases: 38,
        verificationStatus: 'VERIFIED',
        status: 'Available',
        focusAreas: ['Natural Ventilation Modeling', 'Thermal Mass Optimization', 'Embodied Carbon Audits', 'Daylight Simulation', 'Bioclimatic Architecture & Passive Solar Design', 'bioclimatic-architecture'],
        bio: 'Specialist in zero-energy architectural envelopes and microclimate integration. Over 15 years optimizing mixed-use and luxury residential developments for minimal HVAC dependency.',
        certifications: ['Council of Architecture (CA/2009/4412)', 'IGBC Fellow', 'GRIHA Certified Evaluator'],
        education: 'M.Arch in Sustainable Building Technology, Architectural Association London',
        hourlyRateEst: '₹6,800 / hr',
        statutoryRegNumber: 'CA/2009/4412',
        firmName: 'BioClimatic Studio LLP',
        email: 'marcus.chen@bioclimatic-studio.com',
        phone: '+91 98200 44551',
        createdAt: new Date('2025-02-14T10:00:00Z').toISOString(),
        isDemo: true,
      },
      {
        id: 'c-3',
        userId: 'usr-consultant-03',
        name: 'Sarah Jenkins, PE',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
        title: 'Senior Geospatial & Terrain Systems Lead',
        department: 'Land & Environmental Intelligence',
        specialization: 'GIS Spatial Modeling & Slope Stability',
        city: 'Hyderabad',
        country: 'India',
        experienceYears: 12,
        rating: 4.92,
        completedCases: 29,
        verificationStatus: 'VERIFIED',
        status: 'Available',
        focusAreas: ['Drone Photogrammetry', 'LiDAR Contour Mapping', 'Catchment Hydrology', 'Zoning Compliance', 'GIS Spatial Modeling & Slope Hydrology', 'gis-terrain-modeling', 'property-due-diligence'],
        bio: 'Directs terrain feasibility studies, watershed protection frameworks, and satellite multi-spectral analyses for master-planned communities and high-value ecological parcels.',
        certifications: ['GISP Certified Professional', 'Licensed Surveyor', 'FAA Part 107 Remote Pilot'],
        education: 'M.S. in Geospatial Technologies, ITC Netherlands',
        hourlyRateEst: '₹5,500 / hr',
        statutoryRegNumber: 'GISP-2014-9912',
        firmName: 'Jenkins Geospatial Systems',
        email: 'sarah.jenkins@spatialgeo.in',
        phone: '+91 98490 11223',
        createdAt: new Date('2025-03-01T10:00:00Z').toISOString(),
        isDemo: true,
      },
      {
        id: 'c-4',
        userId: 'usr-consultant-04',
        name: 'David Kalu',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        title: 'Director of MEP & Building Physics',
        department: 'Building Services (MEP)',
        specialization: 'Hydronic Geothermal & Smart Grid Integration',
        city: 'New Delhi',
        country: 'India',
        experienceYears: 20,
        rating: 4.99,
        completedCases: 56,
        verificationStatus: 'VERIFIED',
        status: 'Available',
        focusAreas: ['Variable Refrigerant Flow (VRF)', 'Greywater Recycling Loops', 'Building Management Systems (BMS)', 'Acoustic Attenuation', 'High-Efficiency MEP & Building Physics', 'mep-systems', 'solar-pv-bipv'],
        bio: 'Oversees whole-facility building systems design, energy commissioning, and mission-critical MEP infrastructure with strict indoor air quality (IAQ) and acoustic specifications.',
        certifications: ['ASHRAE Certified BEMP', 'Certified Energy Auditor (BEE)', 'CIBSE Member'],
        education: 'B.Tech Mechanical Engineering, IIT Delhi',
        hourlyRateEst: '₹8,000 / hr',
        statutoryRegNumber: 'BEE-EA-5512',
        firmName: 'Kalu MEP Directorate',
        email: 'david.kalu@mepdynamics.in',
        phone: '+91 98110 33445',
        createdAt: new Date('2025-01-20T10:00:00Z').toISOString(),
        isDemo: true,
      },
      {
        id: 'c-abbhudaya',
        userId: 'usr-consultant-abbhudaya',
        name: 'Abbhudaya',
        avatar: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
        title: 'Principal Architect & Land Development Specialist',
        department: 'Architecture & Land Development',
        specialization: 'Bioclimatic Architecture · Land Feasibility · Vastu-Integrated Planning',
        city: 'Lucknow',
        country: 'India',
        experienceYears: 14,
        rating: 4.96,
        completedCases: 31,
        verificationStatus: 'VERIFIED',
        status: 'Available',
        focusAreas: ['Land Feasibility', 'Bioclimatic Design', 'Vastu Planning', 'Statutory Compliance'],
        bio: 'Leads integrated land-to-project feasibility with bioclimatic design and statutory compliance across North India.',
        certifications: ['Council of Architecture (CoA)', 'IGBC Accredited Professional'],
        education: 'B.Arch, SPA Delhi',
        hourlyRateEst: '₹6,200 / hr',
        statutoryRegNumber: 'CoA-UP-2012-8841',
        firmName: 'Abbhudaya Architecture Studio',
        createdAt: new Date('2025-04-01T10:00:00Z').toISOString(),
        isDemo: false,
      },
      {
        id: 'c-abhishek',
        userId: 'usr-consultant-abhishek',
        name: 'Abhishek Mishra',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        title: 'Senior Structural Engineer & BOQ Specialist',
        department: 'Structural Engineering & QS',
        specialization: 'Structural Engineering · BOQ Estimation · Construction Quality Audit',
        city: 'Gorakhpur',
        country: 'India',
        experienceYears: 12,
        rating: 4.94,
        completedCases: 27,
        verificationStatus: 'VERIFIED',
        status: 'Available',
        focusAreas: ['RCC/Steel Design', 'BOQ Normalisation', 'Site Quality Audit', 'Structural Peer Review'],
        bio: 'Specialises in RCC/steel structural design, BOQ normalisation, and site-quality audits for residential and commercial projects.',
        certifications: ['IStructE Affiliate', 'NICMAR QS Certification'],
        education: 'B.Tech Civil Engineering, IIT BHU',
        hourlyRateEst: '₹5,800 / hr',
        statutoryRegNumber: 'IStructE-IN-7721',
        firmName: 'Mishra Structural Consultants',
        createdAt: new Date('2025-04-15T10:00:00Z').toISOString(),
        isDemo: false,
      }
    ];

    for (const c of initialConsultants) {
      this.consultants.set(c.id, c);
      if (c.userId) {
        this.consultants.set(c.userId, c);
      }
    }

    // Seed baseline project case BEG-4092 with real events
    const baselineCase: CaseRecord = {
      id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      caseReference: 'BEG-4092',
      clientId: 'usr-client-01',
      pillar: 'CONSTRUCTION_SERVICES',
      serviceSlug: 'structural-engineering',
      projectTitle: 'Eco-Villa Foundations & Seismic Vetting',
      primaryDiscipline: 'Structural Engineering & Seismic Vetting',
      subDisciplines: ['Foundation Design', 'Seismic Compliance'],
      address: 'Plot 42, Eco-Parkway, Whitefield',
      city: 'Bengaluru',
      stateRegion: 'Karnataka',
      plotSizeSqFt: '14,500',
      terrainType: 'Slight Slope / Coastal Loam',
      buildingType: 'Residential Multi-Unit (Mass Timber)',
      scopeDescription: 'Comprehensive structural analysis, foundation design with mass-timber structural framework and ecological bioclimatic envelope optimization.',
      specialRequirements: ['Low embodied carbon target', 'Rainwater harvesting integration', 'Seismic Zone III compliance'],
      budgetRange: '₹50 Lakhs - ₹1.5 Crore',
      normalizedBudgetMin: 5000000,
      normalizedBudgetMax: 15000000,
      financingStatus: 'Self-Funded / Approved',
      startDateUrgency: 'Within 30 Days (Immediate)',
      expectedDuration: '6 - 9 Months',
      clientName: 'Aditya Vardhan',
      clientEmail: 'aditya.vardhan@ecoventures.in',
      clientPhone: '+91 98450 12345',
      clientOrg: 'EcoVentures Living LLP',
      status: 'SCOPE_DISCOVERY',
      assignedCoordinatorId: 'usr-coord-01',
      assignedCoordinatorName: 'Rohan Sharma (Coordinator)',
      assignedConsultantId: 'usr-consultant-01',
      leadSpecialistName: 'Dr. Elena Rostova',
      qualificationChecklist: {
        requirementUnderstood: true,
        locationVerified: true,
        serviceCategoryConfirmed: true,
        contactUsable: true,
        criticalDocsIdentified: true,
      },
      qualificationNotes: 'Client has verified land survey and clear title. Architectural concept in place. Urgent requirement for foundation sign-off.',
      createdAt: new Date('2026-10-01T09:00:00Z').toISOString(),
      updatedAt: new Date('2026-10-28T14:30:00Z').toISOString(),
      isDemo: true,
    };

    this.cases.set(baselineCase.caseReference, baselineCase);
    this.cases.set(baselineCase.id, baselineCase);

    // Initial assignment for baseline case
    const baselineAssignment: AssignmentRecord = {
      id: 'asgn-baseline-01',
      caseId: baselineCase.id,
      caseReference: baselineCase.caseReference,
      consultantId: 'usr-consultant-01',
      consultantName: 'Dr. Elena Rostova',
      assignmentType: 'CONSULTANT',
      status: 'ACCEPTED',
      assignedBy: 'usr-coord-01',
      feeEstimate: '₹4.5L - ₹6.0L Fee',
      deadline: new Date('2026-11-15T00:00:00Z').toISOString(),
      responseDueAt: new Date('2026-10-05T00:00:00Z').toISOString(),
      responseNotes: 'Scope reviewed and confirmed. Availability confirmed for immediate execution.',
      respondedAt: new Date('2026-10-02T10:00:00Z').toISOString(),
      createdAt: new Date('2026-10-01T12:00:00Z').toISOString(),
      updatedAt: new Date('2026-10-02T10:00:00Z').toISOString(),
    };
    this.assignments.set(baselineAssignment.id, baselineAssignment);

    // Featured consultant seed cases — Abbhudaya & Abhishek Mishra
    const abbCasePending: CaseRecord = {
      id: 'case-abb-pending-01',
      caseReference: 'BEG-2026-A1B2C3',
      clientId: 'usr-client-02',
      pillar: 'LAND_PROPERTY',
      serviceSlug: 'land-development',
      primaryDiscipline: 'Land Development & Feasibility',
      subDisciplines: ['GIS', 'Vastu'],
      address: 'Sector 7, Gomti Nagar Extension',
      city: 'Lucknow',
      stateRegion: 'Uttar Pradesh',
      pincode: '226010',
      plotSizeSqFt: '8,500',
      terrainType: 'Flat / Alluvial',
      projectTitle: 'Gomti Nagar Residential Plot Feasibility',
      buildingType: 'Residential Plot',
      scopeDescription: 'Land feasibility, zoning check, and bioclimatic orientation study for a 2,400 sq ft villa plot.',
      specialRequirements: ['Vastu-compliant layout', 'Rainwater harvesting'],
      budgetRange: '₹15 Lakhs - ₹40 Lakhs',
      financingStatus: 'Self-Funded',
      startDateUrgency: 'Within 30 Days',
      expectedDuration: '2 - 3 Months',
      clientName: 'Siddharth Rao',
      clientEmail: 'customer.test@example.com',
      clientPhone: '+91 98765 43210',
      clientOrg: 'Green Ridge Homes',
      status: 'CONSULTANT_ASSIGNED',
      assignedCoordinatorId: 'usr-coord-01',
      assignedCoordinatorName: 'Rohan Sharma (Coordinator)',
      leadSpecialistName: 'Abbhudaya',
      targetSpecialist: 'Abbhudaya',
      createdAt: new Date('2026-02-10T09:00:00Z').toISOString(),
      updatedAt: new Date('2026-02-12T11:00:00Z').toISOString(),
    };
    const abbCaseActive: CaseRecord = {
      id: 'case-abb-active-01',
      caseReference: 'BEG-2026-D4E5F6',
      clientId: 'usr-client-01',
      pillar: 'CONSTRUCTION_SERVICES',
      serviceSlug: 'bioclimatic-architecture',
      primaryDiscipline: 'Bioclimatic Architecture',
      subDisciplines: ['Passive Design'],
      address: 'Sushant Golf City',
      city: 'Lucknow',
      stateRegion: 'Uttar Pradesh',
      pincode: '226030',
      plotSizeSqFt: '12,000',
      terrainType: 'Gently Sloped',
      projectTitle: 'Bioclimatic Villa Design — Sushant Golf City',
      buildingType: 'Residential Villa',
      scopeDescription: 'Concept-to-schematic bioclimatic design with passive cooling and daylight optimisation.',
      specialRequirements: ['Low embodied carbon', 'Net-zero ready envelope'],
      budgetRange: '₹40 Lakhs - ₹80 Lakhs',
      financingStatus: 'Approved Loan',
      startDateUrgency: 'Immediate',
      expectedDuration: '4 - 6 Months',
      clientName: 'Aditya Vardhan',
      clientEmail: 'aditya.vardhan@ecoventures.in',
      clientPhone: '+91 98450 12345',
      clientOrg: 'EcoVentures Living LLP',
      status: 'SCOPE_DISCOVERY',
      assignedCoordinatorId: 'usr-coord-01',
      assignedConsultantId: 'usr-consultant-abbhudaya',
      leadSpecialistName: 'Abbhudaya',
      createdAt: new Date('2026-01-15T09:00:00Z').toISOString(),
      updatedAt: new Date('2026-02-20T14:00:00Z').toISOString(),
    };
    const abhCasePending: CaseRecord = {
      id: 'case-abh-pending-01',
      caseReference: 'BEG-2026-G7H8I9',
      clientId: 'usr-client-02',
      pillar: 'CONSTRUCTION_SERVICES',
      serviceSlug: 'structural-engineering',
      primaryDiscipline: 'Structural Engineering',
      subDisciplines: ['RCC Design'],
      address: 'Civil Lines',
      city: 'Gorakhpur',
      stateRegion: 'Uttar Pradesh',
      pincode: '273001',
      plotSizeSqFt: '6,200',
      terrainType: 'Flat',
      projectTitle: 'RCC Frame Design — Civil Lines Commercial',
      buildingType: 'Commercial G+2',
      scopeDescription: 'Structural design and peer review for a G+2 commercial building with basement parking.',
      specialRequirements: ['Seismic Zone IV compliance'],
      budgetRange: '₹25 Lakhs - ₹60 Lakhs',
      financingStatus: 'Self-Funded',
      startDateUrgency: 'Within 15 Days',
      expectedDuration: '3 - 4 Months',
      clientName: 'Siddharth Rao',
      clientEmail: 'customer.test@example.com',
      clientPhone: '+91 98765 43210',
      clientOrg: 'Green Ridge Homes',
      status: 'CONSULTANT_ASSIGNED',
      assignedCoordinatorId: 'usr-coord-01',
      leadSpecialistName: 'Abhishek Mishra',
      targetSpecialist: 'Abhishek Mishra',
      createdAt: new Date('2026-02-18T09:00:00Z').toISOString(),
      updatedAt: new Date('2026-02-19T10:00:00Z').toISOString(),
    };
    const abhCaseBoq: CaseRecord = {
      id: 'case-abh-boq-01',
      caseReference: 'BEG-2026-J1K2L3',
      clientId: 'usr-client-01',
      pillar: 'CONSTRUCTION_SERVICES',
      serviceSlug: 'boq-estimation',
      primaryDiscipline: 'BOQ & Quantity Surveying',
      subDisciplines: ['Cost Normalisation'],
      address: 'Hazratganj',
      city: 'Lucknow',
      stateRegion: 'Uttar Pradesh',
      pincode: '226001',
      plotSizeSqFt: '9,800',
      terrainType: 'Flat',
      projectTitle: 'Parametric BOQ — Hazratganj Renovation',
      buildingType: 'Commercial Renovation',
      scopeDescription: 'Normalised BOQ preparation with rate analysis and contingency mapping for interior renovation.',
      specialRequirements: ['GST-compliant line items'],
      budgetRange: '₹20 Lakhs - ₹45 Lakhs',
      financingStatus: 'Self-Funded',
      startDateUrgency: 'Immediate',
      expectedDuration: '1 - 2 Months',
      clientName: 'Aditya Vardhan',
      clientEmail: 'aditya.vardhan@ecoventures.in',
      clientPhone: '+91 98450 12345',
      clientOrg: 'EcoVentures Living LLP',
      status: 'BOQ_PREPARATION',
      assignedCoordinatorId: 'usr-coord-01',
      assignedConsultantId: 'usr-consultant-abhishek',
      leadSpecialistName: 'Abhishek Mishra',
      createdAt: new Date('2026-01-20T09:00:00Z').toISOString(),
      updatedAt: new Date('2026-02-22T09:00:00Z').toISOString(),
    };
    const abhCaseCompleted: CaseRecord = {
      id: 'case-abh-done-01',
      caseReference: 'BEG-2026-M4N5O6',
      clientId: 'usr-client-02',
      pillar: 'CONSTRUCTION_SERVICES',
      serviceSlug: 'structural-engineering',
      primaryDiscipline: 'Structural Engineering',
      subDisciplines: ['Foundation Design'],
      address: 'Medical College Road',
      city: 'Gorakhpur',
      stateRegion: 'Uttar Pradesh',
      pincode: '273013',
      plotSizeSqFt: '5,400',
      terrainType: 'Flat',
      projectTitle: 'Foundation Audit — Medical College Road Residence',
      buildingType: 'Residential',
      scopeDescription: 'Structural audit and remedial recommendation for an existing two-storey residence.',
      specialRequirements: [],
      budgetRange: '₹5 Lakhs - ₹12 Lakhs',
      financingStatus: 'Self-Funded',
      startDateUrgency: 'Completed',
      expectedDuration: 'Completed',
      clientName: 'Siddharth Rao',
      clientEmail: 'customer.test@example.com',
      clientPhone: '+91 98765 43210',
      clientOrg: 'Green Ridge Homes',
      status: 'COMPLETED',
      assignedCoordinatorId: 'usr-coord-01',
      assignedConsultantId: 'usr-consultant-abhishek',
      leadSpecialistName: 'Abhishek Mishra',
      createdAt: new Date('2025-11-01T09:00:00Z').toISOString(),
      updatedAt: new Date('2026-01-30T16:00:00Z').toISOString(),
    };

    for (const c of [abbCasePending, abbCaseActive, abhCasePending, abhCaseBoq, abhCaseCompleted]) {
      this.cases.set(c.caseReference, c);
      this.cases.set(c.id, c);
    }

    const featuredAssignments: AssignmentRecord[] = [
      {
        id: 'asgn-abb-pending-01',
        caseId: abbCasePending.id,
        caseReference: abbCasePending.caseReference,
        consultantId: 'usr-consultant-abbhudaya',
        consultantName: 'Abbhudaya',
        assignmentType: 'CONSULTANT',
        status: 'PENDING',
        assignedBy: 'usr-coord-01',
        feeEstimate: '₹2.5L - ₹4.0L',
        responseDueAt: new Date('2026-03-01T00:00:00Z').toISOString(),
        createdAt: new Date('2026-02-12T11:00:00Z').toISOString(),
        updatedAt: new Date('2026-02-12T11:00:00Z').toISOString(),
      },
      {
        id: 'asgn-abb-active-01',
        caseId: abbCaseActive.id,
        caseReference: abbCaseActive.caseReference,
        consultantId: 'usr-consultant-abbhudaya',
        consultantName: 'Abbhudaya',
        assignmentType: 'CONSULTANT',
        status: 'ACCEPTED',
        assignedBy: 'usr-coord-01',
        feeEstimate: '₹5.0L - ₹7.5L',
        responseDueAt: new Date('2026-01-20T00:00:00Z').toISOString(),
        respondedAt: new Date('2026-01-16T10:00:00Z').toISOString(),
        responseNotes: 'Accepted. Initiating scope discovery.',
        createdAt: new Date('2026-01-15T12:00:00Z').toISOString(),
        updatedAt: new Date('2026-01-16T10:00:00Z').toISOString(),
      },
      {
        id: 'asgn-abh-pending-01',
        caseId: abhCasePending.id,
        caseReference: abhCasePending.caseReference,
        consultantId: 'usr-consultant-abhishek',
        consultantName: 'Abhishek Mishra',
        assignmentType: 'CONSULTANT',
        status: 'OFFERED',
        assignedBy: 'usr-coord-01',
        feeEstimate: '₹3.0L - ₹5.5L',
        responseDueAt: new Date('2026-03-05T00:00:00Z').toISOString(),
        createdAt: new Date('2026-02-19T10:00:00Z').toISOString(),
        updatedAt: new Date('2026-02-19T10:00:00Z').toISOString(),
      },
      {
        id: 'asgn-abh-boq-01',
        caseId: abhCaseBoq.id,
        caseReference: abhCaseBoq.caseReference,
        consultantId: 'usr-consultant-abhishek',
        consultantName: 'Abhishek Mishra',
        assignmentType: 'CONSULTANT',
        status: 'ACCEPTED',
        assignedBy: 'usr-coord-01',
        feeEstimate: '₹1.8L - ₹2.5L',
        respondedAt: new Date('2026-01-22T10:00:00Z').toISOString(),
        responseNotes: 'BOQ scope accepted.',
        createdAt: new Date('2026-01-20T12:00:00Z').toISOString(),
        updatedAt: new Date('2026-01-22T10:00:00Z').toISOString(),
      },
      {
        id: 'asgn-abh-done-01',
        caseId: abhCaseCompleted.id,
        caseReference: abhCaseCompleted.caseReference,
        consultantId: 'usr-consultant-abhishek',
        consultantName: 'Abhishek Mishra',
        assignmentType: 'CONSULTANT',
        status: 'ACCEPTED',
        assignedBy: 'usr-coord-01',
        feeEstimate: '₹1.2L',
        respondedAt: new Date('2025-11-05T10:00:00Z').toISOString(),
        createdAt: new Date('2025-11-01T12:00:00Z').toISOString(),
        updatedAt: new Date('2026-01-30T16:00:00Z').toISOString(),
      },
    ];
    for (const a of featuredAssignments) {
      this.assignments.set(a.id, a);
    }

    // Initial status history
    this.caseStatusHistory.push({
      id: 'csh-01',
      caseId: baselineCase.id,
      caseReference: baselineCase.caseReference,
      fromStatus: 'NEW',
      toStatus: 'QUALIFICATION_PENDING',
      actorId: 'usr-coord-01',
      actorName: 'Rohan Sharma (Coordinator)',
      actorRole: 'EMPLOYEE',
      reason: 'Intake brief assigned to technical qualification queue.',
      createdAt: new Date('2026-10-01T09:30:00Z').toISOString(),
    });
    this.caseStatusHistory.push({
      id: 'csh-02',
      caseId: baselineCase.id,
      caseReference: baselineCase.caseReference,
      fromStatus: 'QUALIFICATION_PENDING',
      toStatus: 'QUALIFIED',
      actorId: 'usr-coord-01',
      actorName: 'Rohan Sharma (Coordinator)',
      actorRole: 'EMPLOYEE',
      reason: 'Checklist completed. All mandatory criteria verified.',
      createdAt: new Date('2026-10-01T10:00:00Z').toISOString(),
    });
    this.caseStatusHistory.push({
      id: 'csh-03',
      caseId: baselineCase.id,
      caseReference: baselineCase.caseReference,
      fromStatus: 'QUALIFIED',
      toStatus: 'CONSULTANT_ASSIGNED',
      actorId: 'usr-coord-01',
      actorName: 'Rohan Sharma (Coordinator)',
      actorRole: 'EMPLOYEE',
      reason: 'Matched and dispatched to Dr. Elena Rostova.',
      createdAt: new Date('2026-10-01T12:00:00Z').toISOString(),
    });
    this.caseStatusHistory.push({
      id: 'csh-04',
      caseId: baselineCase.id,
      caseReference: baselineCase.caseReference,
      fromStatus: 'CONSULTANT_ASSIGNED',
      toStatus: 'SCOPE_DISCOVERY',
      actorId: 'usr-consultant-01',
      actorName: 'Dr. Elena Rostova',
      actorRole: 'CONSULTANT',
      reason: 'Assignment accepted. Commenced technical scope discovery.',
      createdAt: new Date('2026-10-02T10:00:00Z').toISOString(),
    });

    // Baseline internal notes
    this.caseNotes.push({
      id: 'cn-01',
      caseId: baselineCase.id,
      authorUserId: 'usr-coord-01',
      authorName: 'Rohan Sharma',
      authorRole: 'EMPLOYEE',
      note: 'Verified land survey data against Whitefield local planning authority. No zoning infractions found.',
      visibility: 'INTERNAL',
      createdAt: new Date('2026-10-01T11:00:00Z').toISOString(),
    });
    this.caseNotes.push({
      id: 'cn-02',
      caseId: baselineCase.id,
      authorUserId: 'usr-coord-01',
      authorName: 'Rohan Sharma',
      authorRole: 'EMPLOYEE',
      note: 'Your dedicated coordinator and specialist partner have been allocated to review foundation calculations.',
      visibility: 'CUSTOMER_VISIBLE',
      createdAt: new Date('2026-10-01T12:05:00Z').toISOString(),
    });

    // Initial canonical events for baseline case
    this.recordEvent({
      case_id: baselineCase.id,
      case_reference: baselineCase.caseReference,
      event_type: 'CASE_CREATED',
      user_id: 'usr-client-01',
      role: 'CUSTOMER',
      service: baselineCase.primaryDiscipline,
      location: `${baselineCase.city}, ${baselineCase.stateRegion}`,
      timestamp: baselineCase.createdAt,
      metadata: {
        budgetRange: baselineCase.budgetRange,
        plotSize: baselineCase.plotSizeSqFt,
      }
    });

    // Milestones for baseline
    this.milestones.set(baselineCase.caseReference, [
      {
        id: 'm-1',
        step: 1,
        title: 'Project Requirement Intake & Scope Verification',
        status: 'COMPLETED',
        date: 'Oct 04, 2026',
        lead: 'BEG Engineering Directorate',
        deliverables: ['Intake_Summary_Brief.pdf', 'Geotechnical_Scope_Charter.pdf'],
        budgetAllocated: '₹0.00 (Platform Covered)',
        budgetStatus: 'RELEASED',
      },
      {
        id: 'm-2',
        step: 2,
        title: 'Lead Specialist Assignment & Practice Vetting',
        status: 'IN_PROGRESS',
        date: 'Nov 08, 2026',
        lead: 'Dr. Elena Rostova',
        deliverables: ['Foundation_Rebar_Calculations.dwg', 'Seismic_Zone_3_Vetting_Report.pdf'],
        budgetAllocated: '₹3,50,000.00',
        budgetStatus: 'IN_ESCROW',
      },
      {
        id: 'm-3',
        step: 3,
        title: 'Bioclimatic Thermal Mass & Material Spec Package',
        status: 'UPCOMING',
        date: 'Nov 25, 2026',
        lead: 'Assigned Partner Specialist',
        deliverables: ['Solar_Insulation_Thermal_Audit.pdf', 'Mass_Timber_Assembly_Specs.pdf'],
        budgetAllocated: '₹2,80,000.00',
        budgetStatus: 'UNFUNDED',
      },
    ]);

    // Documents for baseline
    this.documents.set(baselineCase.caseReference, [
      {
        id: 'doc-1',
        name: 'Whitefield_Plot42_Cadastral_Survey.pdf',
        size: '4.2 MB',
        type: 'Site Cadastral',
        date: 'Oct 02, 2026',
        author: 'EcoVentures Living LLP',
        isVerified: true,
      },
      {
        id: 'doc-2',
        name: 'Seismic_Zone_3_Structural_Brief.pdf',
        size: '1.8 MB',
        type: 'Requirement Brief',
        date: 'Oct 04, 2026',
        author: 'BuildEcoGroup Engineering Directorate',
        isVerified: true,
      },
      {
        id: 'doc-3',
        name: 'Geotechnical_Borewell_Stratum_Log.pdf',
        size: '6.1 MB',
        type: 'Geotechnical Report',
        date: 'Oct 12, 2026',
        author: 'Dr. Elena Rostova',
        isVerified: true,
      },
    ]);

    // Seed Commercial BOQ for Baseline Case (CASE-2026-4092)
    const demoBoqId = 'boq-demo-01';
    const demoBoqRef = 'BEG-BOQ-2026-WFD891';
    const demoRev1Id = 'rev-demo-01';
    const demoRev2Id = 'rev-demo-02';

    const rev1Items: BOQItemRecord[] = [
      {
        id: 'bitem-101',
        revisionId: demoRev1Id,
        section: 'Civil & Foundation',
        itemCode: 'CIV-001',
        description: 'Earthwork excavation in foundation trenches and raft footings with mechanical backhoe',
        specification: 'Depth up to 3.5m, strata soil classification Type B/C, including dewatering and shoring as per IS 3764:1992',
        brand: 'Tata Hitachi / JCB 3DX',
        grade: 'Earthwork Soil B',
        quantity: 450,
        unit: 'Cu M',
        baseRate: 280,
        taxRate: 18,
        taxAmount: 22680,
        lineTotal: 148680,
        rateSource: 'CONSULTANT_ESTIMATE',
        rateSourceReference: 'CPWD DSR 2023 Item 2.6',
        sortOrder: 1,
        createdAt: new Date('2026-10-05T10:00:00Z').toISOString(),
      },
      {
        id: 'bitem-102',
        revisionId: demoRev1Id,
        section: 'Civil & Foundation',
        itemCode: 'CIV-002',
        description: 'Ready Mix Concrete (RMC) M30 grade with fly-ash blended OPC 53 cement for RCC raft and columns',
        specification: 'M30 design mix, slump 120±25mm, manufactured in automated batching plant, slump retention 3 hours as per IS 456:2000',
        brand: 'UltraTech RMC / ACC Concrete',
        grade: 'M30 Grade',
        quantity: 185,
        unit: 'Cu M',
        baseRate: 5800,
        taxRate: 18,
        taxAmount: 193140,
        lineTotal: 1266140,
        rateSource: 'CONSULTANT_ESTIMATE',
        rateSourceReference: 'Bangalore Master Builders Schedule 2024',
        sortOrder: 2,
        createdAt: new Date('2026-10-05T10:00:00Z').toISOString(),
      },
      {
        id: 'bitem-103',
        revisionId: demoRev1Id,
        section: 'Structural Steel',
        itemCode: 'STR-001',
        description: 'High-yield thermo-mechanically treated (TMT) Fe 550D rebar reinforcement bars cut, bent, and placed in position',
        specification: 'Fe 550D primary rebar, corrosion-resistant coating, testing certificate from NABL accredited lab as per IS 1786:2008',
        brand: 'Tata Tiscon 550D / JSW Neosteel',
        grade: 'Fe 550D Super Ductile',
        size: '8mm to 25mm dia',
        quantity: 18.5,
        unit: 'MT',
        baseRate: 68500,
        taxRate: 18,
        taxAmount: 228105,
        lineTotal: 1495355,
        rateSource: 'VENDOR_QUOTE',
        rateSourceReference: 'Steel Authority Price Circular Q3',
        sortOrder: 3,
        createdAt: new Date('2026-10-05T10:00:00Z').toISOString(),
      },
      {
        id: 'bitem-104',
        revisionId: demoRev1Id,
        section: 'Mass Timber Framing',
        itemCode: 'STR-002',
        description: 'Cross-Laminated Timber (CLT) 5-ply mass timber floor panels with low-VOC polyurethane adhesive bond',
        specification: '5-ply Spruce/Pine CLT, 140mm thickness, fire rating 90 mins, FSC certified sustainable forestry as per EN 16351',
        brand: 'Stora Enso / Binderholz Mass Timber',
        grade: 'Visual Grade C24',
        thickness: '140mm',
        quantity: 420,
        unit: 'Sq M',
        baseRate: 4200,
        taxRate: 18,
        taxAmount: 317520,
        lineTotal: 2081520,
        rateSource: 'CONSULTANT_ESTIMATE',
        rateSourceReference: 'Specialized Timber Import Vetting',
        sortOrder: 4,
        createdAt: new Date('2026-10-05T10:00:00Z').toISOString(),
      },
      {
        id: 'bitem-105',
        revisionId: demoRev1Id,
        section: 'Electrical & Solar',
        itemCode: 'ELE-001',
        description: 'Rooftop on-grid monocrystalline PERC solar PV system with bi-directional net meter and string inverter',
        specification: '540Wp Tier 1 Mono-PERC modules, efficiency > 21.2%, IP65 3-phase hybrid inverter with IoT remote monitoring',
        brand: 'Waaree / Vikram Solar + Growatt Inverter',
        grade: 'Tier-1 Mono PERC',
        model: '15kWp Commercial Grid-Tied',
        quantity: 1,
        unit: 'Lot',
        baseRate: 750000,
        taxRate: 12,
        taxAmount: 90000,
        lineTotal: 840000,
        rateSource: 'CATALOG',
        rateSourceReference: 'MNRE Benchmark Cost Schedule 2024-25',
        sortOrder: 5,
        createdAt: new Date('2026-10-05T10:00:00Z').toISOString(),
      },
    ];

    const rev1Adjustments: BOQAdjustmentRecord[] = [
      {
        id: 'adj-101',
        revisionId: demoRev1Id,
        type: 'CONTINGENCY',
        label: 'Site Unforeseen Sub-surface Contingency (3%)',
        calculationType: 'PERCENTAGE',
        value: 3,
        amount: 147573,
      },
      {
        id: 'adj-102',
        revisionId: demoRev1Id,
        type: 'SITE_SAFETY',
        label: 'Mandatory Environmental & Site Safety EHS Protocol',
        calculationType: 'FIXED_AMOUNT',
        value: 45000,
        amount: 45000,
      },
    ];

    const rev1Totals = calculateBOQRevisionTotals(rev1Items, rev1Adjustments);

    const rev1Record: BOQRevisionRecord = {
      id: demoRev1Id,
      boqId: demoBoqId,
      revisionNumber: 1,
      status: 'APPROVED',
      notes: 'Final structural & mass timber baseline approved for execution',
      subtotal: rev1Totals.subtotal,
      taxTotal: rev1Totals.taxTotal,
      adjustmentTotal: rev1Totals.adjustmentTotal,
      grandTotal: rev1Totals.grandTotal,
      createdBy: 'usr-consultant-01',
      createdByName: 'Dr. Elena Rostova',
      createdAt: new Date('2026-10-05T10:00:00Z').toISOString(),
      items: rev1Items,
      adjustments: rev1Adjustments,
      approvals: [],
    };

    const demoApproval: BOQApprovalRecord = {
      id: 'appr-demo-01',
      boqId: demoBoqId,
      revisionId: demoRev1Id,
      approvedBy: 'usr-client-01',
      approvedByName: 'Aditya Vardhan',
      decision: 'APPROVED',
      comment: 'Commercial baseline and timber specifications reviewed with technical advisory team and approved.',
      createdAt: new Date('2026-10-08T15:30:00Z').toISOString(),
    };

    const demoBoq: BOQRecord = {
      id: demoBoqId,
      caseId: baselineCase.id,
      caseReference: baselineCase.caseReference,
      projectId: baselineCase.id,
      boqReference: demoBoqRef,
      estimateType: 'DETAILED_BOQ',
      title: 'Structural Framing & Mass Timber Bill of Quantities',
      status: 'APPROVED',
      currency: 'INR',
      scopeDescription: 'Complete foundation, M30 RMC casting, Fe 550D rebar reinforcement, 5-ply CLT mass timber floor systems, and 15kWp rooftop solar PV integration.',
      approximateAreaSqFt: '14,500 sq ft',
      preferredSpecification: 'Mass timber with sustainable low-carbon footprint and Tier 1 solar integration',
      notes: 'All items cross-referenced against national building code and CPWD standard specifications.',
      currentRevisionId: demoRev1Id,
      createdBy: 'usr-consultant-01',
      createdByName: 'Dr. Elena Rostova',
      createdAt: new Date('2026-10-04T12:00:00Z').toISOString(),
      updatedAt: new Date('2026-10-08T15:30:00Z').toISOString(),
      currentRevision: rev1Record,
      revisions: [rev1Record],
      approvals: [demoApproval],
    };

    this.boqs.set(demoBoqId, demoBoq);
    this.boqs.set(demoBoqRef, demoBoq);
    this.boqRevisions.set(demoRev1Id, rev1Record);
    this.boqItems.set(demoRev1Id, rev1Items);
    this.boqAdjustments.set(demoRev1Id, rev1Adjustments);
    this.boqApprovals.set(demoBoqId, [demoApproval]);

    // Seed 2 Supplier Quotations for Comparison
    const quote1Id = 'quo-demo-01';
    const quote1Ref = 'BEG-QUO-2026-APEX77';
    const quote1Items: QuotationItemRecord[] = [
      {
        id: 'qi-101',
        quotationId: quote1Id,
        boqItemId: 'bitem-101',
        itemCode: 'CIV-001',
        description: 'Earthwork excavation in foundation trenches',
        offeredBrand: 'JCB 3DX Super Hydraulic',
        offeredSpecification: 'Heavy earthmoving fleet with computerized GPS depth control and on-site compaction',
        quantity: 450,
        unit: 'Cu M',
        unitRate: 260, // Cheaper
        taxRate: 18,
        taxAmount: 21060,
        lineTotal: 138060,
        availability: 'Immediate Dispatch',
        leadTime: '2 Days',
        specCompliance: 'EXACT',
      },
      {
        id: 'qi-102',
        quotationId: quote1Id,
        boqItemId: 'bitem-102',
        itemCode: 'CIV-002',
        description: 'Ready Mix Concrete M30 grade',
        offeredBrand: 'UltraTech Ready Mix Concrete Ltd',
        offeredSpecification: 'M30 grade with micro-silica blend and 3-hour slump retention certificate per batch',
        quantity: 185,
        unit: 'Cu M',
        unitRate: 5650,
        taxRate: 18,
        taxAmount: 188145,
        lineTotal: 1233395,
        availability: 'Dedicated Batching Plant',
        leadTime: '1 Day Notice',
        specCompliance: 'EXACT',
      },
      {
        id: 'qi-103',
        quotationId: quote1Id,
        boqItemId: 'bitem-103',
        itemCode: 'STR-001',
        description: 'High-yield TMT Fe 550D rebar',
        offeredBrand: 'JSW Neosteel Fe 550D',
        offeredSpecification: 'Primary billet manufactured Fe 550D with test certificates and anti-corrosive primer dip',
        quantity: 18.5,
        unit: 'MT',
        unitRate: 67000,
        taxRate: 18,
        taxAmount: 223110,
        lineTotal: 1462610,
        availability: 'In Stock (Warehouse yard)',
        leadTime: '3 Days',
        specCompliance: 'EQUIVALENT',
      },
      {
        id: 'qi-104',
        quotationId: quote1Id,
        boqItemId: 'bitem-104',
        itemCode: 'STR-002',
        description: 'Cross-Laminated Timber panels',
        offeredBrand: 'Stora Enso European Spruce CLT',
        offeredSpecification: 'Imported FSC certified 140mm 5-ply panels with CNC precut joints and lifting brackets',
        quantity: 420,
        unit: 'Sq M',
        unitRate: 4350,
        taxRate: 18,
        taxAmount: 328860,
        lineTotal: 2155860,
        availability: 'Import Custom Clearance In-progress',
        leadTime: '14 Days',
        specCompliance: 'SUPERIOR',
      },
      {
        id: 'qi-105',
        quotationId: quote1Id,
        boqItemId: 'bitem-105',
        itemCode: 'ELE-001',
        description: 'Rooftop Solar PV System',
        offeredBrand: 'Waaree Bi-facial 550Wp + Sungrow Inverter',
        offeredSpecification: '550Wp Bi-facial Dual Glass modules with 25 year linear generation warranty',
        quantity: 1,
        unit: 'Lot',
        unitRate: 725000,
        taxRate: 12,
        taxAmount: 87000,
        lineTotal: 812000,
        availability: 'Ready in Central Depot',
        leadTime: '5 Days',
        specCompliance: 'SUPERIOR',
      },
    ];

    const quote1GrandTotal = quote1Items.reduce((sum, it) => sum + it.lineTotal, 0);

    const quote1: QuotationRecord = {
      id: quote1Id,
      caseId: baselineCase.id,
      boqId: demoBoqId,
      boqReference: demoBoqRef,
      providerId: 'usr-provider-01',
      providerName: 'Vikramaditya Singhania',
      providerFirm: 'Apex Building Materials & Cement Supplies Ltd',
      providerCity: 'Mumbai',
      quotationReference: quote1Ref,
      status: 'SUBMITTED',
      validityDate: new Date('2026-12-31T00:00:00Z').toISOString(),
      subtotal: 4894250,
      taxTotal: 848175,
      freight: 45000,
      discount: 25000,
      grandTotal: 5762425,
      leadTimeDays: 5,
      warrantyMonths: 36,
      paymentTerms: '30% Advance with Purchase Order, 60% on progressive delivery, 10% on inspection signoff.',
      notes: 'Price includes transit insurance and mechanical unloading at Whitefield site.',
      items: quote1Items,
      createdAt: new Date('2026-10-10T11:00:00Z').toISOString(),
      updatedAt: new Date('2026-10-10T11:00:00Z').toISOString(),
    };

    this.quotations.set(quote1Id, quote1);
    this.quotations.set(quote1Ref, quote1);
    this.quotationItems.set(quote1Id, quote1Items);

    // Second Supplier Quote (Tata Structural)
    const quote2Id = 'quo-demo-02';
    const quote2Ref = 'BEG-QUO-2026-TATA42';
    const quote2Items: QuotationItemRecord[] = [
      {
        id: 'qi-201',
        quotationId: quote2Id,
        boqItemId: 'bitem-101',
        itemCode: 'CIV-001',
        description: 'Earthwork excavation in trenches',
        offeredBrand: 'Tata Hitachi ZX200 Fleet',
        offeredSpecification: 'Earthmoving with digital laser grade control and certified soil disposal log',
        quantity: 450,
        unit: 'Cu M',
        unitRate: 290,
        taxRate: 18,
        taxAmount: 23490,
        lineTotal: 153990,
        availability: 'In Stock',
        leadTime: '3 Days',
        specCompliance: 'EXACT',
      },
      {
        id: 'qi-202',
        quotationId: quote2Id,
        boqItemId: 'bitem-102',
        itemCode: 'CIV-002',
        description: 'Ready Mix Concrete M30 grade',
        offeredBrand: 'ACC Concrete Expert Plus',
        offeredSpecification: 'M30 ready mix with automated moisture control and slump verification',
        quantity: 185,
        unit: 'Cu M',
        unitRate: 5750,
        taxRate: 18,
        taxAmount: 191475,
        lineTotal: 1255225,
        availability: 'ACC Peenya Plant',
        leadTime: '2 Days',
        specCompliance: 'EXACT',
      },
      {
        id: 'qi-203',
        quotationId: quote2Id,
        boqItemId: 'bitem-103',
        itemCode: 'STR-001',
        description: 'High-yield TMT Fe 550D rebar',
        offeredBrand: 'Tata Tiscon 550D Super Ductile',
        offeredSpecification: 'Direct mill supplied Tata Tiscon 550D with embossed batch codes and barcode validation',
        quantity: 18.5,
        unit: 'MT',
        unitRate: 66500, // Lowest steel price
        taxRate: 18,
        taxAmount: 221445,
        lineTotal: 1451695,
        availability: 'Direct Factory Depot (Bengaluru)',
        leadTime: '2 Days',
        specCompliance: 'EXACT',
      },
      {
        id: 'qi-204',
        quotationId: quote2Id,
        boqItemId: 'bitem-104',
        itemCode: 'STR-002',
        description: 'Cross-Laminated Timber panels',
        offeredBrand: 'Binderholz Solid Wood CLT',
        offeredSpecification: 'Austrian Alpine Pine 140mm 5-layer CLT panel with acoustic dampening membrane',
        quantity: 420,
        unit: 'Sq M',
        unitRate: 4150, // Lowest timber price
        taxRate: 18,
        taxAmount: 313740,
        lineTotal: 2056740,
        availability: 'Port Consignment Cleared',
        leadTime: '7 Days',
        specCompliance: 'EXACT',
      },
      {
        id: 'qi-205',
        quotationId: quote2Id,
        boqItemId: 'bitem-105',
        itemCode: 'ELE-001',
        description: 'Rooftop Solar PV System',
        offeredBrand: 'Vikram Solar Somera Series + Delta Inverter',
        offeredSpecification: '540Wp Mono-PERC with IP66 cloud telemetry data logger',
        quantity: 1,
        unit: 'Lot',
        unitRate: 740000,
        taxRate: 12,
        taxAmount: 88800,
        lineTotal: 828800,
        availability: 'Ready in Stock',
        leadTime: '4 Days',
        specCompliance: 'EXACT',
      },
    ];

    const quote2GrandTotal = quote2Items.reduce((sum, it) => sum + it.lineTotal, 0);

    const quote2: QuotationRecord = {
      id: quote2Id,
      caseId: baselineCase.id,
      boqId: demoBoqId,
      boqReference: demoBoqRef,
      providerId: 'usr-provider-02',
      providerName: 'Sanjay Deshmukh',
      providerFirm: 'Tata Structural Steel & Infrastructure LLP',
      providerCity: 'Pune',
      quotationReference: quote2Ref,
      status: 'SUBMITTED',
      validityDate: new Date('2026-12-31T00:00:00Z').toISOString(),
      subtotal: 4880500,
      taxTotal: 838950,
      freight: 35000,
      discount: 30000,
      grandTotal: 5724450, // Lowest Overall Price!
      leadTimeDays: 4, // Fastest overall delivery!
      warrantyMonths: 60,
      paymentTerms: '20% Advance, 70% against delivery challan, 10% post 30-day site verification.',
      notes: 'Direct mill supply with manufacturer warranty certificate and testing coupons.',
      items: quote2Items,
      createdAt: new Date('2026-10-12T14:00:00Z').toISOString(),
      updatedAt: new Date('2026-10-12T14:00:00Z').toISOString(),
    };

    this.quotations.set(quote2Id, quote2);
    this.quotations.set(quote2Ref, quote2);
    this.quotationItems.set(quote2Id, quote2Items);
  }

  // ==========================================
  // Service Catalog Methods
  // ==========================================

  public getServiceCatalog(pillar?: string): ServiceCategoryRecord[] {
    const list = Array.from(this.serviceCategories.values()).filter(s => s.active);
    if (!pillar) return list;
    return list.filter(s => s.pillar === pillar);
  }

  public getServiceCategory(slug: string): ServiceCategoryRecord | undefined {
    return this.serviceCategories.get(slug);
  }

  // ==========================================
  // Case State Machine & Authoritative Transitions
  // ==========================================

  // Valid status transitions matrix
  private static VALID_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
    'NEW': ['QUALIFICATION_PENDING', 'QUALIFIED', 'NEEDS_INFORMATION', 'ON_HOLD', 'CANCELLED'],
    'QUALIFICATION_PENDING': ['QUALIFIED', 'NEEDS_INFORMATION', 'ON_HOLD', 'CANCELLED', 'CLOSED'],
    'QUALIFICATION': ['QUALIFIED', 'NEEDS_INFORMATION', 'ON_HOLD', 'CANCELLED'], // legacy alias
    'NEEDS_INFORMATION': ['QUALIFICATION_PENDING', 'QUALIFIED', 'SCOPE_DISCOVERY', 'ON_HOLD', 'CANCELLED'],
    'QUALIFIED': ['COORDINATOR_ASSIGNED', 'MATCHING', 'CONSULTANT_ASSIGNED', 'NEEDS_INFORMATION', 'ON_HOLD', 'CANCELLED'],
    'COORDINATOR_ASSIGNED': ['MATCHING', 'CONSULTANT_ASSIGNED', 'SCOPE_DISCOVERY', 'NEEDS_INFORMATION', 'ON_HOLD', 'CANCELLED'],
    'MATCHING': ['CONSULTANT_ASSIGNED', 'ON_HOLD', 'CANCELLED'],
    'SPECIALIST_MATCHING': ['CONSULTANT_ASSIGNED', 'ON_HOLD', 'CANCELLED'], // legacy alias
    'CONSULTANT_ASSIGNED': ['CONSULTANT_ACCEPTED', 'CONSULTANT_DECLINED', 'MATCHING', 'ON_HOLD', 'CANCELLED'],
    'ASSIGNED': ['CONSULTANT_ACCEPTED', 'CONSULTANT_DECLINED', 'SCOPE_DISCOVERY', 'MATCHING', 'ON_HOLD', 'CANCELLED'], // legacy alias
    'CONSULTANT_DECLINED': ['MATCHING', 'ON_HOLD', 'CANCELLED'],
    'CONSULTANT_ACCEPTED': ['SCOPE_DISCOVERY', 'PROPOSAL_PENDING', 'ON_HOLD', 'CANCELLED'],
    'SCOPE_DISCOVERY': ['PROPOSAL_PENDING', 'BOQ_PREPARATION', 'NEEDS_INFORMATION', 'ON_HOLD', 'CANCELLED'],
    'BOQ_PREPARATION': ['PROPOSAL_PENDING', 'CUSTOMER_REVIEW', 'ON_HOLD', 'CANCELLED'],
    'IN_PROGRESS': ['PROPOSAL_PENDING', 'CUSTOMER_REVIEW', 'COMPLETED', 'ON_HOLD', 'CANCELLED'], // legacy alias
    'PROPOSAL_PENDING': ['CUSTOMER_REVIEW', 'SCOPE_DISCOVERY', 'ON_HOLD', 'CANCELLED'],
    'UNDER_REVIEW': ['APPROVED', 'PROPOSAL_PENDING', 'CANCELLED'], // legacy alias
    'CUSTOMER_REVIEW': ['APPROVED', 'PROPOSAL_PENDING', 'CANCELLED', 'ON_HOLD'],
    'APPROVED': ['PROJECT_READY', 'CLOSED', 'CANCELLED'],
    'PROJECT_READY': ['CLOSED', 'COMPLETED', 'ON_HOLD'],
    'COMPLETED': ['CLOSED'], // legacy alias
    'ON_HOLD': ['NEW', 'QUALIFICATION_PENDING', 'QUALIFIED', 'MATCHING', 'SCOPE_DISCOVERY', 'CANCELLED'],
    'REJECTED': ['CLOSED', 'NEW'],
    'CANCELLED': [],
    'CLOSED': []
  };

  public transitionCaseStatus(params: {
    caseIdOrRef: string;
    nextStatus: CaseStatus;
    actorId?: string;
    actorRole: UserRole | 'SYSTEM' | 'COORDINATOR';
    reason: string;
    metadata?: Record<string, any>;
  }): { caseRecord: CaseRecord; history: CaseStatusHistoryRecord } {
    const caseRecord = this.cases.get(params.caseIdOrRef);
    if (!caseRecord) {
      throw new Error(`Case '${params.caseIdOrRef}' not found in canonical store.`);
    }

    const currentStatus = caseRecord.status;
    const allowed = DataStore.VALID_TRANSITIONS[currentStatus] || [];

    // Authorization & Transition check
    if (!allowed.includes(params.nextStatus)) {
      throw new Error(`Invalid status transition from '${currentStatus}' to '${params.nextStatus}'. Permitted transitions: ${allowed.join(', ') || 'None (Terminal state)'}`);
    }

    // Role verification on transitions
    if (params.actorRole === 'CUSTOMER') {
      const allowedForCustomer: CaseStatus[] = ['CUSTOMER_REVIEW', 'APPROVED', 'CANCELLED', 'QUALIFICATION_PENDING'];
      if (!allowedForCustomer.includes(params.nextStatus)) {
        throw new Error(`Unauthorized: Customer cannot transition case to '${params.nextStatus}'.`);
      }
    } else if (params.actorRole === 'CONSULTANT') {
      const allowedForConsultant: CaseStatus[] = ['CONSULTANT_ACCEPTED', 'CONSULTANT_DECLINED', 'SCOPE_DISCOVERY', 'PROPOSAL_PENDING', 'CUSTOMER_REVIEW'];
      if (!allowedForConsultant.includes(params.nextStatus)) {
        throw new Error(`Unauthorized: Consultant cannot transition case to '${params.nextStatus}'.`);
      }
    }

    // Update case record status
    caseRecord.status = params.nextStatus;
    caseRecord.updatedAt = new Date().toISOString();

    const actor = params.actorId ? this.users.get(params.actorId) : undefined;
    const actorName = actor ? actor.fullName : (params.actorRole === 'SYSTEM' ? 'BuildEcoGroup Engine' : params.actorRole);

    const historyRecord: CaseStatusHistoryRecord = {
      id: `csh-${crypto.randomUUID().slice(0, 8)}`,
      caseId: caseRecord.id,
      caseReference: caseRecord.caseReference,
      fromStatus: currentStatus,
      toStatus: params.nextStatus,
      actorId: params.actorId,
      actorName,
      actorRole: params.actorRole,
      reason: params.reason,
      metadata: params.metadata || {},
      createdAt: new Date().toISOString(),
    };

    this.caseStatusHistory.unshift(historyRecord);

    // Record canonical event
    let eventType: CaseEventType = 'STATUS_CHANGED';
    if (params.nextStatus === 'QUALIFIED') eventType = 'CASE_QUALIFIED';
    else if (params.nextStatus === 'COORDINATOR_ASSIGNED') eventType = 'COORDINATOR_ASSIGNED';
    else if (params.nextStatus === 'MATCHING') eventType = 'MATCHING_STARTED';
    else if (params.nextStatus === 'CONSULTANT_ASSIGNED') eventType = 'CONSULTANT_ASSIGNED';
    else if (params.nextStatus === 'CONSULTANT_ACCEPTED') eventType = 'ASSIGNMENT_ACCEPTED';
    else if (params.nextStatus === 'CONSULTANT_DECLINED') eventType = 'ASSIGNMENT_DECLINED';
    else if (params.nextStatus === 'SCOPE_DISCOVERY') eventType = 'SCOPE_DISCOVERY_STARTED';
    else if (params.nextStatus === 'PROPOSAL_PENDING') eventType = 'PROPOSAL_SUBMITTED';
    else if (params.nextStatus === 'APPROVED') eventType = 'PROPOSAL_APPROVED';
    else if (params.nextStatus === 'PROJECT_READY') eventType = 'PROJECT_READY';

    this.recordEvent({
      case_id: caseRecord.id,
      case_reference: caseRecord.caseReference,
      event_type: eventType,
      user_id: params.actorId || 'system',
      role: params.actorRole as any,
      service: caseRecord.primaryDiscipline,
      location: `${caseRecord.city}, ${caseRecord.stateRegion}`,
      timestamp: historyRecord.createdAt,
      metadata: {
        fromStatus: currentStatus,
        toStatus: params.nextStatus,
        reason: params.reason,
        ...(params.metadata || {})
      }
    });

    // Record Security Audit
    this.recordSecurityAudit({
      actorId: params.actorId || 'system',
      action: `CASE_STATUS_TRANSITION_${params.nextStatus}`,
      entityType: 'CASE',
      entityId: caseRecord.id,
      changes: {
        caseReference: caseRecord.caseReference,
        fromStatus: currentStatus,
        toStatus: params.nextStatus,
        reason: params.reason,
      }
    });

    return { caseRecord, history: historyRecord };
  }

  public getCaseStatusHistory(caseIdOrRef: string): CaseStatusHistoryRecord[] {
    const c = this.cases.get(caseIdOrRef);
    if (!c) return [];
    return this.caseStatusHistory.filter(h => h.caseId === c.id || h.caseReference === c.caseReference);
  }

  // ==========================================
  // Case Creation & Query Methods
  // ==========================================

  public createCase(input: CaseIntakeInput, clientUserId?: string): { caseRecord: CaseRecord; event: CaseEvent } {
    this.caseCounter += 1;
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-digit hex
    const caseReference = `BEG-2026-${randomHex}`;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Map input to service category and pillar
    const category = this.getServiceCategory(input.serviceSlug);
    const pillar: PillarType = category?.pillar || input.pillar || 'CONSTRUCTION_SERVICES';

    const caseRecord: CaseRecord = {
      id,
      caseReference,
      clientId: clientUserId,
      pillar,
      serviceSlug: input.serviceSlug || 'structural-engineering',
      primaryDiscipline: input.primaryDiscipline,
      subDisciplines: input.subDisciplines || [],
      address: input.address,
      city: input.city,
      stateRegion: input.stateRegion,
      pincode: input.pincode,
      plotSizeSqFt: input.plotSizeSqFt,
      terrainType: input.terrainType,
      projectTitle: input.projectTitle,
      buildingType: input.buildingType,
      scopeDescription: input.scopeDescription,
      scopeDetails: input.scopeDetails || {},
      specialRequirements: input.specialRequirements || [],
      budgetRange: input.budgetRange,
      normalizedBudgetMin: input.normalizedBudgetMin,
      normalizedBudgetMax: input.normalizedBudgetMax,
      financingStatus: input.financingStatus || 'Self-Funded / Approved',
      startDateUrgency: input.startDateUrgency,
      expectedDuration: input.expectedDuration || '6 - 9 Months',
      clientName: input.clientName,
      clientEmail: input.clientEmail,
      clientPhone: input.clientPhone,
      clientOrg: input.clientOrg || 'Individual Client',
      status: 'NEW',
      targetSpecialist: input.targetSpecialist,
      createdAt: now,
      updatedAt: now,
      isDemo: false,
    };

    // Store by both UUID and reference
    this.cases.set(id, caseRecord);
    this.cases.set(caseReference, caseRecord);

    // Initial Status History Entry
    this.caseStatusHistory.push({
      id: `csh-${crypto.randomUUID().slice(0, 8)}`,
      caseId: id,
      caseReference,
      fromStatus: 'NEW',
      toStatus: 'NEW',
      actorId: clientUserId,
      actorName: input.clientName,
      actorRole: 'CUSTOMER',
      reason: 'Requirement intake brief submitted by customer.',
      createdAt: now,
    });

    // Initialize milestones
    this.milestones.set(caseReference, [
      {
        id: `m-${crypto.randomUUID().slice(0, 8)}`,
        step: 1,
        title: 'Requirement Intake & Technical Qualification',
        status: 'IN_PROGRESS',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lead: 'Technical Operations Coordinator',
        deliverables: ['Intake_Requirement_Brief.pdf', 'Verification_Checklist.pdf'],
        budgetAllocated: 'Platform Covered',
        budgetStatus: 'RELEASED',
      },
      {
        id: `m-${crypto.randomUUID().slice(0, 8)}`,
        step: 2,
        title: 'Specialist Empanelment Matching & Scope Discovery',
        status: 'UPCOMING',
        date: new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lead: 'Assigned Specialist Consultant',
        deliverables: ['Specialist_Proposal_Package.pdf'],
        budgetAllocated: 'Pending Proposal',
        budgetStatus: 'UNFUNDED',
      },
      {
        id: `m-${crypto.randomUUID().slice(0, 8)}`,
        step: 3,
        title: 'Technical Deliverable Execution & Peer Vetting',
        status: 'UPCOMING',
        date: new Date(Date.now() + 45 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lead: 'Assigned Lead Specialist',
        deliverables: ['Technical_Calculation_Pack.pdf', 'CAD_DWG_Drawings.dwg'],
        budgetAllocated: 'Per Agreed Milestone',
        budgetStatus: 'UNFUNDED',
      }
    ]);

    // Initialize document list
    this.documents.set(caseReference, [
      {
        id: `doc-${crypto.randomUUID().slice(0, 8)}`,
        name: `${input.projectTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Intake_Brief.pdf`,
        size: '142 KB',
        type: 'Requirement Brief',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        author: input.clientName,
        isVerified: true,
      }
    ]);

    // Record canonical event
    const event = this.recordEvent({
      case_id: id,
      case_reference: caseReference,
      event_type: 'CASE_CREATED',
      user_id: clientUserId || `usr-${crypto.randomUUID().slice(0, 8)}`,
      role: 'CUSTOMER',
      service: input.primaryDiscipline,
      location: `${input.city}, ${input.stateRegion}`,
      timestamp: now,
      metadata: {
        projectTitle: input.projectTitle,
        pillar,
        serviceSlug: input.serviceSlug,
        budgetRange: input.budgetRange,
        buildingType: input.buildingType,
        targetSpecialist: input.targetSpecialist || null,
      }
    });

    // Create notification for operations
    const coordUsers = Array.from(this.users.values()).filter(u => u.role === 'EMPLOYEE' || u.role === 'ADMIN');
    for (const admin of coordUsers) {
      this.createNotification({
        userId: admin.id,
        caseId: id,
        type: 'NEW_CASE_SUBMITTED',
        title: `New Requirement Brief: ${caseReference}`,
        message: `${input.clientName} submitted a new requirement for ${input.primaryDiscipline} in ${input.city}.`,
      });
    }

    return { caseRecord, event };
  }

  // ==========================================
  // Provider Enrollment Methods
  // ==========================================

  public createEnrollment(input: EnrollmentIntakeInput, submittedByUserId?: string): EnrollmentRecord {
    this.enrollmentCounter += 1;
    const enrollmentReference = `BEG-ENR-2026-${String(this.enrollmentCounter).padStart(5, '0')}`;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const record: EnrollmentRecord = {
      id,
      enrollmentReference,
      role: input.role,
      fullName: input.fullName,
      businessName: input.businessName,
      email: input.email,
      phone: input.phone,
      city: input.city,
      pincode: input.pincode,
      serviceRadiusKm: input.serviceRadiusKm,
      profileCompletion: 70,
      kycStatus: 'PENDING',
      categoryVerification: 'PENDING',
      serviceAreaStatus: 'COMPLETE',
      catalogStatus: 'INCOMPLETE',
      status: 'PENDING_VERIFICATION',
      details: input.details || {},
      documents: input.documents || [],
      submittedByUserId,
      createdAt: now,
      updatedAt: now,
    };

    this.enrollments.set(id, record);
    this.enrollments.set(enrollmentReference, record);

    const adminUsers = Array.from(this.users.values()).filter(u =>
      u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'
    );
    for (const admin of adminUsers) {
      this.createNotification({
        userId: admin.id,
        type: 'ENROLLMENT_SUBMITTED',
        title: `New Provider Enrollment: ${enrollmentReference}`,
        message: `${input.fullName} (${input.role.replace(/_/g, ' ')}) submitted an empanelment application from ${input.city}.`,
      });
    }

    return record;
  }

  public getEnrollment(idOrRef: string): EnrollmentRecord | undefined {
    return this.enrollments.get(idOrRef);
  }

  public getAllEnrollments(): EnrollmentRecord[] {
    const seen = new Set<string>();
    const list: EnrollmentRecord[] = [];
    for (const e of this.enrollments.values()) {
      if (!seen.has(e.id)) {
        seen.add(e.id);
        list.push(e);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public updateEnrollmentStatus(
    idOrRef: string,
    status: EnrollmentStatus,
    reviewerId: string,
    notes?: string
  ): EnrollmentRecord {
    const record = this.enrollments.get(idOrRef);
    if (!record) throw new Error(`Enrollment not found: ${idOrRef}`);

    const now = new Date().toISOString();
    const updated: EnrollmentRecord = {
      ...record,
      status,
      updatedAt: now,
      reviewedByUserId: reviewerId,
      reviewNotes: notes,
      kycStatus: status === 'APPROVED' ? 'VERIFIED' : status === 'REJECTED' ? 'REJECTED' : 'UNDER_REVIEW',
      categoryVerification: status === 'APPROVED' ? 'VERIFIED' : 'PENDING',
      profileCompletion: status === 'APPROVED' ? 100 : record.profileCompletion,
    };

    this.enrollments.set(record.id, updated);
    this.enrollments.set(record.enrollmentReference, updated);
    return updated;
  }

  private canAccessCaseFull(caseRecord: CaseRecord, user?: SafeUser): boolean {
    if (!user) return false;
    return userCanAccessCase(user, caseRecord, this.getAssignmentsForCase(caseRecord.id));
  }

  private canAccessEnrollmentFull(enrollment: EnrollmentRecord, user?: SafeUser): boolean {
    if (!user) return false;
    if (['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE'].includes(user.role)) return true;
    return (
      enrollment.email.toLowerCase() === user.email.toLowerCase() ||
      enrollment.submittedByUserId === user.id
    );
  }

  private mapCaseStatusDisplay(status: string): string {
    const map: Record<string, string> = {
      NEW: 'Submitted',
      QUALIFICATION_PENDING: 'Under Review',
      QUALIFICATION: 'Under Review',
      QUALIFIED: 'Qualified',
      NEEDS_INFORMATION: 'Action Required',
      COORDINATOR_ASSIGNED: 'Coordinator Assigned',
      MATCHING: 'Matching Specialist',
      SPECIALIST_MATCHING: 'Matching Specialist',
      CONSULTANT_ASSIGNED: 'Specialist Assigned',
      ASSIGNED: 'Specialist Assigned',
      SCOPE_DISCOVERY: 'Scope Discovery',
      IN_PROGRESS: 'In Progress',
      PROPOSAL_PENDING: 'Proposal Pending',
      CUSTOMER_REVIEW: 'Under Review',
      UNDER_REVIEW: 'Under Review',
      APPROVED: 'Approved',
      PROJECT_READY: 'Project Ready',
      COMPLETED: 'Completed',
      CLOSED: 'Closed',
    };
    return map[status] || status.replace(/_/g, ' ');
  }

  private mapEnrollmentStatusDisplay(status: EnrollmentStatus): string {
    const map: Record<EnrollmentStatus, string> = {
      PENDING_VERIFICATION: 'Submitted — Pending Verification',
      UNDER_REVIEW: 'KYC Under Review',
      APPROVED: 'Approved & Empaneled',
      REJECTED: 'Rejected',
    };
    return map[status] || status;
  }

  public getTrackView(idOrRef: string, user?: SafeUser): PublicTrackRecord | null {
    const term = idOrRef.trim();
    if (!term) return null;

    const upper = term.toUpperCase();
    const tryEnrollmentFirst = upper.includes('BEG-ENR') || upper.includes('ENR-');

    if (tryEnrollmentFirst) {
      const enr = this.getEnrollment(term);
      if (enr) return this.buildEnrollmentTrackView(enr, user);
    }

    const caseRec = this.getCase(term);
    if (caseRec) return this.buildCaseTrackView(caseRec, user);

    if (!tryEnrollmentFirst) {
      const enr = this.getEnrollment(term);
      if (enr) return this.buildEnrollmentTrackView(enr, user);
    }

    return null;
  }

  private buildCaseTrackView(caseRecord: CaseRecord, user?: SafeUser): PublicTrackRecord {
    const fullAccess = this.canAccessCaseFull(caseRecord, user);
    const canViewDirectContact = fullAccess && user?.role !== 'CONSULTANT';
    const history = this.getCaseStatusHistory(caseRecord.id);
    const milestones = this.getMilestones(caseRecord.caseReference);

    const statusHistory: TrackStatusHistoryEntry[] = history.map(h => ({
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      reason: h.reason,
      createdAt: h.createdAt,
      actorRole: h.actorRole,
    }));

    const milestoneEntries: TrackMilestoneEntry[] = milestones.map(m => ({
      title: m.title,
      status: m.status,
      date: m.date,
      step: m.step,
    }));

    return {
      id: caseRecord.id,
      reference: caseRecord.caseReference,
      type: 'CASE',
      title: caseRecord.projectTitle,
      status: caseRecord.status,
      displayStatus: this.mapCaseStatusDisplay(caseRecord.status),
      location: fullAccess ? caseRecord.address : undefined,
      city: caseRecord.city,
      pincode: fullAccess ? caseRecord.pincode : undefined,
      createdAt: caseRecord.createdAt,
      updatedAt: caseRecord.updatedAt,
      assignedDesk: caseRecord.targetSpecialist || caseRecord.leadSpecialistName || 'BuildEcoGroup Central Desk',
      primaryDiscipline: caseRecord.primaryDiscipline,
      statusHistory,
      milestones: milestoneEntries,
      isFullAccess: fullAccess,
      clientName: fullAccess ? caseRecord.clientName : undefined,
      clientEmail: canViewDirectContact ? caseRecord.clientEmail : undefined,
      clientPhone: canViewDirectContact ? caseRecord.clientPhone : undefined,
      caseReference: caseRecord.caseReference,
    };
  }

  private buildEnrollmentTrackView(enrollment: EnrollmentRecord, user?: SafeUser): PublicTrackRecord {
    const fullAccess = this.canAccessEnrollmentFull(enrollment, user);

    const statusHistory: TrackStatusHistoryEntry[] = [
      {
        fromStatus: 'NEW',
        toStatus: enrollment.status,
        reason: enrollment.status === 'APPROVED'
          ? (enrollment.reviewNotes || 'Enrollment approved by operations desk.')
          : enrollment.status === 'REJECTED'
          ? (enrollment.reviewNotes || 'Enrollment rejected after KYC review.')
          : 'Empanelment application received and queued for verification.',
        createdAt: enrollment.updatedAt,
        actorRole: enrollment.reviewedByUserId ? 'ADMIN' : 'SYSTEM',
      },
    ];

    const milestones: TrackMilestoneEntry[] = [
      { title: 'Application Submitted', status: 'COMPLETED', step: 1, date: new Date(enrollment.createdAt).toLocaleDateString() },
      { title: 'KYC & License Verification', status: enrollment.kycStatus === 'VERIFIED' ? 'COMPLETED' : enrollment.kycStatus === 'REJECTED' ? 'FAILED' : 'IN_PROGRESS', step: 2 },
      { title: 'Category Peer Review', status: enrollment.categoryVerification === 'VERIFIED' ? 'COMPLETED' : 'UPCOMING', step: 3 },
      { title: 'Empanelment Decision', status: enrollment.status === 'APPROVED' ? 'COMPLETED' : enrollment.status === 'REJECTED' ? 'FAILED' : 'UPCOMING', step: 4 },
    ];

    return {
      id: enrollment.id,
      reference: enrollment.enrollmentReference,
      type: 'ENROLLMENT',
      title: `${enrollment.role.replace(/_/g, ' ')} Empanelment — ${enrollment.businessName || enrollment.fullName}`,
      status: enrollment.status,
      displayStatus: this.mapEnrollmentStatusDisplay(enrollment.status),
      city: enrollment.city,
      pincode: fullAccess ? enrollment.pincode : undefined,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
      assignedDesk: 'Provider Empanelment & KYC Desk',
      role: enrollment.role,
      kycStatus: enrollment.kycStatus,
      profileCompletion: enrollment.profileCompletion,
      statusHistory,
      milestones,
      isFullAccess: fullAccess,
      clientName: fullAccess ? enrollment.fullName : undefined,
      clientEmail: fullAccess ? enrollment.email : undefined,
      clientPhone: fullAccess ? enrollment.phone : undefined,
    };
  }

  public getCase(idOrReference: string): CaseRecord | undefined {
    return this.cases.get(idOrReference);
  }

  public getCaseById(idOrReference: string): CaseRecord | undefined {
    return this.cases.get(idOrReference);
  }

  public getAllCases(): CaseRecord[] {
    const seen = new Set<string>();
    const list: CaseRecord[] = [];
    for (const c of this.cases.values()) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        list.push(c);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getCasesByClientId(clientId: string): CaseRecord[] {
    return this.getAllCases().filter(c => c.clientId === clientId);
  }

  // ==========================================
  // Deterministic Consultant Matching Algorithm
  // ==========================================

  public getConsultantMatchesForCase(caseIdOrRef: string): ConsultantMatchResult[] {
    const c = this.cases.get(caseIdOrRef);
    if (!c) throw new Error('Case not found');

    const verifiedConsultants = Array.from(this.consultants.values()).filter(
      cons => cons.verificationStatus === 'VERIFIED' && cons.status !== 'Suspended'
    );

    const results: ConsultantMatchResult[] = [];

    for (const consultant of verifiedConsultants) {
      let score = 40; // Base score for being verified empaneled consultant
      const matchReasons: string[] = [];

      // 1. Verification statutory check
      matchReasons.push(`Verified statutory licensing credential (${consultant.statutoryRegNumber || 'Empaneled Specialist'})`);

      // 2. Discipline & Specialization match
      const caseTerms = [
        c.primaryDiscipline.toLowerCase(),
        c.serviceSlug.toLowerCase(),
        c.pillar.toLowerCase(),
        ...(c.subDisciplines || []).map(s => s.toLowerCase()),
      ];

      const consultantTerms = [
        consultant.department.toLowerCase(),
        consultant.specialization.toLowerCase(),
        ...(consultant.focusAreas || []).map(f => f.toLowerCase()),
      ];

      let hasDisciplineMatch = false;
      for (const ct of caseTerms) {
        for (const term of consultantTerms) {
          if (term.includes(ct) || ct.includes(term)) {
            hasDisciplineMatch = true;
            break;
          }
        }
        if (hasDisciplineMatch) break;
      }

      if (hasDisciplineMatch) {
        score += 35;
        matchReasons.push(`Domain expertise matches ${c.primaryDiscipline}`);
      } else {
        matchReasons.push(`Cross-disciplinary engineering capability`);
      }

      // 3. Location match (Same city bonus)
      if (consultant.city.toLowerCase() === c.city.toLowerCase()) {
        score += 15;
        matchReasons.push(`Local metro presence in ${consultant.city}`);
      } else {
        score += 5;
        matchReasons.push(`National jurisdiction consulting coverage`);
      }

      // 4. Experience & Rating
      if (consultant.experienceYears >= 10) {
        score += 5;
        matchReasons.push(`${consultant.experienceYears}+ years senior practice leadership`);
      }

      if (consultant.rating >= 4.9) {
        score += 5;
        matchReasons.push(`High client satisfaction rating (${consultant.rating.toFixed(2)} / 5.0)`);
      }

      // Calculate active cases count
      const activeCasesCount = Array.from(this.assignments.values()).filter(
        a => a.consultantId === consultant.userId && a.status === 'ACCEPTED'
      ).length;

      if (activeCasesCount > 3) {
        score -= 10;
        matchReasons.push(`Active case workload: ${activeCasesCount} in-flight projects`);
      } else {
        matchReasons.push(`Currently available with capacity for immediate intake`);
      }

      const finalScore = Math.min(100, Math.max(0, score));

      results.push({
        consultant,
        matchScore: finalScore,
        matchReasons,
        isPrimaryMatch: finalScore >= 80,
        activeCasesCount,
      });
    }

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  // ==========================================
  // Coordinator & Qualification Operations
  // ==========================================

  public qualifyCase(params: {
    caseIdOrRef: string;
    checklist: {
      requirementUnderstood: boolean;
      locationVerified: boolean;
      serviceCategoryConfirmed: boolean;
      contactUsable: boolean;
      criticalDocsIdentified: boolean;
    };
    notes?: string;
    coordinatorUserId: string;
  }): CaseRecord {
    const c = this.cases.get(params.caseIdOrRef);
    if (!c) throw new Error('Case not found');

    const coordinator = this.users.get(params.coordinatorUserId);
    if (!coordinator || !['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'].includes(coordinator.role)) {
      throw new Error('Unauthorized: Only coordinators and administrators can qualify cases.');
    }

    // Save checklist
    c.qualificationChecklist = params.checklist;
    c.qualificationNotes = params.notes;
    c.assignedCoordinatorId = params.coordinatorUserId;
    c.assignedCoordinatorName = coordinator.fullName;

    // Transition status to QUALIFIED
    this.transitionCaseStatus({
      caseIdOrRef: c.id,
      nextStatus: 'QUALIFIED',
      actorId: params.coordinatorUserId,
      actorRole: coordinator.role,
      reason: 'Requirement brief successfully verified and marked QUALIFIED.',
      metadata: { checklist: params.checklist, notes: params.notes }
    });

    return c;
  }

  public assignCoordinator(params: {
    caseIdOrRef: string;
    coordinatorId: string;
    assignedByUserId: string;
    notes?: string;
  }): CaseRecord {
    const c = this.cases.get(params.caseIdOrRef);
    if (!c) throw new Error('Case not found');

    const coordUser = this.users.get(params.coordinatorId);
    if (!coordUser || !['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'].includes(coordUser.role)) {
      throw new Error('Invalid coordinator: target user must have EMPLOYEE, ADMIN, or SUPER_ADMIN role.');
    }

    const assigner = this.users.get(params.assignedByUserId);
    if (!assigner || !['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'].includes(assigner.role)) {
      throw new Error('Unauthorized: Only operations staff can assign coordinators.');
    }

    c.assignedCoordinatorId = params.coordinatorId;
    c.assignedCoordinatorName = coordUser.fullName;

    if (c.status === 'NEW' || c.status === 'QUALIFIED') {
      this.transitionCaseStatus({
        caseIdOrRef: c.id,
        nextStatus: 'COORDINATOR_ASSIGNED',
        actorId: params.assignedByUserId,
        actorRole: assigner.role,
        reason: `Assigned technical coordinator: ${coordUser.fullName}`,
        metadata: { notes: params.notes }
      });
    }

    // Notify coordinator
    this.createNotification({
      userId: params.coordinatorId,
      caseId: c.id,
      type: 'COORDINATOR_ASSIGNED',
      title: `Assigned to Case ${c.caseReference}`,
      message: `You have been appointed lead coordinator for ${c.projectTitle}.`,
    });

    return c;
  }

  public assignConsultant(params: {
    caseIdOrRef: string;
    consultantUserId: string;
    assignedByUserId: string;
    feeEstimate?: string;
    responseDueHours?: number;
    notes?: string;
    overrideJustification?: string;
  }): AssignmentRecord {
    const c = this.cases.get(params.caseIdOrRef);
    if (!c) throw new Error('Case not found');

    const assigner = this.users.get(params.assignedByUserId);
    if (!assigner || !['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'].includes(assigner.role)) {
      throw new Error('Unauthorized: Only coordinators and administrators can dispatch consultant assignments.');
    }

    const consultantUser = this.users.get(params.consultantUserId);
    if (!consultantUser) throw new Error('Consultant user record not found.');

    const dueHours = params.responseDueHours || 48;
    const responseDueAt = new Date(Date.now() + dueHours * 3600000).toISOString();
    const now = new Date().toISOString();

    // Cancel any previous pending assignments for this case
    for (const a of this.assignments.values()) {
      if (a.caseId === c.id && a.status === 'PENDING') {
        a.status = 'SUPERSEDED';
        a.updatedAt = now;
      }
    }

    const assignmentId = `asgn-${crypto.randomUUID().slice(0, 8)}`;
    const assignment: AssignmentRecord = {
      id: assignmentId,
      caseId: c.id,
      caseReference: c.caseReference,
      consultantId: params.consultantUserId,
      consultantName: consultantUser.fullName,
      assignmentType: 'CONSULTANT',
      status: 'PENDING',
      assignedBy: params.assignedByUserId,
      feeEstimate: params.feeEstimate || '₹4.5L - ₹6.0L Est.',
      responseDueAt,
      deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
      createdAt: now,
      updatedAt: now,
      caseSummary: {
        caseReference: c.caseReference,
        projectTitle: c.projectTitle,
        pillar: c.pillar,
        serviceSlug: c.serviceSlug,
        primaryDiscipline: c.primaryDiscipline,
        city: c.city,
        stateRegion: c.stateRegion,
        scopeDescription: c.scopeDescription,
        budgetRange: c.budgetRange,
        startDateUrgency: c.startDateUrgency,
        status: c.status,
      }
    };

    this.assignments.set(assignmentId, assignment);

    c.assignedConsultantId = params.consultantUserId;
    c.leadSpecialistName = consultantUser.fullName;

    // Transition status to CONSULTANT_ASSIGNED
    this.transitionCaseStatus({
      caseIdOrRef: c.id,
      nextStatus: 'CONSULTANT_ASSIGNED',
      actorId: params.assignedByUserId,
      actorRole: assigner.role,
      reason: `Dispatched assignment to empaneled consultant: ${consultantUser.fullName}${params.overrideJustification ? ` (Override: ${params.overrideJustification})` : ''}`,
      metadata: { assignmentId, responseDueAt, feeEstimate: params.feeEstimate }
    });

    // Notify consultant
    this.createNotification({
      userId: params.consultantUserId,
      caseId: c.id,
      type: 'CONSULTANT_ASSIGNMENT_DISPATCHED',
      title: `New Assignment Lead: ${c.caseReference}`,
      message: `You have received a new requirement dispatch for ${c.primaryDiscipline} in ${c.city}. Please respond within ${dueHours} hours.`,
    });

    return assignment;
  }

  // ==========================================
  // Consultant Action Workflow (Accept / Decline)
  // ==========================================

  public respondToAssignment(params: {
    assignmentId: string;
    consultantUserId: string;
    action: 'accept' | 'decline';
    reason?: string;
    responseNotes?: string;
  }): { assignment: AssignmentRecord; caseRecord: CaseRecord } {
    const assignment = this.assignments.get(params.assignmentId);
    if (!assignment) throw new Error('Assignment record not found.');

    if (assignment.consultantId !== params.consultantUserId) {
      throw new Error('Unauthorized: You can only respond to assignments allocated to your consultant account.');
    }

    if (assignment.status !== 'PENDING') {
      throw new Error(`Cannot respond to assignment with status '${assignment.status}'. Only PENDING assignments can be accepted or declined.`);
    }

    const c = this.cases.get(assignment.caseId);
    if (!c) throw new Error('Associated case not found.');

    const now = new Date().toISOString();
    assignment.respondedAt = now;
    assignment.updatedAt = now;
    assignment.responseNotes = params.responseNotes;

    if (params.action === 'accept') {
      assignment.status = 'ACCEPTED';

      // Transition case to CONSULTANT_ACCEPTED then SCOPE_DISCOVERY
      this.transitionCaseStatus({
        caseIdOrRef: c.id,
        nextStatus: 'CONSULTANT_ACCEPTED',
        actorId: params.consultantUserId,
        actorRole: 'CONSULTANT',
        reason: 'Empaneled specialist accepted the case assignment.',
        metadata: { assignmentId: assignment.id, notes: params.responseNotes }
      });

      // Automatically advance to SCOPE_DISCOVERY
      this.transitionCaseStatus({
        caseIdOrRef: c.id,
        nextStatus: 'SCOPE_DISCOVERY',
        actorId: params.consultantUserId,
        actorRole: 'CONSULTANT',
        reason: 'Commenced technical scope discovery and client engagement.',
      });

      // Notify customer and coordinator
      if (c.clientId) {
        this.createNotification({
          userId: c.clientId,
          caseId: c.id,
          type: 'ASSIGNMENT_ACCEPTED',
          title: `Specialist Assigned: ${c.caseReference}`,
          message: `${assignment.consultantName || 'Verified Specialist'} has accepted your project and is preparing your technical scope proposal.`,
        });
      }

      if (c.assignedCoordinatorId) {
        this.createNotification({
          userId: c.assignedCoordinatorId,
          caseId: c.id,
          type: 'ASSIGNMENT_ACCEPTED',
          title: `Consultant Accepted ${c.caseReference}`,
          message: `${assignment.consultantName} accepted the assignment for ${c.projectTitle}.`,
        });
      }
    } else {
      assignment.status = 'DECLINED';
      assignment.declineReason = params.reason || 'Capacity / Schedule constraint';

      // Return case to MATCHING
      this.transitionCaseStatus({
        caseIdOrRef: c.id,
        nextStatus: 'MATCHING',
        actorId: params.consultantUserId,
        actorRole: 'CONSULTANT',
        reason: `Specialist declined assignment: ${params.reason || 'Not specified'}. Reassignment required.`,
        metadata: { assignmentId: assignment.id, reason: params.reason }
      });

      // Notify coordinator for immediate reassignment
      if (c.assignedCoordinatorId) {
        this.createNotification({
          userId: c.assignedCoordinatorId,
          caseId: c.id,
          type: 'ASSIGNMENT_DECLINED',
          title: `Assignment Declined: ${c.caseReference}`,
          message: `${assignment.consultantName} declined assignment for ${c.projectTitle}. Reason: ${params.reason || 'Not specified'}. Please reassign.`,
        });
      }
    }

    return { assignment, caseRecord: c };
  }

  public getAssignmentsForConsultant(consultantUserId: string): AssignmentRecord[] {
    const list: AssignmentRecord[] = [];
    for (const a of this.assignments.values()) {
      if (a.consultantId === consultantUserId) {
        const c = this.cases.get(a.caseId);
        if (c) {
          a.caseSummary = {
            caseReference: c.caseReference,
            projectTitle: c.projectTitle,
            pillar: c.pillar,
            serviceSlug: c.serviceSlug,
            primaryDiscipline: c.primaryDiscipline,
            city: c.city,
            stateRegion: c.stateRegion,
            scopeDescription: c.scopeDescription,
            budgetRange: c.budgetRange,
            startDateUrgency: c.startDateUrgency,
            status: c.status,
          };
        }
        list.push(a);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAssignmentsForCase(caseIdOrRef: string): AssignmentRecord[] {
    const c = this.cases.get(caseIdOrRef);
    if (!c) return [];
    return Array.from(this.assignments.values()).filter(a => a.caseId === c.id);
  }

  // ==========================================
  // Information Requests Workflow
  // ==========================================

  public createInformationRequest(params: {
    caseIdOrRef: string;
    requestedByUserId: string;
    question: string;
  }): CaseInformationRequestRecord {
    const c = this.cases.get(params.caseIdOrRef);
    if (!c) throw new Error('Case not found');

    const requester = this.users.get(params.requestedByUserId);
    if (!requester || !['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN', 'CONSULTANT'].includes(requester.role)) {
      throw new Error('Unauthorized to request information.');
    }

    const id = `req-${crypto.randomUUID().slice(0, 8)}`;
    const record: CaseInformationRequestRecord = {
      id,
      caseId: c.id,
      requestedBy: params.requestedByUserId,
      requestedByName: requester.fullName,
      question: params.question,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.informationRequests.set(id, record);

    // Transition case status to NEEDS_INFORMATION
    this.transitionCaseStatus({
      caseIdOrRef: c.id,
      nextStatus: 'NEEDS_INFORMATION',
      actorId: params.requestedByUserId,
      actorRole: requester.role,
      reason: `Clarification requested from customer: "${params.question}"`,
      metadata: { requestId: id }
    });

    // Notify customer
    if (c.clientId) {
      this.createNotification({
        userId: c.clientId,
        caseId: c.id,
        type: 'MORE_INFO_REQUIRED',
        title: `Information Requested for ${c.caseReference}`,
        message: `Our technical team requires clarification: "${params.question}". Please respond in your portal.`,
      });
    }

    return record;
  }

  public respondToInformationRequest(params: {
    requestId: string;
    customerUserId: string;
    response: string;
  }): { request: CaseInformationRequestRecord; caseRecord: CaseRecord } {
    const req = this.informationRequests.get(params.requestId);
    if (!req) throw new Error('Information request not found.');

    const c = this.cases.get(req.caseId);
    if (!c) throw new Error('Associated case not found.');

    // Security verify: customer owns the case or is staff
    const user = this.users.get(params.customerUserId);
    if (!user) throw new Error('User not found.');

    if (user.role === 'CUSTOMER' && c.clientId && c.clientId !== user.id && c.clientEmail.toLowerCase() !== user.email.toLowerCase()) {
      throw new Error('Unauthorized: You cannot respond to requests for other customers\' cases.');
    }

    req.response = params.response;
    req.status = 'RESPONDED';
    req.respondedAt = new Date().toISOString();

    // Transition status back to QUALIFICATION_PENDING or SCOPE_DISCOVERY
    const nextStatus: CaseStatus = c.assignedConsultantId ? 'SCOPE_DISCOVERY' : 'QUALIFICATION_PENDING';
    this.transitionCaseStatus({
      caseIdOrRef: c.id,
      nextStatus,
      actorId: params.customerUserId,
      actorRole: user.role,
      reason: 'Customer submitted response to information request.',
      metadata: { requestId: req.id, response: params.response }
    });

    // Notify coordinator
    if (c.assignedCoordinatorId) {
      this.createNotification({
        userId: c.assignedCoordinatorId,
        caseId: c.id,
        type: 'INFO_RESPONDED',
        title: `Customer Responded on ${c.caseReference}`,
        message: `${c.clientName} provided clarification for ${c.projectTitle}.`,
      });
    }

    return { request: req, caseRecord: c };
  }

  public getInformationRequests(caseIdOrRef: string): CaseInformationRequestRecord[] {
    const c = this.cases.get(caseIdOrRef);
    if (!c) return [];
    return Array.from(this.informationRequests.values()).filter(r => r.caseId === c.id);
  }

  // ==========================================
  // Internal Notes & Messages
  // ==========================================

  public createCaseNote(params: {
    caseIdOrRef: string;
    authorUserId: string;
    note: string;
    visibility: 'INTERNAL' | 'CUSTOMER_VISIBLE';
  }): CaseNoteRecord {
    const c = this.cases.get(params.caseIdOrRef);
    if (!c) throw new Error('Case not found');

    const author = this.users.get(params.authorUserId);
    if (!author) throw new Error('User not found');

    if (author.role === 'CUSTOMER' && params.visibility === 'INTERNAL') {
      throw new Error('Customers cannot create internal-only notes.');
    }

    const noteRecord: CaseNoteRecord = {
      id: `cn-${crypto.randomUUID().slice(0, 8)}`,
      caseId: c.id,
      authorUserId: params.authorUserId,
      authorName: author.fullName,
      authorRole: author.role,
      note: params.note,
      visibility: params.visibility,
      createdAt: new Date().toISOString(),
    };

    this.caseNotes.unshift(noteRecord);

    this.recordEvent({
      case_id: c.id,
      case_reference: c.caseReference,
      event_type: 'INTERNAL_NOTE_ADDED',
      user_id: params.authorUserId,
      role: author.role as any,
      service: c.primaryDiscipline,
      location: `${c.city}, ${c.stateRegion}`,
      metadata: { visibility: params.visibility }
    });

    return noteRecord;
  }

  public getCaseNotes(caseIdOrRef: string, callerRole: UserRole): CaseNoteRecord[] {
    const c = this.cases.get(caseIdOrRef);
    if (!c) return [];

    const all = this.caseNotes.filter(n => n.caseId === c.id);
    if (callerRole === 'CUSTOMER') {
      return all.filter(n => n.visibility === 'CUSTOMER_VISIBLE');
    }
    return all;
  }

  public createCaseMessage(params: {
    caseIdOrRef: string;
    senderUserId: string;
    message: string;
  }): CaseMessageRecord {
    const c = this.cases.get(params.caseIdOrRef);
    if (!c) throw new Error('Case not found');

    const sender = this.users.get(params.senderUserId);
    if (!sender) throw new Error('User not found');

    const messageRecord: CaseMessageRecord = {
      id: `msg-${crypto.randomUUID().slice(0, 8)}`,
      caseId: c.id,
      senderUserId: params.senderUserId,
      senderName: sender.fullName,
      senderRole: sender.role,
      message: params.message,
      createdAt: new Date().toISOString(),
    };

    this.caseMessages.push(messageRecord);

    this.recordEvent({
      case_id: c.id,
      case_reference: c.caseReference,
      event_type: 'MESSAGE_SENT',
      user_id: params.senderUserId,
      role: sender.role as any,
      service: c.primaryDiscipline,
      location: `${c.city}, ${c.stateRegion}`,
      metadata: { senderRole: sender.role }
    });

    return messageRecord;
  }

  public getCaseMessages(caseIdOrRef: string): CaseMessageRecord[] {
    const c = this.cases.get(caseIdOrRef);
    if (!c) return [];
    return this.caseMessages.filter(m => m.caseId === c.id);
  }

  // ==========================================
  // In-App Notifications
  // ==========================================

  public createNotification(params: {
    userId: string;
    caseId?: string;
    type: string;
    title: string;
    message: string;
  }): NotificationRecord {
    const record: NotificationRecord = {
      id: `notif-${crypto.randomUUID().slice(0, 8)}`,
      userId: params.userId,
      caseId: params.caseId,
      type: params.type,
      title: params.title,
      message: params.message,
      read: false,
      createdAt: new Date().toISOString(),
    };

    this.notifications.unshift(record);
    return record;
  }

  public getUserNotifications(userId: string): NotificationRecord[] {
    return this.notifications.filter(n => n.userId === userId);
  }

  public markNotificationRead(notificationId: string, userId: string): void {
    const n = this.notifications.find(item => item.id === notificationId && item.userId === userId);
    if (n) {
      n.read = true;
    }
  }

  // ==========================================
  // Event Store Methods
  // ==========================================

  public recordEvent(params: {
    case_id: string;
    case_reference: string;
    event_type: CaseEvent['event_type'];
    user_id: string;
    role: CaseEvent['role'];
    service: string;
    location: string;
    timestamp?: string;
    metadata?: Record<string, any>;
  }): CaseEvent {
    const event: CaseEvent = {
      event_id: crypto.randomUUID(),
      case_id: params.case_id,
      event_type: params.event_type,
      user_id: params.user_id,
      role: params.role,
      service: params.service,
      location: params.location,
      timestamp: params.timestamp || new Date().toISOString(),
      metadata: {
        caseReference: params.case_reference,
        ...(params.metadata || {})
      },
    };

    this.events.unshift(event);
    return event;
  }

  public getEvents(caseIdOrRef?: string): CaseEvent[] {
    if (!caseIdOrRef) return this.events;
    return this.events.filter(e => 
      e.case_id === caseIdOrRef || 
      e.metadata?.caseReference === caseIdOrRef
    );
  }

  // ==========================================
  // Consultant Methods
  // ==========================================

  public createConsultantOnboarding(input: ConsultantOnboardingInput): ConsultantRecord {
    const id = `c-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const consultant: ConsultantRecord = {
      id,
      name: input.fullName,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      title: `${input.discipline} Specialist`,
      department: input.discipline,
      specialization: input.specialties.join(' & '),
      city: input.city,
      country: 'India',
      experienceYears: input.yearsExp,
      rating: 5.0,
      completedCases: 0,
      verificationStatus: 'SUBMITTED',
      status: 'Available',
      focusAreas: input.specialties,
      bio: `Independent specialist practicing under ${input.firmName}. Statutory registration: ${input.statutoryRegNumber}. Academic credentials: ${input.educationDegree}.`,
      certifications: [`Statutory Reg: ${input.statutoryRegNumber}`],
      education: input.educationDegree,
      hourlyRateEst: input.hourlyRateEst,
      statutoryRegNumber: input.statutoryRegNumber,
      firmName: input.firmName,
      email: input.email,
      phone: input.phone,
      createdAt: now,
      isDemo: false,
    };

    this.consultants.set(id, consultant);

    // Record audit event
    this.recordEvent({
      case_id: id,
      case_reference: `CONSULTANT-${id.toUpperCase()}`,
      event_type: 'CASE_CREATED',
      user_id: id,
      role: 'CONSULTANT',
      service: input.discipline,
      location: input.city,
      timestamp: now,
      metadata: {
        action: 'CONSULTANT_APPLICATION_SUBMITTED',
        verificationStatus: 'SUBMITTED',
        statutoryRegNumber: input.statutoryRegNumber,
      }
    });

    return consultant;
  }

  public getAllConsultants(): ConsultantRecord[] {
    return Array.from(this.consultants.values());
  }

  public getConsultant(id: string): ConsultantRecord | undefined {
    return this.consultants.get(id);
  }

  // ==========================================
  // Milestones & Documents
  // ==========================================

  public getMilestones(caseReference: string): ProjectMilestoneRecord[] {
    return this.milestones.get(caseReference) || [
      {
        id: 'm-default-1',
        step: 1,
        title: 'Project Requirement Intake & Scope Verification',
        status: 'IN_PROGRESS',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lead: 'Case Coordinator',
        deliverables: ['Intake_Report.pdf'],
        budgetAllocated: 'Under Review',
        budgetStatus: 'UNFUNDED',
      }
    ];
  }

  public getDocuments(caseReference: string): DocumentRecord[] {
    return this.documents.get(caseReference) || [
      {
        id: 'doc-default-1',
        name: 'Project_Intake_Dossier.pdf',
        size: '2.4 MB',
        type: 'PDF Document',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        author: 'BuildEcoGroup System',
        isVerified: true,
      }
    ];
  }

  // ==========================================
  // User Identity & RBAC Store Methods
  // ==========================================

  public findUserById(id: string): SafeUser | undefined {
    return this.users.get(id);
  }

  public findUserByEmail(email: string): SafeUser | undefined {
    const userId = this.usersByEmail.get(email.toLowerCase());
    return userId ? this.users.get(userId) : undefined;
  }

  public findUserByFirebaseUid(uid: string): SafeUser | undefined {
    const userId = this.usersByFirebaseUid.get(uid);
    return userId ? this.users.get(userId) : undefined;
  }

  public findUserByPhone(phone: string): SafeUser | undefined {
    const normalized = this.normalizePhone(phone);
    if (!normalized) return undefined;
    for (const user of this.users.values()) {
      if (user.phone && this.normalizePhone(user.phone) === normalized) {
        return user;
      }
    }
    return undefined;
  }

  private normalizePhone(phone: string | null | undefined): string {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
    if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`;
    return digits ? `+${digits}` : '';
  }

  public getAllUsers(): SafeUser[] {
    return Array.from(this.users.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public countActiveSuperAdmins(): number {
    return Array.from(this.users.values()).filter(
      (u) => u.role === 'SUPER_ADMIN' && u.status === 'ACTIVE'
    ).length;
  }

  public createUser(params: {
    email: string;
    fullName: string;
    phone?: string | null;
    role: UserRole;
    status?: UserStatus;
    firebaseUid?: string | null;
    emailVerified?: boolean;
    profile?: SafeUser['profile'];
    ipAddress?: string;
    allowPrivilegedRole?: boolean;
    mustChangePassword?: boolean;
  }): SafeUser {
    // Defense-in-depth: public registration paths must never provision privileged RBAC roles.
    let effectiveRole: UserRole = params.role;
    const privileged = effectiveRole === 'ADMIN' || effectiveRole === 'SUPER_ADMIN' || effectiveRole === 'EMPLOYEE';
    if (privileged && !params.allowPrivilegedRole) {
      console.warn(`[Security Alert] Public creation attempt with privileged role '${params.role}' intercepted — forcing CUSTOMER.`);
      effectiveRole = 'CUSTOMER';
    }

    const email = params.email.toLowerCase().trim();
    const existingId = this.usersByEmail.get(email);
    if (existingId) {
      throw new Error(`A user with email ${params.email} already exists in the system.`);
    }

    if (params.firebaseUid && this.usersByFirebaseUid.has(params.firebaseUid)) {
      throw new Error('A user with this Firebase identity already exists.');
    }

    const normalizedPhone = params.phone ? this.normalizePhone(params.phone) : null;
    if (normalizedPhone) {
      const phoneOwner = this.findUserByPhone(normalizedPhone);
      if (phoneOwner) {
        throw new Error('An account with this mobile number already exists. Please sign in instead.');
      }
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newUser: SafeUser = {
      id,
      email,
      fullName: params.fullName,
      phone: normalizedPhone,
      role: effectiveRole,
      status: params.status || 'ACTIVE',
      emailVerified: params.emailVerified ?? false,
      firebaseUid: params.firebaseUid || null,
      createdAt: now,
      updatedAt: now,
      mustChangePassword: params.mustChangePassword ?? false,
      profile: params.profile || {
        city: 'Bengaluru',
        stateRegion: 'Karnataka',
      },
    };

    this.users.set(id, newUser);
    this.usersByEmail.set(newUser.email, id);
    if (newUser.firebaseUid) {
      this.usersByFirebaseUid.set(newUser.firebaseUid, id);
    }

    this.recordSecurityAudit({
      actorId: id,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: id,
      ipAddress: params.ipAddress,
      changes: {
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      }
    });

    return newUser;
  }

  /**
   * Idempotent profile upsert keyed by Firebase UID (stable identity).
   * Used for registration completion and orphan recovery.
   */
  public upsertCustomerByFirebaseUid(params: {
    firebaseUid: string;
    email: string;
    fullName: string;
    phone?: string | null;
    emailVerified?: boolean;
    profile?: SafeUser['profile'];
    ipAddress?: string;
  }): { user: SafeUser; created: boolean; repaired: boolean } {
    const email = params.email.toLowerCase().trim();
    const byUid = this.findUserByFirebaseUid(params.firebaseUid);
    if (byUid) {
      byUid.fullName = params.fullName || byUid.fullName;
      byUid.emailVerified = params.emailVerified ?? byUid.emailVerified;
      if (params.phone) byUid.phone = this.normalizePhone(params.phone);
      if (params.profile) byUid.profile = { ...byUid.profile, ...params.profile };
      byUid.updatedAt = new Date().toISOString();
      byUid.lastLoginAt = new Date().toISOString();
      return { user: byUid, created: false, repaired: false };
    }

    const byEmail = this.findUserByEmail(email);
    if (byEmail) {
      if (byEmail.firebaseUid && byEmail.firebaseUid !== params.firebaseUid) {
        throw new Error('EMAIL_IDENTITY_CONFLICT');
      }
      if (!byEmail.firebaseUid) {
        this.linkFirebaseUid(byEmail.id, params.firebaseUid, params.emailVerified);
      }
      byEmail.fullName = params.fullName || byEmail.fullName;
      if (params.phone) byEmail.phone = this.normalizePhone(params.phone);
      if (params.profile) byEmail.profile = { ...byEmail.profile, ...params.profile };
      byEmail.updatedAt = new Date().toISOString();
      this.recordSecurityAudit({
        actorId: byEmail.id,
        action: 'USER_PROFILE_REPAIRED',
        entityType: 'USER',
        entityId: byEmail.id,
        ipAddress: params.ipAddress,
        changes: { firebaseUid: params.firebaseUid, repaired: true },
      });
      return { user: byEmail, created: false, repaired: true };
    }

    if (params.phone) {
      const phoneOwner = this.findUserByPhone(params.phone);
      if (phoneOwner && phoneOwner.email !== email) {
        throw new Error('An account with this mobile number already exists. Please sign in instead.');
      }
    }

    const user = this.createUser({
      email,
      fullName: params.fullName,
      phone: params.phone,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      firebaseUid: params.firebaseUid,
      emailVerified: params.emailVerified,
      profile: params.profile,
      ipAddress: params.ipAddress,
    });
    return { user, created: true, repaired: false };
  }

  public upsertPrivilegedUser(params: {
    email: string;
    fullName: string;
    role: UserRole;
    firebaseUid: string;
    status?: UserStatus;
    mustChangePassword?: boolean;
    ipAddress?: string;
    actorId?: string;
  }): { user: SafeUser; created: boolean } {
    const email = params.email.toLowerCase().trim();
    let user = this.findUserByFirebaseUid(params.firebaseUid) || this.findUserByEmail(email);
    if (user) {
      const previous = { role: user.role, status: user.status, firebaseUid: user.firebaseUid };
      if (!user.firebaseUid) {
        this.linkFirebaseUid(user.id, params.firebaseUid, true);
      }
      user.role = params.role;
      user.status = params.status || 'ACTIVE';
      user.fullName = params.fullName || user.fullName;
      user.emailVerified = true;
      user.mustChangePassword = params.mustChangePassword ?? user.mustChangePassword;
      user.updatedAt = new Date().toISOString();
      this.recordSecurityAudit({
        actorId: params.actorId || user.id,
        action: 'PRIVILEGED_USER_UPSERTED',
        entityType: 'USER',
        entityId: user.id,
        ipAddress: params.ipAddress,
        changes: { previous, next: { role: user.role, status: user.status, firebaseUid: user.firebaseUid } },
      });
      return { user, created: false };
    }

    user = this.createUser({
      email,
      fullName: params.fullName,
      role: params.role,
      status: params.status || 'ACTIVE',
      firebaseUid: params.firebaseUid,
      emailVerified: true,
      allowPrivilegedRole: true,
      mustChangePassword: params.mustChangePassword,
      ipAddress: params.ipAddress,
      profile: {
        organization: 'BuildEcoGroup Directorate',
        designation: params.role,
        city: 'Bengaluru',
        stateRegion: 'Karnataka',
        country: 'India',
      },
    });
    return { user, created: true };
  }

  public linkFirebaseUid(userId: string, firebaseUid: string, emailVerified?: boolean): SafeUser {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    user.firebaseUid = firebaseUid;
    if (emailVerified !== undefined) {
      user.emailVerified = emailVerified;
    }
    user.lastLoginAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();

    this.usersByFirebaseUid.set(firebaseUid, userId);
    return user;
  }

  public updateLastLogin(userId: string): void {
    const user = this.users.get(userId);
    if (user) {
      user.lastLoginAt = new Date().toISOString();
      user.updatedAt = new Date().toISOString();
    }
  }

  private customCategorySuggestions: Array<{
    id: string;
    userId: string;
    suggestion: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
  }> = [];

  public updateUserProfile(userId: string, patch: { interests?: string[]; pincode?: string; district?: string; city?: string; stateRegion?: string }): SafeUser {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    user.profile = {
      ...user.profile,
      interests: patch.interests ?? user.profile?.interests ?? [],
      pincode: patch.pincode ?? user.profile?.pincode ?? null,
      district: patch.district ?? user.profile?.district ?? null,
      city: patch.city ?? user.profile?.city ?? null,
      stateRegion: patch.stateRegion ?? user.profile?.stateRegion ?? null,
    };
    return user;
  }

  public suggestCustomCategory(userId: string, suggestion: string): void {
    this.customCategorySuggestions.push({
      id: `ccs-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      suggestion,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    });
    this.recordSecurityAudit({
      actorId: userId,
      action: 'CUSTOM_CATEGORY_SUGGESTED',
      entityType: 'CATEGORY',
      entityId: userId,
      changes: { suggestion },
    });
  }

  public getCustomCategorySuggestions() {
    return this.customCategorySuggestions;
  }

  public updateUserRole(
    adminUserId: string,
    targetUserId: string,
    newRole: UserRole,
    reason: string,
    ipAddress?: string
  ): SafeUser {
    const admin = this.users.get(adminUserId);
    if (!admin || admin.role !== 'SUPER_ADMIN') {
      throw new Error('Unauthorized: Only Super Administrators can alter user platform roles.');
    }

    const targetUser = this.users.get(targetUserId);
    if (!targetUser) throw new Error('Target user not found');

    if (adminUserId === targetUserId && newRole !== 'SUPER_ADMIN') {
      throw new Error('A Super Admin cannot demote their own account.');
    }

    if (
      targetUser.role === 'SUPER_ADMIN' &&
      newRole !== 'SUPER_ADMIN' &&
      this.countActiveSuperAdmins() <= 1 &&
      targetUser.status === 'ACTIVE'
    ) {
      throw new Error('Cannot demote the last active Super Admin.');
    }

    // Only Super Admin may assign/revoke privileged roles (already gated above).
    const previousRole = targetUser.role;
    targetUser.role = newRole;
    targetUser.updatedAt = new Date().toISOString();

    this.recordSecurityAudit({
      actorId: adminUserId,
      action: 'USER_ROLE_CHANGED',
      entityType: 'USER',
      entityId: targetUserId,
      ipAddress,
      changes: { previousRole, newRole, reason, actorEmail: admin.email, targetEmail: targetUser.email },
    });

    return targetUser;
  }

  public updateUserStatus(
    adminUserId: string,
    targetUserId: string,
    newStatus: UserStatus,
    reason: string,
    ipAddress?: string
  ): SafeUser {
    const admin = this.users.get(adminUserId);
    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      throw new Error('Unauthorized: Only Administrators can alter user account status.');
    }

    const targetUser = this.users.get(targetUserId);
    if (!targetUser) throw new Error('Target user not found');

    if (admin.role === 'ADMIN' && (targetUser.role === 'SUPER_ADMIN' || targetUser.role === 'ADMIN')) {
      throw new Error('Administrators cannot change status for Admin or Super Admin accounts.');
    }

    if (
      targetUser.role === 'SUPER_ADMIN' &&
      targetUser.status === 'ACTIVE' &&
      newStatus !== 'ACTIVE' &&
      this.countActiveSuperAdmins() <= 1
    ) {
      throw new Error('Cannot suspend or disable the last active Super Admin.');
    }

    const previousStatus = targetUser.status;
    targetUser.status = newStatus;
    targetUser.updatedAt = new Date().toISOString();

    this.recordSecurityAudit({
      actorId: adminUserId,
      action: 'USER_STATUS_CHANGED',
      entityType: 'USER',
      entityId: targetUserId,
      ipAddress,
      changes: { previousStatus, newStatus, reason, actorEmail: admin.email, targetEmail: targetUser.email },
    });

    return targetUser;
  }

  public verifyConsultantStatus(adminUserId: string, consultantId: string, verificationStatus: 'VERIFIED' | 'REJECTED' | 'UNDER_REVIEW'): ConsultantRecord {
    const admin = this.users.get(adminUserId);
    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      throw new Error('Unauthorized: Only Administrators can verify consultant empanelment credentials.');
    }

    const consultant = this.consultants.get(consultantId);
    if (!consultant) throw new Error('Consultant profile not found');

    consultant.verificationStatus = verificationStatus;

    this.recordSecurityAudit({
      actorId: adminUserId,
      action: 'CONSULTANT_VERIFICATION_UPDATED',
      entityType: 'CONSULTANT',
      entityId: consultantId,
      changes: { verificationStatus },
    });

    return consultant;
  }

  // ==========================================
  // Phase 6: Commercial Engine Methods
  // ==========================================

  public getTaxCodes(): TaxCodeRecord[] {
    const list: TaxCodeRecord[] = [];
    const seen = new Set<string>();
    for (const tc of this.taxCodes.values()) {
      if (!seen.has(tc.id)) {
        seen.add(tc.id);
        list.push(tc);
      }
    }
    return list.sort((a, b) => a.rate - b.rate);
  }

  public createTaxCode(params: {
    code: string;
    name: string;
    rate: number;
    hsnSacCode?: string;
    actorId: string;
  }): TaxCodeRecord {
    const actor = this.users.get(params.actorId);
    if (!actor || !['ADMIN', 'SUPER_ADMIN'].includes(actor.role)) {
      throw new Error('Unauthorized: Only administrators can configure statutory tax codes.');
    }

    const code = params.code.trim().toUpperCase();
    if (this.taxCodes.has(code)) {
      throw new Error(`Tax code ${code} already exists.`);
    }

    const record: TaxCodeRecord = {
      id: `tax-${crypto.randomUUID().slice(0, 8)}`,
      code,
      name: params.name.trim(),
      rate: round2(params.rate),
      hsnSacCode: params.hsnSacCode?.trim(),
      effectiveFrom: new Date().toISOString(),
      active: true,
    };

    this.taxCodes.set(record.id, record);
    this.taxCodes.set(record.code, record);

    this.recordSecurityAudit({
      actorId: params.actorId,
      action: 'TAX_CODE_CREATED',
      entityType: 'TAX_CODE',
      entityId: record.id,
      changes: { code: record.code, rate: record.rate },
    });

    return record;
  }

  public createBOQRequest(params: {
    caseId: string;
    title: string;
    estimateType: BOQEstimateType;
    scopeDescription?: string;
    approximateAreaSqFt?: string;
    preferredSpecification?: string;
    notes?: string;
    projectId?: string;
    createdBy: string;
  }): BOQRecord {
    const targetCase = this.getCaseById(params.caseId);
    if (!targetCase) {
      throw new Error(`Case not found: ${params.caseId}`);
    }

    const creator = this.users.get(params.createdBy);
    if (!creator) {
      throw new Error('Creator user not found');
    }
    if (!['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'CONSULTANT'].includes(creator.role)) {
      throw new Error('Forbidden: You are not authorized to initialize commercial BOQ records.');
    }
    if (creator.role === 'CONSULTANT') {
      const assignments = this.getAssignmentsForCase(targetCase.id);
      if (!userCanAccessCase(creator, targetCase, assignments)) {
        throw new Error('Forbidden: BOQ can only be created for cases assigned to your practice.');
      }
    }

    const boqId = `boq-${crypto.randomUUID().slice(0, 8)}`;
    const boqReference = `BEG-BOQ-2026-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const revisionId = `rev-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const starter = buildStarterBOQTemplate(revisionId, now);

    // Initial Revision 1 (Draft) with starter line items for immediate quotation workflow
    const initialRevision: BOQRevisionRecord = {
      id: revisionId,
      boqId,
      revisionNumber: 1,
      status: 'DRAFT',
      notes: params.notes || 'Initial estimation draft',
      subtotal: starter.totals.subtotal,
      taxTotal: starter.totals.taxTotal,
      adjustmentTotal: starter.totals.adjustmentTotal,
      grandTotal: starter.totals.grandTotal,
      createdBy: params.createdBy,
      createdByName: creator?.fullName || 'Platform Specialist',
      createdAt: now,
      items: starter.items,
      adjustments: starter.adjustments,
      approvals: [],
    };

    const boqRecord: BOQRecord = {
      id: boqId,
      caseId: targetCase.id,
      caseReference: targetCase.caseReference,
      projectId: params.projectId || targetCase.id,
      boqReference,
      estimateType: params.estimateType,
      title: params.title.trim(),
      status: 'IN_PREPARATION',
      currency: 'INR',
      scopeDescription: params.scopeDescription || targetCase.scopeDescription,
      approximateAreaSqFt: params.approximateAreaSqFt || (targetCase.plotSizeSqFt ? `${targetCase.plotSizeSqFt} sq ft` : undefined),
      preferredSpecification: params.preferredSpecification,
      notes: params.notes,
      currentRevisionId: revisionId,
      createdBy: params.createdBy,
      createdByName: creator?.fullName,
      createdAt: now,
      updatedAt: now,
      currentRevision: initialRevision,
      revisions: [initialRevision],
      approvals: [],
    };

    this.boqs.set(boqId, boqRecord);
    this.boqs.set(boqReference, boqRecord);
    this.boqRevisions.set(revisionId, initialRevision);
    this.boqItems.set(revisionId, starter.items);
    this.boqAdjustments.set(revisionId, starter.adjustments);
    this.boqApprovals.set(boqId, []);

    // Record Case Event & Timeline
    this.recordEvent({
      case_id: targetCase.id,
      case_reference: targetCase.caseReference,
      event_type: 'BOQ_CREATED',
      user_id: params.createdBy,
      role: (creator?.role as any) || 'CONSULTANT',
      service: targetCase.primaryDiscipline,
      location: `${targetCase.city}, ${targetCase.stateRegion}`,
      metadata: {
        title: `Commercial BOQ Initiated (${boqReference})`,
        description: `Bill of Quantities (${params.estimateType}) initiated by ${creator?.fullName || 'Specialist'}: "${params.title}"`,
        boqId,
        boqReference,
        estimateType: params.estimateType,
        revisionNumber: 1,
      },
    });

    this.recordSecurityAudit({
      actorId: params.createdBy,
      action: 'BOQ_CREATED',
      entityType: 'BOQ',
      entityId: boqId,
      changes: { boqReference, estimateType: params.estimateType, caseId: targetCase.id },
    });

    return boqRecord;
  }

  /** Internal lookup without RBAC — use middleware/store guards before exposing. */
  public getBOQRecordRaw(idOrRef: string): BOQRecord | undefined {
    return this.boqs.get(idOrRef);
  }

  public getBOQByIdOrRef(idOrRef: string, user?: SafeUser): BOQRecord | undefined {
    const boq = this.boqs.get(idOrRef);
    if (!boq) return undefined;

    if (user) {
      const targetCase = this.getCaseById(boq.caseId);
      if (targetCase) {
        assertCaseAccess(user, targetCase, this.getAssignmentsForCase(targetCase.id));
      }
    }

    // Hydrate revisions, items, adjustments, approvals
    const hydratedRevisions: BOQRevisionRecord[] = [];
    for (const rev of this.boqRevisions.values()) {
      if (rev.boqId === boq.id) {
        const items = this.boqItems.get(rev.id) || [];
        const adjustments = this.boqAdjustments.get(rev.id) || [];
        const approvals = (this.boqApprovals.get(boq.id) || []).filter(a => a.revisionId === rev.id);
        hydratedRevisions.push({
          ...rev,
          items,
          adjustments,
          approvals,
        });
      }
    }

    hydratedRevisions.sort((a, b) => b.revisionNumber - a.revisionNumber);

    const currentRev = hydratedRevisions.find(r => r.id === boq.currentRevisionId) || hydratedRevisions[0];
    const boqApprovals = this.boqApprovals.get(boq.id) || [];

    return {
      ...boq,
      currentRevision: currentRev,
      revisions: hydratedRevisions,
      approvals: boqApprovals,
    };
  }

  public getBOQsForCase(caseId: string, user?: SafeUser): BOQRecord[] {
    const targetCase = this.getCaseById(caseId);
    if (!targetCase) return [];

    if (user) {
      assertCaseAccess(user, targetCase, this.getAssignmentsForCase(targetCase.id));
    }

    const results: BOQRecord[] = [];
    const seen = new Set<string>();

    for (const b of this.boqs.values()) {
      if (b.caseId === targetCase.id && !seen.has(b.id)) {
        seen.add(b.id);
        const hydrated = this.getBOQByIdOrRef(b.id, user);
        if (hydrated) results.push(hydrated);
      }
    }

    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createBOQRevision(params: {
    boqId: string;
    notes?: string;
    createdBy: string;
  }): BOQRevisionRecord {
    const boq = this.boqs.get(params.boqId);
    if (!boq) throw new Error(`BOQ not found: ${params.boqId}`);

    const creator = this.users.get(params.createdBy);
    
    // Count existing revisions
    let maxRev = 0;
    let latestRev: BOQRevisionRecord | undefined;
    for (const rev of this.boqRevisions.values()) {
      if (rev.boqId === boq.id) {
        if (rev.revisionNumber > maxRev) {
          maxRev = rev.revisionNumber;
          latestRev = rev;
        }
      }
    }

    const nextRevNumber = maxRev + 1;
    const newRevisionId = `rev-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    // Copy items and adjustments from previous revision if available
    const prevItems = latestRev ? (this.boqItems.get(latestRev.id) || []) : [];
    const prevAdjustments = latestRev ? (this.boqAdjustments.get(latestRev.id) || []) : [];

    const newItems: BOQItemRecord[] = prevItems.map(item => ({
      ...item,
      id: `item-${crypto.randomUUID().slice(0, 8)}`,
      revisionId: newRevisionId,
      createdAt: now,
    }));

    const newAdjustments: BOQAdjustmentRecord[] = prevAdjustments.map(adj => ({
      ...adj,
      id: `adj-${crypto.randomUUID().slice(0, 8)}`,
      revisionId: newRevisionId,
    }));

    // Recalculate Totals
    const totals = calculateBOQRevisionTotals(newItems, newAdjustments);

    const newRevision: BOQRevisionRecord = {
      id: newRevisionId,
      boqId: boq.id,
      revisionNumber: nextRevNumber,
      status: 'DRAFT',
      notes: params.notes || `Revision ${nextRevNumber}`,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      adjustmentTotal: totals.adjustmentTotal,
      grandTotal: totals.grandTotal,
      createdBy: params.createdBy,
      createdByName: creator?.fullName || 'Specialist',
      createdAt: now,
      items: newItems,
      adjustments: newAdjustments,
      approvals: [],
    };

    this.boqRevisions.set(newRevisionId, newRevision);
    this.boqItems.set(newRevisionId, newItems);
    this.boqAdjustments.set(newRevisionId, newAdjustments);

    // Update BOQ
    boq.currentRevisionId = newRevisionId;
    boq.status = 'IN_PREPARATION';
    boq.updatedAt = now;
    this.boqs.set(boq.id, boq);
    this.boqs.set(boq.boqReference, boq);

    // Record Event
    this.recordEvent({
      case_id: boq.caseId,
      case_reference: boq.caseReference,
      event_type: 'BOQ_REVISION_CREATED',
      user_id: params.createdBy,
      role: (creator?.role as any) || 'CONSULTANT',
      service: 'COMMERCIAL_BOQ',
      location: 'India',
      metadata: {
        title: `BOQ Revision ${nextRevNumber} Created (${boq.boqReference})`,
        description: `New revision ${nextRevNumber} initialized for "${boq.title}" by ${creator?.fullName || 'Specialist'}.`,
        boqId: boq.id,
        boqReference: boq.boqReference,
        revisionNumber: nextRevNumber,
      },
    });

    return newRevision;
  }

  public updateBOQRevisionItems(params: {
    boqId: string;
    revisionId: string;
    items: Array<{
      id?: string;
      section: string;
      itemCode?: string;
      description: string;
      specification?: string;
      brand?: string;
      grade?: string;
      size?: string;
      thickness?: string;
      model?: string;
      quantity: number;
      unit: string;
      baseRate: number;
      taxRate?: number;
      rateSource?: RateSource;
      rateSourceReference?: string;
      sortOrder?: number;
    }>;
    adjustments?: Array<{
      id?: string;
      type: BOQAdjustmentType;
      label: string;
      calculationType: CalculationType;
      value: number;
    }>;
    actorId: string;
    actorRole: string;
    notes?: string;
  }): BOQRevisionRecord {
    const boq = this.boqs.get(params.boqId);
    if (!boq) throw new Error(`BOQ not found: ${params.boqId}`);

    const revision = this.boqRevisions.get(params.revisionId);
    if (!revision || revision.boqId !== boq.id) {
      throw new Error(`BOQ Revision not found: ${params.revisionId}`);
    }

    // IMMUTABILITY & CONCURRENCY GUARD: Approved or Locked Revisions cannot be edited!
    if (revision.status === 'APPROVED' || boq.status === 'LOCKED') {
      throw new Error('Lock Violation: Cannot modify an approved or locked BOQ revision. Please create a new revision to propose alterations.');
    }

    // AUTHORIZATION GUARD: Only assigned consultant or employee/admin can edit
    const targetCase = this.getCaseById(boq.caseId);
    if (params.actorRole === 'CUSTOMER') {
      throw new Error('Forbidden: Customers cannot edit BOQ line items directly. Please request a revision or comment.');
    }

    const actor = this.users.get(params.actorId);
    const now = new Date().toISOString();

    // AUTHORITATIVE RECALCULATION OF ALL ITEMS
    const processedItems: BOQItemRecord[] = [];
    let itemCounter = 1;

    for (const raw of params.items) {
      const quantity = Math.max(0.001, round2(raw.quantity));
      const baseRate = Math.max(0, round2(raw.baseRate));
      const taxRate = raw.taxRate !== undefined ? round2(raw.taxRate) : 18;
      
      const { baseAmount, taxAmount, lineTotal } = calculateBOQItemLine({
        quantity,
        baseRate,
        taxRate,
      });

      const sectionCode = raw.section.slice(0, 3).toUpperCase();
      const itemCode = raw.itemCode?.trim() || `${sectionCode}-${String(itemCounter).padStart(3, '0')}`;

      const itemRecord: BOQItemRecord = {
        id: raw.id || `item-${crypto.randomUUID().slice(0, 8)}`,
        revisionId: revision.id,
        section: raw.section.trim(),
        itemCode,
        description: raw.description.trim(),
        specification: raw.specification?.trim() || 'As per architectural drawings & manufacturer standards',
        brand: raw.brand?.trim(),
        grade: raw.grade?.trim(),
        size: raw.size?.trim(),
        thickness: raw.thickness?.trim(),
        model: raw.model?.trim(),
        quantity,
        unit: raw.unit.trim(),
        baseRate,
        taxRate,
        taxAmount,
        lineTotal,
        rateSource: raw.rateSource || 'CONSULTANT_ESTIMATE',
        rateSourceReference: raw.rateSourceReference?.trim(),
        rateDate: now,
        sortOrder: raw.sortOrder ?? itemCounter,
        createdAt: now,
      };

      processedItems.push(itemRecord);
      itemCounter++;
    }

    // Process Adjustments
    const processedAdjustments: BOQAdjustmentRecord[] = [];
    if (params.adjustments) {
      for (const rawAdj of params.adjustments) {
        let adjAmount = 0;
        const subtotalSum = processedItems.reduce((acc, it) => acc + (it.quantity * it.baseRate), 0);
        if (rawAdj.calculationType === 'PERCENTAGE') {
          adjAmount = round2(subtotalSum * (rawAdj.value / 100));
        } else {
          adjAmount = round2(rawAdj.value);
        }
        if (rawAdj.type === 'DISCOUNT') {
          adjAmount = -Math.abs(adjAmount);
        }

        processedAdjustments.push({
          id: rawAdj.id || `adj-${crypto.randomUUID().slice(0, 8)}`,
          revisionId: revision.id,
          type: rawAdj.type,
          label: rawAdj.label.trim(),
          calculationType: rawAdj.calculationType,
          value: rawAdj.value,
          amount: adjAmount,
        });
      }
    }

    // Authoritative Revision Totals
    const totals = calculateBOQRevisionTotals(processedItems, processedAdjustments);

    revision.subtotal = totals.subtotal;
    revision.taxTotal = totals.taxTotal;
    revision.adjustmentTotal = totals.adjustmentTotal;
    revision.grandTotal = totals.grandTotal;
    if (params.notes) revision.notes = params.notes;

    this.boqRevisions.set(revision.id, revision);
    this.boqItems.set(revision.id, processedItems);
    this.boqAdjustments.set(revision.id, processedAdjustments);

    boq.status = 'IN_PREPARATION';
    boq.updatedAt = now;
    this.boqs.set(boq.id, boq);
    this.boqs.set(boq.boqReference, boq);

    this.recordSecurityAudit({
      actorId: params.actorId,
      action: 'BOQ_REVISION_UPDATED',
      entityType: 'BOQ_REVISION',
      entityId: revision.id,
      changes: {
        itemCount: processedItems.length,
        grandTotal: totals.grandTotal,
      },
    });

    return {
      ...revision,
      items: processedItems,
      adjustments: processedAdjustments,
    };
  }

  public submitBOQForReview(params: {
    boqId: string;
    revisionId: string;
    actorId: string;
    actorRole: string;
    notes?: string;
  }): BOQRecord {
    const boq = this.boqs.get(params.boqId);
    if (!boq) throw new Error(`BOQ not found: ${params.boqId}`);

    const revision = this.boqRevisions.get(params.revisionId);
    if (!revision || revision.boqId !== boq.id) {
      throw new Error(`BOQ Revision not found: ${params.revisionId}`);
    }

    const items = this.boqItems.get(revision.id) || [];
    if (items.length === 0) {
      throw new Error('Validation Error: Cannot submit an empty BOQ for review. Please add at least one line item.');
    }

    const actor = this.users.get(params.actorId);
    const targetCase = this.getCaseById(boq.caseId);
    const now = new Date().toISOString();

    revision.status = 'READY_FOR_REVIEW';
    this.boqRevisions.set(revision.id, revision);

    boq.status = 'READY_FOR_REVIEW';
    boq.updatedAt = now;
    this.boqs.set(boq.id, boq);
    this.boqs.set(boq.boqReference, boq);

    // Update Case Status to CUSTOMER_REVIEW via valid workflow transitions
    if (targetCase) {
      let caseStatus = targetCase.status;
      if (['SCOPE_DISCOVERY', 'IN_PROGRESS'].includes(caseStatus)) {
        this.transitionCaseStatus({
          caseIdOrRef: targetCase.id,
          nextStatus: 'PROPOSAL_PENDING',
          actorId: params.actorId,
          actorRole: (actor?.role as any) || 'CONSULTANT',
          reason: `BOQ (${boq.boqReference} Rev ${revision.revisionNumber}) prepared for customer review.`,
        });
        caseStatus = 'PROPOSAL_PENDING';
      }
      if (['PROPOSAL_PENDING', 'SCOPE_DISCOVERY', 'IN_PROGRESS'].includes(caseStatus)) {
        this.transitionCaseStatus({
          caseIdOrRef: targetCase.id,
          nextStatus: 'CUSTOMER_REVIEW',
          actorId: params.actorId,
          actorRole: (actor?.role as any) || 'CONSULTANT',
          reason: `BOQ (${boq.boqReference} Rev ${revision.revisionNumber}) submitted for customer commercial review. Total: ${formatINR(revision.grandTotal)}`,
        });
      }
    }

    // Record Case Event
    this.recordEvent({
      case_id: boq.caseId,
      case_reference: boq.caseReference,
      event_type: 'PROPOSAL_SUBMITTED',
      user_id: params.actorId,
      role: (actor?.role as any) || 'CONSULTANT',
      service: targetCase?.primaryDiscipline || 'COMMERCIAL_BOQ',
      location: targetCase ? `${targetCase.city}, ${targetCase.stateRegion}` : 'India',
      metadata: {
        title: `BOQ Published for Review (${boq.boqReference} Rev ${revision.revisionNumber})`,
        description: `Commercial estimate totaling ${formatINR(revision.grandTotal)} was finalized and published for customer review by ${actor?.fullName || 'Specialist'}.`,
        boqId: boq.id,
        boqReference: boq.boqReference,
        revisionId: revision.id,
        revisionNumber: revision.revisionNumber,
        grandTotal: revision.grandTotal,
      },
    });

    // Notify Customer
    if (targetCase?.clientId) {
      this.createNotification({
        userId: targetCase.clientId,
        caseId: boq.caseId,
        type: 'STATUS_CHANGE',
        title: `Commercial Estimate Ready for Review (${boq.boqReference})`,
        message: `Your detailed BOQ & Estimate for "${boq.title}" totaling ${formatINR(revision.grandTotal)} is ready for your review and approval.`,
      });
    }

    return this.getBOQByIdOrRef(boq.id)!;
  }

  public requestBOQChanges(params: {
    boqId: string;
    revisionId: string;
    actorId: string;
    actorRole: string;
    reasonCategory?: string;
    comment: string;
  }): { boq: BOQRecord; approval: BOQApprovalRecord } {
    const boq = this.boqs.get(params.boqId);
    if (!boq) throw new Error(`BOQ not found: ${params.boqId}`);

    const revision = this.boqRevisions.get(params.revisionId);
    if (!revision || revision.boqId !== boq.id) {
      throw new Error(`BOQ Revision not found: ${params.revisionId}`);
    }

    const actor = this.users.get(params.actorId);
    const targetCase = this.getCaseById(boq.caseId);
    const now = new Date().toISOString();

    const approvalRecord: BOQApprovalRecord = {
      id: `appr-${crypto.randomUUID().slice(0, 8)}`,
      boqId: boq.id,
      revisionId: revision.id,
      approvedBy: params.actorId,
      approvedByName: actor?.fullName || 'Customer',
      decision: 'CHANGES_REQUESTED',
      reasonCategory: params.reasonCategory || 'SPECIFICATION_ADJUSTMENT',
      comment: params.comment.trim(),
      createdAt: now,
    };

    const existingApprovals = this.boqApprovals.get(boq.id) || [];
    existingApprovals.push(approvalRecord);
    this.boqApprovals.set(boq.id, existingApprovals);

    revision.status = 'REVISION_REQUESTED';
    this.boqRevisions.set(revision.id, revision);

    boq.status = 'REVISION_REQUESTED';
    boq.updatedAt = now;
    this.boqs.set(boq.id, boq);
    this.boqs.set(boq.boqReference, boq);

    // Record Event
    this.recordEvent({
      case_id: boq.caseId,
      case_reference: boq.caseReference,
      event_type: 'BOQ_CHANGES_REQUESTED',
      user_id: params.actorId,
      role: (actor?.role as any) || 'CUSTOMER',
      service: targetCase?.primaryDiscipline || 'COMMERCIAL_BOQ',
      location: targetCase ? `${targetCase.city}, ${targetCase.stateRegion}` : 'India',
      metadata: {
        title: `BOQ Revision Requested (${boq.boqReference} Rev ${revision.revisionNumber})`,
        description: `Client requested modifications: "${params.comment}" (Category: ${params.reasonCategory || 'General'})`,
        boqId: boq.id,
        boqReference: boq.boqReference,
        revisionNumber: revision.revisionNumber,
        reasonCategory: params.reasonCategory,
        comment: params.comment,
      },
    });

    // Notify Assigned Consultant
    if (targetCase?.assignedConsultantId) {
      this.createNotification({
        userId: targetCase.assignedConsultantId,
        caseId: boq.caseId,
        type: 'STATUS_CHANGE',
        title: `BOQ Revision Requested (${boq.boqReference})`,
        message: `Customer requested changes on Revision ${revision.revisionNumber}: "${params.comment}"`,
      });
    }

    return {
      boq: this.getBOQByIdOrRef(boq.id)!,
      approval: approvalRecord,
    };
  }

  public approveBOQ(params: {
    boqId: string;
    revisionId: string;
    actorId: string;
    actorRole: string;
    comment?: string;
  }): { boq: BOQRecord; approval: BOQApprovalRecord } {
    const boq = this.boqs.get(params.boqId);
    if (!boq) throw new Error(`BOQ not found: ${params.boqId}`);

    const revision = this.boqRevisions.get(params.revisionId);
    if (!revision || revision.boqId !== boq.id) {
      throw new Error(`BOQ Revision not found: ${params.revisionId}`);
    }

    const targetCase = this.getCaseById(boq.caseId);
    if (!targetCase) throw new Error('Associated Case not found');

    // AUTHORIZATION & VERIFICATION
    if (params.actorRole === 'CUSTOMER' && targetCase.clientId !== params.actorId) {
      throw new Error('Forbidden: Only the registered case owner or authorized director can approve this commercial estimate.');
    }

    // DOUBLE APPROVAL / IDEMPOTENCY GUARD
    if (revision.status === 'APPROVED') {
      const existing = (this.boqApprovals.get(boq.id) || []).find(a => a.revisionId === revision.id && a.decision === 'APPROVED');
      if (existing) {
        return {
          boq: this.getBOQByIdOrRef(boq.id)!,
          approval: existing,
        };
      }
    }

    const actor = this.users.get(params.actorId);
    const now = new Date().toISOString();

    const approvalRecord: BOQApprovalRecord = {
      id: `appr-${crypto.randomUUID().slice(0, 8)}`,
      boqId: boq.id,
      revisionId: revision.id,
      approvedBy: params.actorId,
      approvedByName: actor?.fullName || 'Customer',
      decision: 'APPROVED',
      comment: params.comment?.trim() || 'Commercial estimate and specifications verified and approved by customer.',
      createdAt: now,
    };

    const existingApprovals = this.boqApprovals.get(boq.id) || [];
    existingApprovals.push(approvalRecord);
    this.boqApprovals.set(boq.id, existingApprovals);

    revision.status = 'APPROVED';
    this.boqRevisions.set(revision.id, revision);

    boq.status = 'APPROVED';
    boq.updatedAt = now;
    this.boqs.set(boq.id, boq);
    this.boqs.set(boq.boqReference, boq);

    // Update Case Status to APPROVED via valid workflow transitions
    if (targetCase) {
      let caseStatus = targetCase.status;
      if (['SCOPE_DISCOVERY', 'IN_PROGRESS'].includes(caseStatus)) {
        this.transitionCaseStatus({
          caseIdOrRef: targetCase.id,
          nextStatus: 'PROPOSAL_PENDING',
          actorId: params.actorId,
          actorRole: (actor?.role as any) || 'CUSTOMER',
          reason: `Commercial estimate (${boq.boqReference}) advanced for approval.`,
        });
        caseStatus = 'PROPOSAL_PENDING';
      }
      if (['PROPOSAL_PENDING'].includes(caseStatus)) {
        this.transitionCaseStatus({
          caseIdOrRef: targetCase.id,
          nextStatus: 'CUSTOMER_REVIEW',
          actorId: params.actorId,
          actorRole: (actor?.role as any) || 'CUSTOMER',
          reason: `Commercial estimate (${boq.boqReference}) opened for customer sign-off.`,
        });
        caseStatus = 'CUSTOMER_REVIEW';
      }
      if (caseStatus === 'CUSTOMER_REVIEW') {
        this.transitionCaseStatus({
          caseIdOrRef: targetCase.id,
          nextStatus: 'APPROVED',
          actorId: params.actorId,
          actorRole: (actor?.role as any) || 'CUSTOMER',
          reason: `BOQ (${boq.boqReference} Rev ${revision.revisionNumber}) approved by ${actor?.fullName || 'Customer'}. Commercial baseline locked at ${formatINR(revision.grandTotal)}.`,
        });
      }
    }

    // Record Canonical Case Event
    this.recordEvent({
      case_id: boq.caseId,
      case_reference: boq.caseReference,
      event_type: 'BOQ_APPROVED',
      user_id: params.actorId,
      role: (actor?.role as any) || 'CUSTOMER',
      service: targetCase.primaryDiscipline,
      location: `${targetCase.city}, ${targetCase.stateRegion}`,
      metadata: {
        title: `BOQ Approved & Baseline Locked (${boq.boqReference} Rev ${revision.revisionNumber})`,
        description: `Formal customer approval executed by ${actor?.fullName || 'Customer'}. Approved value: ${formatINR(revision.grandTotal)}. Commercial scope is locked.`,
        boqId: boq.id,
        boqReference: boq.boqReference,
        revisionId: revision.id,
        revisionNumber: revision.revisionNumber,
        grandTotal: revision.grandTotal,
        approvedAt: now,
      },
    });

    this.recordSecurityAudit({
      actorId: params.actorId,
      action: 'BOQ_APPROVED',
      entityType: 'BOQ',
      entityId: boq.id,
      changes: {
        revisionNumber: revision.revisionNumber,
        grandTotal: revision.grandTotal,
      },
    });

    return {
      boq: this.getBOQByIdOrRef(boq.id)!,
      approval: approvalRecord,
    };
  }

  // ==========================================
  // Quotation Management (Suppliers / Providers)
  // ==========================================

  public createQuotation(params: {
    boqId: string;
    providerId: string;
    providerFirm: string;
    providerCity?: string;
    validityDays?: number;
    freight?: number;
    discount?: number;
    leadTimeDays?: number;
    warrantyMonths?: number;
    paymentTerms?: string;
    notes?: string;
    items: Array<{
      boqItemId: string;
      offeredBrand: string;
      offeredSpecification: string;
      quantity: number;
      unitRate: number;
      taxRate?: number;
      availability?: string;
      leadTime?: string;
      specCompliance?: QuotationSpecCompliance;
      notes?: string;
    }>;
  }): QuotationRecord {
    const boq = this.boqs.get(params.boqId);
    if (!boq) throw new Error(`BOQ not found: ${params.boqId}`);

    const provider = this.users.get(params.providerId);
    const quotationId = `quo-${crypto.randomUUID().slice(0, 8)}`;
    const quotationReference = `BEG-QUO-2026-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const now = new Date();
    const validityDays = params.validityDays || 30;
    const validityDate = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000).toISOString();

    const currentRev = this.boqRevisions.get(boq.currentRevisionId || '') || Array.from(this.boqRevisions.values()).find(r => r.boqId === boq.id);
    const canonicalItems = currentRev ? (this.boqItems.get(currentRev.id) || []) : [];
    const canonicalMap = new Map(canonicalItems.map(i => [i.id, i]));

    const processedItems: QuotationItemRecord[] = [];
    let subtotal = 0;
    let taxTotal = 0;

    for (const raw of params.items) {
      const canonical = canonicalMap.get(raw.boqItemId);
      const quantity = Math.max(0.001, round2(raw.quantity));
      const unitRate = Math.max(0, round2(raw.unitRate));
      const taxRate = raw.taxRate !== undefined ? round2(raw.taxRate) : (canonical?.taxRate || 18);

      const baseAmount = round2(quantity * unitRate);
      const taxAmount = round2(baseAmount * (taxRate / 100));
      const lineTotal = round2(baseAmount + taxAmount);

      subtotal += baseAmount;
      taxTotal += taxAmount;

      processedItems.push({
        id: `qitem-${crypto.randomUUID().slice(0, 8)}`,
        quotationId,
        boqItemId: raw.boqItemId,
        itemCode: canonical?.itemCode,
        description: canonical?.description,
        offeredBrand: raw.offeredBrand.trim(),
        offeredSpecification: raw.offeredSpecification.trim(),
        quantity,
        unit: canonical?.unit || 'Nos',
        unitRate,
        taxRate,
        taxAmount,
        lineTotal,
        availability: raw.availability || 'In Stock',
        leadTime: raw.leadTime || '3-5 Days',
        specCompliance: raw.specCompliance || 'EXACT',
        notes: raw.notes?.trim(),
      });
    }

    subtotal = round2(subtotal);
    taxTotal = round2(taxTotal);
    const freight = round2(Math.max(0, params.freight || 0));
    const discount = round2(Math.max(0, params.discount || 0));
    const grandTotal = round2(Math.max(0, subtotal + taxTotal + freight - discount));

    const quotationRecord: QuotationRecord = {
      id: quotationId,
      caseId: boq.caseId,
      boqId: boq.id,
      boqReference: boq.boqReference,
      providerId: params.providerId,
      providerName: provider?.fullName || params.providerFirm,
      providerFirm: params.providerFirm.trim(),
      providerCity: params.providerCity?.trim() || provider?.profile?.city,
      quotationReference,
      status: 'SUBMITTED',
      validityDate,
      subtotal,
      taxTotal,
      freight,
      discount,
      grandTotal,
      leadTimeDays: params.leadTimeDays || 7,
      warrantyMonths: params.warrantyMonths,
      paymentTerms: params.paymentTerms?.trim(),
      notes: params.notes?.trim(),
      items: processedItems,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    this.quotations.set(quotationId, quotationRecord);
    this.quotations.set(quotationReference, quotationRecord);
    this.quotationItems.set(quotationId, processedItems);

    // Record Event
    this.recordEvent({
      case_id: boq.caseId,
      case_reference: boq.caseReference,
      event_type: 'PROPOSAL_GENERATED',
      user_id: params.providerId,
      role: 'CONSULTANT',
      service: 'COMMERCIAL_QUOTATION',
      location: params.providerCity || 'India',
      metadata: {
        title: `Independent Quotation Submitted (${quotationReference})`,
        description: `Provider "${params.providerFirm}" submitted commercial quote of ${formatINR(grandTotal)} for BOQ ${boq.boqReference}.`,
        boqId: boq.id,
        boqReference: boq.boqReference,
        quotationId,
        quotationReference,
        providerFirm: params.providerFirm,
        grandTotal,
      },
    });

    this.recordSecurityAudit({
      actorId: params.providerId,
      action: 'QUOTATION_SUBMITTED',
      entityType: 'QUOTATION',
      entityId: quotationId,
      changes: {
        boqId: boq.id,
        providerFirm: params.providerFirm,
        grandTotal,
      },
    });

    return quotationRecord;
  }

  public getQuotationsForBOQ(boqId: string, user?: SafeUser): QuotationRecord[] {
    const boq = this.boqs.get(boqId);
    if (!boq) return [];

    const targetCase = this.getCaseById(boq.caseId);
    const hasCaseAccess = Boolean(
      user && targetCase && userCanAccessCase(user, targetCase, this.getAssignmentsForCase(targetCase.id)),
    );

    const results: QuotationRecord[] = [];
    const seen = new Set<string>();

    for (const q of this.quotations.values()) {
      if (q.boqId === boq.id && !seen.has(q.id)) {
        seen.add(q.id);

        if (user && !hasCaseAccess && q.providerId !== user.id) {
          continue;
        }

        const items = this.quotationItems.get(q.id) || [];
        results.push({
          ...q,
          items,
        });
      }
    }

    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getQuotationRecordRaw(quotationId: string): QuotationRecord | undefined {
    return this.quotations.get(quotationId);
  }

  public getQuotationById(quotationId: string, user?: SafeUser): QuotationRecord | undefined {
    const quote = this.quotations.get(quotationId);
    if (!quote) return undefined;

    if (user && quote.providerId !== user.id) {
      const targetCase = this.getCaseById(quote.caseId);
      if (!targetCase) {
        throw new Error('Forbidden: Associated case record not found.');
      }
      assertCaseAccess(user, targetCase, this.getAssignmentsForCase(targetCase.id));
    }

    const items = this.quotationItems.get(quote.id) || [];
    return {
      ...quote,
      items,
    };
  }

  public updateQuotationStatus(params: {
    quotationId: string;
    status: QuotationStatus;
    actorId: string;
    actorRole: string;
    reason?: string;
  }): QuotationRecord {
    const quote = this.quotations.get(params.quotationId);
    if (!quote) throw new Error(`Quotation not found: ${params.quotationId}`);

    quote.status = params.status;
    quote.updatedAt = new Date().toISOString();
    this.quotations.set(quote.id, quote);
    this.quotations.set(quote.quotationReference, quote);

    this.recordSecurityAudit({
      actorId: params.actorId,
      action: 'QUOTATION_STATUS_UPDATED',
      entityType: 'QUOTATION',
      entityId: quote.id,
      changes: { status: params.status, reason: params.reason },
    });

    return this.getQuotationById(quote.id)!;
  }

  public acceptQuotation(params: {
    quotationId: string;
    customerId: string;
    notes?: string;
  }): { quotation: QuotationRecord; boq: BOQRecord } {
    const quote = this.quotations.get(params.quotationId);
    if (!quote) throw new Error(`Quotation not found: ${params.quotationId}`);

    const boq = this.boqs.get(quote.boqId);
    if (!boq) throw new Error(`Associated BOQ not found: ${quote.boqId}`);

    const targetCase = this.cases.get(quote.caseId);
    if (!targetCase) throw new Error('Associated Case not found');

    // Ownership Verification
    const customer = this.users.get(params.customerId);
    const isCaseOwner = Boolean(
      targetCase.clientId === params.customerId ||
      (targetCase.clientEmail && customer && targetCase.clientEmail.toLowerCase() === customer.email.toLowerCase()),
    );
    if (!isCaseOwner) {
      if (!customer || !['ADMIN', 'SUPER_ADMIN', 'EMPLOYEE'].includes(customer.role)) {
        throw new Error('Forbidden: Only the case client or coordinator can accept vendor quotations.');
      }
    }

    // Check Expiry
    if (new Date(quote.validityDate).getTime() < Date.now()) {
      quote.status = 'EXPIRED';
      this.quotations.set(quote.id, quote);
      throw new Error(`Quotation ${quote.quotationReference} has expired on ${new Date(quote.validityDate).toLocaleDateString('en-IN')}. Please request an updated quotation.`);
    }

    const now = new Date().toISOString();
    const actor = this.users.get(params.customerId);

    // Accept this quotation
    quote.status = 'ACCEPTED';
    quote.updatedAt = now;
    this.quotations.set(quote.id, quote);
    this.quotations.set(quote.quotationReference, quote);

    // Mark other active quotes as SHORTLISTED or REJECTED
    for (const other of this.quotations.values()) {
      if (other.boqId === boq.id && other.id !== quote.id) {
        if (other.status === 'SUBMITTED' || other.status === 'UNDER_REVIEW') {
          other.status = 'SHORTLISTED';
          other.updatedAt = now;
          this.quotations.set(other.id, other);
          this.quotations.set(other.quotationReference, other);
        }
      }
    }

    // Record Event
    this.recordEvent({
      case_id: boq.caseId,
      case_reference: boq.caseReference,
      event_type: 'PROPOSAL_ACCEPTED',
      user_id: params.customerId,
      role: 'CUSTOMER',
      service: 'COMMERCIAL_QUOTATION',
      location: quote.providerCity || 'India',
      metadata: {
        title: `Vendor Quotation Accepted (${quote.quotationReference})`,
        description: `Quotation from "${quote.providerFirm}" accepted for ${formatINR(quote.grandTotal)} by ${actor?.fullName || 'Client'}.`,
        boqId: boq.id,
        boqReference: boq.boqReference,
        quotationId: quote.id,
        quotationReference: quote.quotationReference,
        providerFirm: quote.providerFirm,
        grandTotal: quote.grandTotal,
      },
    });

    return {
      quotation: this.getQuotationById(quote.id)!,
      boq: this.getBOQByIdOrRef(boq.id)!,
    };
  }

  public compareQuotations(boqId: string, quotationIds?: string[], user?: SafeUser): QuotationComparisonSummary {
    const boq = this.getBOQByIdOrRef(boqId, user);
    if (!boq) throw new Error(`BOQ not found: ${boqId}`);

    const currentRev = boq.currentRevision || boq.revisions?.[0];
    if (!currentRev) throw new Error('BOQ has no valid revisions to compare against');

    const canonicalItems = currentRev.items || [];
    let allQuotes = this.getQuotationsForBOQ(boq.id, user);

    if (quotationIds && quotationIds.length > 0) {
      allQuotes = allQuotes.filter(q => quotationIds.includes(q.id));
    }

    const comparisonItems: NormalizedComparisonItem[] = [];

    for (const cItem of canonicalItems) {
      const quotesForThisItem: NormalizedComparisonItem['quotes'] = [];

      for (const quote of allQuotes) {
        const matchingQItem = quote.items?.find(qi => qi.boqItemId === cItem.id);
        if (matchingQItem) {
          const estimatedRate = cItem.baseRate;
          const variance = estimatedRate > 0 ? round2(((matchingQItem.unitRate - estimatedRate) / estimatedRate) * 100) : 0;

          quotesForThisItem.push({
            quotationId: quote.id,
            providerId: quote.providerId,
            providerFirm: quote.providerFirm,
            offeredBrand: matchingQItem.offeredBrand,
            offeredSpecification: matchingQItem.offeredSpecification,
            unitRate: matchingQItem.unitRate,
            taxRate: matchingQItem.taxRate,
            lineTotal: matchingQItem.lineTotal,
            leadTime: matchingQItem.leadTime,
            availability: matchingQItem.availability,
            specCompliance: matchingQItem.specCompliance,
            variancePercent: variance,
          });
        }
      }

      comparisonItems.push({
        boqItemId: cItem.id,
        itemCode: cItem.itemCode,
        section: cItem.section,
        description: cItem.description,
        canonicalSpec: cItem.specification,
        canonicalBrand: cItem.brand,
        quantity: cItem.quantity,
        unit: cItem.unit,
        estimatedRate: cItem.baseRate,
        estimatedTotal: cItem.lineTotal,
        quotes: quotesForThisItem,
      });
    }

    // Determine Winners
    let lowestCommercialQuoteId: string | null = null;
    let lowestAmount = Infinity;

    let fastestDeliveryQuoteId: string | null = null;
    let shortestLead = Infinity;

    let highestSpecComplianceQuoteId: string | null = null;
    let highestSpecScore = -1;

    for (const q of allQuotes) {
      if (q.grandTotal < lowestAmount) {
        lowestAmount = q.grandTotal;
        lowestCommercialQuoteId = q.id;
      }
      if (q.leadTimeDays < shortestLead) {
        shortestLead = q.leadTimeDays;
        fastestDeliveryQuoteId = q.id;
      }

      // Calculate Spec Compliance Score: EXACT=3, SUPERIOR=3, EQUIVALENT=2, DEVIATED=0
      let score = 0;
      for (const item of q.items || []) {
        if (item.specCompliance === 'EXACT' || item.specCompliance === 'SUPERIOR') score += 3;
        else if (item.specCompliance === 'EQUIVALENT') score += 2;
      }
      if (score > highestSpecScore) {
        highestSpecScore = score;
        highestSpecComplianceQuoteId = q.id;
      }
    }

    // UI-facing normalized row format (QuotationComparisonView expects itemsComparison)
    const itemsComparison = comparisonItems.map((item) => {
      const quotesMap: Record<string, {
        unitRate: number;
        offeredBrand: string;
        lineTotal: number;
        specCompliance: string;
      }> = {};
      let lowestLineRate = Infinity;
      let lowestRateQuotationId: string | null = null;

      for (const q of item.quotes) {
        quotesMap[q.quotationId] = {
          unitRate: q.unitRate,
          offeredBrand: q.offeredBrand,
          lineTotal: q.lineTotal,
          specCompliance: q.specCompliance,
        };
        if (q.unitRate < lowestLineRate) {
          lowestLineRate = q.unitRate;
          lowestRateQuotationId = q.quotationId;
        }
      }

      return {
        boqItemId: item.boqItemId,
        itemCode: item.itemCode,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        baselineRate: item.estimatedRate,
        quotes: quotesMap,
        lowestRateQuotationId,
      };
    });

    return {
      boq,
      revision: currentRev,
      quotations: allQuotes,
      comparisonItems,
      lowestCommercialQuoteId,
      highestSpecComplianceQuoteId,
      fastestDeliveryQuoteId,
      boqBaselineTotal: currentRev.grandTotal,
      itemsComparison,
      summary: {
        lowestOverallQuotationId: lowestCommercialQuoteId,
        fastestLeadTimeQuotationId: fastestDeliveryQuoteId,
        highestSpecComplianceQuotationId: highestSpecComplianceQuoteId,
      },
    };
  }

  public generateBOQDocumentData(boqId: string, revisionNumber?: number, user?: SafeUser): any {
    const boq = this.getBOQByIdOrRef(boqId, user);
    if (!boq) throw new Error(`BOQ not found: ${boqId}`);

    const targetCase = this.cases.get(boq.caseId);
    const revision = revisionNumber 
      ? boq.revisions?.find(r => r.revisionNumber === revisionNumber) 
      : boq.currentRevision;

    if (!revision) throw new Error('Selected revision not found');

    const sectionsMap = new Map<string, BOQItemRecord[]>();
    for (const item of revision.items || []) {
      const s = item.section || 'General';
      if (!sectionsMap.has(s)) sectionsMap.set(s, []);
      sectionsMap.get(s)!.push(item);
    }

    const sections = Array.from(sectionsMap.entries()).map(([name, items]) => {
      const sectionTotal = items.reduce((sum, it) => sum + it.lineTotal, 0);
      return {
        name,
        items,
        sectionTotal: round2(sectionTotal),
      };
    });

    return {
      documentHeader: {
        platformName: 'BuildEcoGroup Orchestration Platform',
        platformCin: 'U72900KA2025PTC189012',
        platformGstin: '29AAFCB1234F1Z8',
        office: 'Indiranagar Commercial Hub, 100 Feet Rd, Bengaluru 560038',
        url: 'https://buildecogroup.in',
      },
      boqReference: boq.boqReference,
      caseReference: boq.caseReference,
      title: boq.title,
      estimateType: boq.estimateType,
      status: boq.status,
      currency: boq.currency,
      revisionNumber: revision.revisionNumber,
      revisionStatus: revision.status,
      createdAt: revision.createdAt,
      customer: {
        name: targetCase?.clientName || 'Valued Client',
        organization: targetCase?.clientOrg || 'Client Organization',
        city: targetCase?.city || 'India',
      },
      scope: {
        description: boq.scopeDescription,
        approximateAreaSqFt: boq.approximateAreaSqFt,
        preferredSpecification: boq.preferredSpecification,
      },
      sections,
      financialSummary: {
        subtotal: revision.subtotal,
        taxTotal: revision.taxTotal,
        adjustmentTotal: revision.adjustmentTotal,
        grandTotal: revision.grandTotal,
        subtotalFormatted: formatINR(revision.subtotal),
        taxTotalFormatted: formatINR(revision.taxTotal),
        adjustmentTotalFormatted: formatINR(revision.adjustmentTotal),
        grandTotalFormatted: formatINR(revision.grandTotal),
      },
      adjustments: revision.adjustments || [],
      approvals: revision.approvals || [],
      commercialDisclaimer: 'BuildEcoGroup operates strictly as a neutral professional services and technology orchestration platform. Line-item prices, rates, taxes, and delivery timelines are subject to formal procurement vetting and provider contract execution.',
    };
  }

  // ==========================================
  // Security Audit Logging
  // ==========================================

  public recordSecurityAudit(params: {
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    ipAddress?: string;
    changes?: Record<string, any>;
  }): AuditLogRecord {
    const record: AuditLogRecord = {
      id: `audit-${crypto.randomUUID().slice(0, 8)}`,
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      ipAddress: params.ipAddress,
      changes: params.changes,
      timestamp: new Date().toISOString(),
    };

    this.auditLogs.unshift(record);
    return record;
  }

  public getAuditLogs(limit: number = 50): AuditLogRecord[] {
    return this.auditLogs.slice(0, limit);
  }

  public exportRuntimeState(): Record<string, unknown> {
    const map = (value: Map<any, any>) => Array.from(value.entries());
    return {
      users: map(this.users), usersByEmail: map(this.usersByEmail), usersByFirebaseUid: map(this.usersByFirebaseUid), auditLogs: this.auditLogs,
      serviceCategories: map(this.serviceCategories), cases: map(this.cases), caseStatusHistory: this.caseStatusHistory,
      assignments: map(this.assignments), informationRequests: map(this.informationRequests), caseNotes: this.caseNotes,
      caseMessages: this.caseMessages, notifications: this.notifications, taxCodes: map(this.taxCodes), boqs: map(this.boqs),
      boqRevisions: map(this.boqRevisions), boqItems: map(this.boqItems), boqAdjustments: map(this.boqAdjustments), boqApprovals: map(this.boqApprovals),
      quotations: map(this.quotations), quotationItems: map(this.quotationItems), serviceCommercialRules: map(this.serviceCommercialRules),
      workPackages: map(this.workPackages), freelancerOpportunities: map(this.freelancerOpportunities), freelancerBids: map(this.freelancerBids),
      freelancerProfiles: map(this.freelancerProfiles), referrals: map(this.referrals), partnerLedgers: map(this.partnerLedgers), events: this.events,
      consultants: map(this.consultants), milestones: map(this.milestones), documents: map(this.documents), caseCounter: this.caseCounter,
      enrollments: map(this.enrollments), enrollmentCounter: this.enrollmentCounter,
    };
  }

  public importRuntimeState(state: any): void {
    if (!state || typeof state !== 'object') return;
    const restoreMap = <T = any>(value: any): Map<string, T> => new Map(Array.isArray(value) ? value : []);
    this.users = restoreMap(state.users); this.usersByEmail = restoreMap(state.usersByEmail); this.usersByFirebaseUid = restoreMap(state.usersByFirebaseUid);
    this.auditLogs = Array.isArray(state.auditLogs) ? state.auditLogs : [];
    this.serviceCategories = restoreMap(state.serviceCategories); this.cases = restoreMap(state.cases); this.caseStatusHistory = Array.isArray(state.caseStatusHistory) ? state.caseStatusHistory : [];
    this.assignments = restoreMap(state.assignments); this.informationRequests = restoreMap(state.informationRequests); this.caseNotes = Array.isArray(state.caseNotes) ? state.caseNotes : [];
    this.caseMessages = Array.isArray(state.caseMessages) ? state.caseMessages : []; this.notifications = Array.isArray(state.notifications) ? state.notifications : [];
    this.taxCodes = restoreMap(state.taxCodes); this.boqs = restoreMap(state.boqs); this.boqRevisions = restoreMap(state.boqRevisions); this.boqItems = restoreMap(state.boqItems);
    this.boqAdjustments = restoreMap(state.boqAdjustments); this.boqApprovals = restoreMap(state.boqApprovals); this.quotations = restoreMap(state.quotations); this.quotationItems = restoreMap(state.quotationItems);
    this.serviceCommercialRules = restoreMap(state.serviceCommercialRules); this.workPackages = restoreMap(state.workPackages); this.freelancerOpportunities = restoreMap(state.freelancerOpportunities);
    this.freelancerBids = restoreMap(state.freelancerBids); this.freelancerProfiles = restoreMap(state.freelancerProfiles); this.referrals = restoreMap(state.referrals); this.partnerLedgers = restoreMap(state.partnerLedgers);
    this.events = Array.isArray(state.events) ? state.events : []; this.consultants = restoreMap(state.consultants); this.milestones = restoreMap(state.milestones); this.documents = restoreMap(state.documents);
    this.caseCounter = Number.isFinite(Number(state.caseCounter)) ? Number(state.caseCounter) : this.caseCounter;
    this.enrollments = restoreMap(state.enrollments); this.enrollmentCounter = Number.isFinite(Number(state.enrollmentCounter)) ? Number(state.enrollmentCounter) : this.enrollmentCounter;
  }

  // ==========================================
  // Telemetry & Metrics
  // ==========================================

  public getMetrics() {
    const allCases = this.getAllCases();
    const realCases = allCases.filter(c => !c.isDemo);
    const activeCount = allCases.filter(c => ['IN_PROGRESS', 'QUALIFICATION', 'QUALIFIED', 'MATCHING', 'CONSULTANT_ASSIGNED', 'SCOPE_DISCOVERY', 'PROPOSAL_PENDING', 'CUSTOMER_REVIEW'].includes(c.status)).length;

    return {
      totalCases: allCases.length,
      realCasesCount: realCases.length,
      activeCasesCount: activeCount,
      totalEvents: this.events.length,
      totalConsultants: this.consultants.size,
      totalUsers: this.users.size,
      totalAuditLogs: this.auditLogs.length,
      statusBreakdown: {
        new: allCases.filter(c => c.status === 'NEW').length,
        qualificationPending: allCases.filter(c => c.status === 'QUALIFICATION_PENDING' || c.status === 'QUALIFICATION').length,
        needsInformation: allCases.filter(c => c.status === 'NEEDS_INFORMATION').length,
        qualified: allCases.filter(c => c.status === 'QUALIFIED').length,
        coordinatorAssigned: allCases.filter(c => c.status === 'COORDINATOR_ASSIGNED').length,
        matching: allCases.filter(c => c.status === 'MATCHING' || c.status === 'SPECIALIST_MATCHING').length,
        consultantAssigned: allCases.filter(c => c.status === 'CONSULTANT_ASSIGNED' || c.status === 'ASSIGNED').length,
        scopeDiscovery: allCases.filter(c => c.status === 'SCOPE_DISCOVERY' || c.status === 'IN_PROGRESS').length,
        proposalPending: allCases.filter(c => c.status === 'PROPOSAL_PENDING').length,
        customerReview: allCases.filter(c => c.status === 'CUSTOMER_REVIEW' || c.status === 'UNDER_REVIEW').length,
        approved: allCases.filter(c => c.status === 'APPROVED').length,
        projectReady: allCases.filter(c => c.status === 'PROJECT_READY').length,
        completed: allCases.filter(c => c.status === 'COMPLETED' || c.status === 'CLOSED').length,
      },
      postgresConnectionStatus: 'NOT_CONFIGURED',
    };
  }

  // =========================================================================
  // Phase 9: Category-wise Outsourcing & Commercial Engine Implementation
  // =========================================================================

  private seedCommercialAndOutsourcingData() {
    // 1. Seed Service Commercial Rules
    const initialRules: ServiceCommercialRuleRecord[] = [
      {
        id: 'rule-solar-01',
        serviceSlug: 'solar-rooftop',
        serviceName: 'Commercial & Residential Solar Rooftop EPC',
        pillar: 'SURVEILLANCE_SITE_TECH',
        active: true,
        defaultWorkModel: 'EPC_PARTNER',
        allowedWorkModels: ['EPC_PARTNER', 'FREELANCER', 'CONSULTANT', 'HYBRID', 'VENDOR'],
        commercialModel: 'REVENUE_SHARE',
        marginType: 'PERCENTAGE',
        defaultMarginPercent: 15,
        minMarginPercent: 8,
        expressMultiplier: 1.2,
        defaultSplit: {
          providerSharePercent: 68,
          consultantSharePercent: 8,
          freelancerSharePercent: 4,
          referralSharePercent: 4,
          coordinatorSharePercent: 3,
          platformGrossMarginPercent: 13,
        },
        freelancerMaxPayPercent: 70,
        workPackageTemplates: [
          { packageKey: 'SOL-SURVEY', name: 'Site Shading & Rooftop Structural Survey', scope: 'Drone/physical survey, azimuth & tilt calibration, structural load test', defaultWorkModel: 'FREELANCER', defaultSkill: 'Solar Survey & Shadow Analysis', indicativeCostPercentage: 8, estimatedDays: 3 },
          { packageKey: 'SOL-DESIGN', name: 'PV System Sizing & SLD Electrical Design', scope: 'String sizing, inverter matching, AC/DC distribution single line diagrams', defaultWorkModel: 'CONSULTANT', defaultSkill: 'Solar Design & PVSyst Engineering', indicativeCostPercentage: 12, estimatedDays: 5 },
          { packageKey: 'SOL-SUPPLY', name: 'Tier-1 Tier Modules & Hybrid Inverter Supply', scope: 'Procurement of TOPCon/Mono-PERC panels and smart hybrid inverters', defaultWorkModel: 'VENDOR', defaultSkill: 'Solar Equipment Procurement', indicativeCostPercentage: 55, estimatedDays: 10 },
          { packageKey: 'SOL-EPC', name: 'Turnkey Mechanical Mounting & Commissioning', scope: 'Aluminium structure erection, earthing grid, lightning arrestors, net-meter sync', defaultWorkModel: 'EPC_PARTNER', defaultSkill: 'Solar EPC & Grid Synchronization', indicativeCostPercentage: 18, estimatedDays: 7 },
          { packageKey: 'SOL-DISCOM', name: 'DISCOM Net-Metering & National Subsidy Filing', scope: 'Municipal clearance, DISCOM inspection liaison, PM Surya Ghar dossier submission', defaultWorkModel: 'IN_HOUSE', defaultSkill: 'DISCOM Regulatory Liaison', indicativeCostPercentage: 7, estimatedDays: 14 }
        ],
        taxRatePercent: 18,
        version: 1,
        effectiveFrom: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'rule-gis-01',
        serviceSlug: 'land-gis-survey',
        serviceName: 'Geospatial Land GIS & Boundary Verification',
        pillar: 'LAND_PROPERTY',
        active: true,
        defaultWorkModel: 'FREELANCER',
        allowedWorkModels: ['FREELANCER', 'CONSULTANT', 'OUTSOURCE_AGENCY', 'HYBRID'],
        commercialModel: 'REVENUE_SHARE',
        marginType: 'PERCENTAGE',
        defaultMarginPercent: 20,
        minMarginPercent: 10,
        expressMultiplier: 1.25,
        defaultSplit: {
          providerSharePercent: 62,
          consultantSharePercent: 12,
          freelancerSharePercent: 5,
          referralSharePercent: 5,
          coordinatorSharePercent: 3,
          platformGrossMarginPercent: 13,
        },
        freelancerMaxPayPercent: 70,
        workPackageTemplates: [
          { packageKey: 'GIS-SURVEY', name: 'DGPS Boundary Geo-Tagging & Contour Survey', scope: 'High-precision DGPS boundary points and 0.5m contour interval mapping', defaultWorkModel: 'FREELANCER', defaultSkill: 'DGPS / Total Station Survey', indicativeCostPercentage: 35, estimatedDays: 4 },
          { packageKey: 'GIS-OVERLAY', name: 'Satellite & Masterplan Zoning Spatial Overlay', scope: 'Masterplan layer alignment, buffer zone check, road widening setback validation', defaultWorkModel: 'CONSULTANT', defaultSkill: 'GIS Spatial Analytics (QGIS/ArcGIS)', indicativeCostPercentage: 30, estimatedDays: 3 },
          { packageKey: 'GIS-REPORT', name: 'Final Technical Geospatial Dossier & KML Deliverable', scope: 'Vector boundary shapefiles, elevation heatmaps, terrain slope analysis report', defaultWorkModel: 'CONSULTANT', defaultSkill: 'Geospatial Reporting', indicativeCostPercentage: 35, estimatedDays: 2 }
        ],
        taxRatePercent: 18,
        version: 1,
        effectiveFrom: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'rule-boq-01',
        serviceSlug: 'detailed-boq-estimation',
        serviceName: 'Detailed BOQ & Quantity Estimation',
        pillar: 'CONSTRUCTION_SERVICES',
        active: true,
        defaultWorkModel: 'FREELANCER',
        allowedWorkModels: ['FREELANCER', 'CONSULTANT', 'IN_HOUSE', 'HYBRID'],
        commercialModel: 'REVENUE_SHARE',
        marginType: 'PERCENTAGE',
        defaultMarginPercent: 22,
        minMarginPercent: 12,
        expressMultiplier: 1.3,
        defaultSplit: {
          providerSharePercent: 60,
          consultantSharePercent: 14,
          freelancerSharePercent: 5,
          referralSharePercent: 5,
          coordinatorSharePercent: 3,
          platformGrossMarginPercent: 13,
        },
        freelancerMaxPayPercent: 70,
        workPackageTemplates: [
          { packageKey: 'BOQ-TAKEOFF', name: 'Architectural & Structural Quantity Takeoff', scope: 'Autodesk Revit / AutoCAD measurement extraction for concrete, steel, masonry', defaultWorkModel: 'FREELANCER', defaultSkill: 'Quantity Surveying (Civil/Structural)', indicativeCostPercentage: 45, estimatedDays: 5 },
          { packageKey: 'BOQ-PRICING', name: 'CPWD DSR & Real-time Material Rate Benchmarking', scope: 'Unit rate analysis based on regional market surveys and CPWD schedules', defaultWorkModel: 'FREELANCER', defaultSkill: 'Rate Analysis & CPWD DSR', indicativeCostPercentage: 30, estimatedDays: 3 },
          { packageKey: 'BOQ-VERIFY', name: 'Senior Consultant Peer Audit & Scope Signoff', scope: 'Sanity audit for missing contingency allowances and commercial rate verification', defaultWorkModel: 'CONSULTANT', defaultSkill: 'Senior Cost Engineering', indicativeCostPercentage: 25, estimatedDays: 2 }
        ],
        taxRatePercent: 18,
        version: 1,
        effectiveFrom: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'rule-property-01',
        serviceSlug: 'property-due-diligence',
        serviceName: 'Land & Property Legal & Technical Due Diligence',
        pillar: 'LAND_PROPERTY',
        active: true,
        defaultWorkModel: 'HYBRID',
        allowedWorkModels: ['HYBRID', 'CONSULTANT', 'OUTSOURCE_AGENCY'],
        commercialModel: 'REVENUE_SHARE',
        marginType: 'PERCENTAGE',
        defaultMarginPercent: 18,
        minMarginPercent: 10,
        expressMultiplier: 1.25,
        defaultSplit: {
          providerSharePercent: 64,
          consultantSharePercent: 12,
          freelancerSharePercent: 4,
          referralSharePercent: 5,
          coordinatorSharePercent: 3,
          platformGrossMarginPercent: 12,
        },
        freelancerMaxPayPercent: 65,
        workPackageTemplates: [
          { packageKey: 'PROP-SEARCH', name: '30-Year Sub-Registrar Encumbrance & Title Search', scope: 'Revenue records scrutiny, mutation extract, link document verification', defaultWorkModel: 'CONSULTANT', defaultSkill: 'Property Law & Revenue Search', indicativeCostPercentage: 40, estimatedDays: 6 },
          { packageKey: 'PROP-SITE', name: 'Physical Site Demarcation & Access Verification', scope: 'Right of way confirmation, high-tension wire easement, water body buffer audit', defaultWorkModel: 'FREELANCER', defaultSkill: 'Site Survey & Property Verification', indicativeCostPercentage: 30, estimatedDays: 3 },
          { packageKey: 'PROP-DOSSIER', name: 'Title Opinion Certificate & Risk Mitigation Memo', scope: 'Senior advocate vetted legal opinion and technical risk rating report', defaultWorkModel: 'CONSULTANT', defaultSkill: 'Senior Advocate Legal Opinion', indicativeCostPercentage: 30, estimatedDays: 3 }
        ],
        taxRatePercent: 18,
        version: 1,
        effectiveFrom: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'rule-water-01',
        serviceSlug: 'water-treatment-system',
        serviceName: 'Commercial Water Treatment & STP/ETP Solutions',
        pillar: 'CONSTRUCTION_SERVICES',
        active: true,
        defaultWorkModel: 'EPC_PARTNER',
        allowedWorkModels: ['EPC_PARTNER', 'VENDOR', 'CONSULTANT', 'HYBRID'],
        commercialModel: 'REVENUE_SHARE',
        marginType: 'PERCENTAGE',
        defaultMarginPercent: 16,
        minMarginPercent: 8,
        expressMultiplier: 1.2,
        defaultSplit: {
          providerSharePercent: 68,
          consultantSharePercent: 8,
          freelancerSharePercent: 3,
          referralSharePercent: 4,
          coordinatorSharePercent: 3,
          platformGrossMarginPercent: 14,
        },
        freelancerMaxPayPercent: 70,
        workPackageTemplates: [
          { packageKey: 'WAT-TEST', name: 'Raw Water 24-Parameter Lab Chemical Analysis', scope: 'TDS, hardness, heavy metals, microbial assay, BOD/COD baseline testing', defaultWorkModel: 'OUTSOURCE_AGENCY', defaultSkill: 'Environmental Water Testing Lab', indicativeCostPercentage: 15, estimatedDays: 4 },
          { packageKey: 'WAT-DESIGN', name: 'Process Flow Diagram & Media Sizing Engineering', scope: 'Filtration velocity, RO membrane recovery calculation, UV/Ozone dosing calculations', defaultWorkModel: 'CONSULTANT', defaultSkill: 'Water Treatment Process Engineering', indicativeCostPercentage: 20, estimatedDays: 5 },
          { packageKey: 'WAT-SUPPLY', name: 'FRP Vessels, High-Pressure Pumps & Membrane Supply', scope: 'Supply of industrial multiport valves, Grundfos pumps, Hydranautics membranes', defaultWorkModel: 'VENDOR', defaultSkill: 'Water Equipment Supply', indicativeCostPercentage: 45, estimatedDays: 8 },
          { packageKey: 'WAT-COMMISSION', name: 'Mechanical Piping, Electrical Panel & Commissioning', scope: 'Hydro-testing, flow balancing, electrical automation interlocks, operator training', defaultWorkModel: 'EPC_PARTNER', defaultSkill: 'STP/WTP Site Commissioning', indicativeCostPercentage: 20, estimatedDays: 6 }
        ],
        taxRatePercent: 18,
        version: 1,
        effectiveFrom: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'rule-surveillance-01',
        serviceSlug: 'site-cctv-iot-surveillance',
        serviceName: 'Smart Site Surveillance & AI Perimeter Monitoring',
        pillar: 'SURVEILLANCE_SITE_TECH',
        active: true,
        defaultWorkModel: 'VENDOR',
        allowedWorkModels: ['VENDOR', 'FREELANCER', 'EPC_PARTNER', 'IN_HOUSE'],
        commercialModel: 'REVENUE_SHARE',
        marginType: 'PERCENTAGE',
        defaultMarginPercent: 18,
        minMarginPercent: 10,
        expressMultiplier: 1.2,
        defaultSplit: {
          providerSharePercent: 66,
          consultantSharePercent: 8,
          freelancerSharePercent: 4,
          referralSharePercent: 4,
          coordinatorSharePercent: 3,
          platformGrossMarginPercent: 15,
        },
        freelancerMaxPayPercent: 70,
        workPackageTemplates: [
          { packageKey: 'CCTV-AUDIT', name: 'Perimeter Blind Spot Audit & Cable Routing Plan', scope: 'Optics focal length planning, lux level testing, wireless mesh backhaul design', defaultWorkModel: 'FREELANCER', defaultSkill: 'Security Systems Survey', indicativeCostPercentage: 15, estimatedDays: 2 },
          { packageKey: 'CCTV-SUPPLY', name: '4K IP Solar PTZ Cameras & Cloud NVR Hardware', scope: 'Supply of AI human/vehicle detection bullet cameras, 4G solar mast units', defaultWorkModel: 'VENDOR', defaultSkill: 'Surveillance Hardware Procurement', indicativeCostPercentage: 60, estimatedDays: 5 },
          { packageKey: 'CCTV-INSTALL', name: 'Pole Erection, Optical Splicing & Cloud AI Integration', scope: 'Physical installation, weather-proof junction boxes, mobile app stream live test', defaultWorkModel: 'FREELANCER', defaultSkill: 'CCTV & Network Integration', indicativeCostPercentage: 25, estimatedDays: 3 }
        ],
        taxRatePercent: 18,
        version: 1,
        effectiveFrom: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }
    ];

    initialRules.forEach(r => this.serviceCommercialRules.set(r.serviceSlug, r));

    // 2. Seed Freelancer Profiles
    const initialFreelancers: FreelancerProfileRecord[] = [
      {
        id: 'fl-01',
        userId: 'usr-fl-01',
        fullName: 'Arvind Mehta, PE',
        email: 'arvind.mehta@freelance.beg',
        city: 'Bengaluru',
        state: 'Karnataka',
        verifiedStatus: 'VERIFIED',
        tier: 'PREFERRED_PARTNER',
        skills: ['PVSyst Simulation', 'Solar Rooftop Design', 'Single Line Diagrams', 'AutoCAD Civil 3D'],
        categories: ['SOLAR', 'SITE_TECH', 'ELECTRICAL'],
        experienceYears: 9,
        workPreference: 'REMOTE',
        rating: 4.95,
        reviewCount: 42,
        responseTimeHours: 1.8,
        completedAssignments: 38,
        onTimeDeliveryPercent: 98,
        reworkRatePercent: 2,
        totalEarnings: 485000,
        pendingPayout: 32000,
        bio: 'Certified Solar Energy Professional with extensive utility-scale and commercial rooftop engineering background across South India.',
        certifications: ['NISE Certified Solar Professional', 'AutoCAD Electrical Professional', 'NABCEP Associate'],
        portfolioItems: [
          { title: '120kWp Commercial Rooftop at Peenya Industrial Area', category: 'SOLAR', description: 'Complete PV array design, cable sizing & DISCOM approval dossier.' },
          { title: '75kWp Hybrid Microgrid with Li-Ion Storage', category: 'SOLAR', description: 'Zero-export controller integration and shadow modeling.' }
        ],
        activeWorkPackagesCount: 2,
      },
      {
        id: 'fl-02',
        userId: 'usr-fl-02',
        fullName: 'Neha Agarwal, M.Tech',
        email: 'neha.agarwal@freelance.beg',
        city: 'Hyderabad',
        state: 'Telangana',
        verifiedStatus: 'VERIFIED',
        tier: 'PREFERRED_PARTNER',
        skills: ['QGIS', 'ArcGIS Pro', 'DGPS Surveying', 'Contour Mapping', 'LiDAR Point Cloud'],
        categories: ['GIS', 'LAND_SURVEY', 'DRONE_LIDAR'],
        experienceYears: 7,
        workPreference: 'HYBRID',
        rating: 4.92,
        reviewCount: 31,
        responseTimeHours: 2.1,
        completedAssignments: 29,
        onTimeDeliveryPercent: 96,
        reworkRatePercent: 3,
        totalEarnings: 360000,
        pendingPayout: 24500,
        bio: 'Geoinformatics specialist focusing on municipal master plan integration, land zoning buffers, and topographic catchment area calculations.',
        certifications: ['ESRI Certified GIS Associate', 'DGCA Licensed Drone Pilot Category Small'],
        portfolioItems: [
          { title: '50-Acre Masterplan Spatial Constraint Overlay', category: 'GIS', description: 'HMDA masterplan alignment with environmental green belt buffer zones.' },
          { title: 'LiDAR Cut & Fill Volumetric Earthwork Dossier', category: 'DRONE_LIDAR', description: 'High precision terrain model with 15cm grid resolution.' }
        ],
        activeWorkPackagesCount: 1,
      },
      {
        id: 'fl-03',
        userId: 'usr-fl-03',
        fullName: 'Sandeep Kulkarni, MRICS',
        email: 'sandeep.kulkarni@freelance.beg',
        city: 'Mumbai',
        state: 'Maharashtra',
        verifiedStatus: 'VERIFIED',
        tier: 'PREFERRED_PARTNER',
        skills: ['Detailed BOQ Preparation', 'CPWD DSR Schedule', 'Rate Analysis', 'Revit Quantity Takeoff'],
        categories: ['BOQ', 'ESTIMATION', 'CIVIL_CONSTRUCTION'],
        experienceYears: 12,
        workPreference: 'REMOTE',
        rating: 4.98,
        reviewCount: 56,
        responseTimeHours: 1.4,
        completedAssignments: 51,
        onTimeDeliveryPercent: 99,
        reworkRatePercent: 1,
        totalEarnings: 640000,
        pendingPayout: 48000,
        bio: 'Chartered Quantity Surveyor with 12+ years optimizing construction procurement and structural Bill of Quantities across residential and commercial towers.',
        certifications: ['RICS Registered Valuer & Quantity Surveyor', 'Certified Cost Professional (AACE)'],
        portfolioItems: [
          { title: 'G+14 Residential Tower Comprehensive BOQ', category: 'BOQ', description: 'Detailed itemized schedules with 420+ line items and rate analysis.' },
          { title: 'Luxury Villa Turnkey Finishing Estimates', category: 'ESTIMATION', description: 'High-end imported stone and acoustic MEP package itemization.' }
        ],
        activeWorkPackagesCount: 2,
      },
      {
        id: 'fl-04',
        userId: 'usr-fl-04',
        fullName: 'Farhan Zaidi',
        email: 'farhan.zaidi@freelance.beg',
        city: 'Bengaluru',
        state: 'Karnataka',
        verifiedStatus: 'VERIFIED',
        tier: 'VERIFIED_FREELANCER',
        skills: ['Hikvision/Dahua Enterprise CCTV', 'IoT Environmental Sensors', 'Optical Fiber Splicing', 'AI Edge Vision'],
        categories: ['SURVEILLANCE', 'SITE_TECH', 'IOT'],
        experienceYears: 6,
        workPreference: 'ON_SITE',
        rating: 4.88,
        reviewCount: 24,
        responseTimeHours: 2.8,
        completedAssignments: 22,
        onTimeDeliveryPercent: 95,
        reworkRatePercent: 4,
        totalEarnings: 280000,
        pendingPayout: 18000,
        bio: 'Site security network automation engineer deploying off-grid solar surveillance cameras, thermal sensors, and perimeter intrusion triggers.',
        certifications: ['CCNA Network Associate', 'Hikvision Certified Security Professional (HCSP)'],
        portfolioItems: [
          { title: 'Construction Site Perimeter Surveillance Hub', category: 'SURVEILLANCE', description: '16-camera cloud-connected PTZ network with real-time mobile app alerts.' }
        ],
        activeWorkPackagesCount: 1,
      }
    ];

    initialFreelancers.forEach(f => {
      this.freelancerProfiles.set(f.id, f);
      this.freelancerProfiles.set(f.userId, f);
    });

    // 3. Seed Work Packages
    const initialWorkPackages: WorkPackageRecord[] = [
      {
        id: 'wp-01',
        packageReference: 'BEG-WP-SOLAR-4092-01',
        caseId: 'case-4092',
        caseReference: 'BEG-4092',
        projectId: 'prj-4092',
        title: 'Site Shading & Structural Rooftop Simulation',
        serviceSlug: 'solar-rooftop',
        packageCategory: 'SOLAR_DESIGN',
        scopeDescription: 'Drone photogrammetry shading analysis, 3D rooftop tilt calculation, structural dead weight test for 60kWp commercial solar array.',
        deliverablesSummary: ['3D Shadow Simulation Map', 'Tilt & Azimuth Matrix', 'Structural Load Safety Memo'],
        budget: 45000,
        estimatedCost: 31500,
        sellPrice: 45000,
        marginAmount: 13500,
        marginPercentage: 30,
        marginStatus: 'HEALTHY',
        workModel: 'FREELANCER',
        commercialModel: 'REVENUE_SHARE',
        assignedPartyId: 'fl-01',
        assignedPartyName: 'Arvind Mehta, PE',
        assignedPartyRole: 'FREELANCER',
        assignedPartyEmail: 'arvind.mehta@freelance.beg',
        status: 'IN_PROGRESS',
        dueDate: '2026-09-08T18:00:00Z',
        startedAt: '2026-08-25T10:00:00Z',
        payoutBreakdown: {
          payableToExecutor: 31500,
          consultantReviewFee: 3600,
          platformRetainedMargin: 9900,
          tdsApplicable: 3150, // 10% TDS Section 194J
          netPayout: 28350,
          payoutStatus: 'PENDING_APPROVAL',
        },
        allowsBidding: false,
        bidsCount: 0,
        createdAt: '2026-08-25T09:30:00Z',
        updatedAt: '2026-08-27T14:00:00Z',
      },
      {
        id: 'wp-02',
        packageReference: 'BEG-WP-GIS-4088-01',
        caseId: 'case-4088',
        caseReference: 'BEG-4088',
        projectId: 'prj-4088',
        title: 'DGPS Boundary Geo-Tagging & Contour Mapping',
        serviceSlug: 'land-gis-survey',
        packageCategory: 'GIS_SURVEY',
        scopeDescription: 'High precision total station boundary marker verification, digital elevation model (DEM) and 0.5m contour interval generation.',
        deliverablesSummary: ['DGPS Geo-referenced KML File', '0.5m Contour AutoCAD Map', 'Slope Heatmap Report'],
        budget: 55000,
        estimatedCost: 38500,
        sellPrice: 55000,
        marginAmount: 16500,
        marginPercentage: 30,
        marginStatus: 'HEALTHY',
        workModel: 'FREELANCER',
        commercialModel: 'REVENUE_SHARE',
        assignedPartyId: 'fl-02',
        assignedPartyName: 'Neha Agarwal, M.Tech',
        assignedPartyRole: 'FREELANCER',
        assignedPartyEmail: 'neha.agarwal@freelance.beg',
        status: 'SUBMITTED',
        dueDate: '2026-08-30T18:00:00Z',
        startedAt: '2026-08-22T08:00:00Z',
        submittedAt: '2026-08-29T16:00:00Z',
        payoutBreakdown: {
          payableToExecutor: 38500,
          consultantReviewFee: 5500,
          platformRetainedMargin: 11000,
          tdsApplicable: 3850,
          netPayout: 34650,
          payoutStatus: 'PENDING_APPROVAL',
        },
        allowsBidding: false,
        bidsCount: 0,
        createdAt: '2026-08-22T07:30:00Z',
        updatedAt: '2026-08-29T16:00:00Z',
      },
      {
        id: 'wp-03',
        packageReference: 'BEG-WP-BOQ-4085-01',
        caseId: 'case-4085',
        caseReference: 'BEG-4085',
        projectId: 'prj-4085',
        title: 'Architectural & Civil Itemized BOQ Formulation',
        serviceSlug: 'detailed-boq-estimation',
        packageCategory: 'BOQ_PREPARATION',
        scopeDescription: 'Complete quantitative breakdown for substructure, RCC super-structure, waterproofing and masonry work with CPWD DSR rate calibration.',
        deliverablesSummary: ['Excel Itemized BOQ (65+ Items)', 'Quantity Takeoff Backup Sheet', 'Rate Analysis Benchmark'],
        budget: 60000,
        estimatedCost: 42000,
        sellPrice: 60000,
        marginAmount: 18000,
        marginPercentage: 30,
        marginStatus: 'HEALTHY',
        workModel: 'FREELANCER',
        commercialModel: 'REVENUE_SHARE',
        assignedPartyId: 'fl-03',
        assignedPartyName: 'Sandeep Kulkarni, MRICS',
        assignedPartyRole: 'FREELANCER',
        assignedPartyEmail: 'sandeep.kulkarni@freelance.beg',
        status: 'APPROVED',
        dueDate: '2026-08-20T18:00:00Z',
        startedAt: '2026-08-14T09:00:00Z',
        submittedAt: '2026-08-19T17:00:00Z',
        approvedAt: '2026-08-21T11:00:00Z',
        payoutBreakdown: {
          payableToExecutor: 42000,
          consultantReviewFee: 6000,
          platformRetainedMargin: 12000,
          tdsApplicable: 4200,
          netPayout: 37800,
          payoutStatus: 'APPROVED',
        },
        allowsBidding: false,
        bidsCount: 0,
        createdAt: '2026-08-14T08:00:00Z',
        updatedAt: '2026-08-21T11:00:00Z',
      },
      {
        id: 'wp-04',
        packageReference: 'BEG-WP-CCTV-4081-01',
        caseId: 'case-4081',
        caseReference: 'BEG-4081',
        projectId: 'prj-4081',
        title: 'Smart Site Surveillance Hub & Sensor Deployment',
        serviceSlug: 'site-cctv-iot-surveillance',
        packageCategory: 'SECURITY_AUTOMATION',
        scopeDescription: 'Installation of 8-point 4G Solar PTZ perimeter camera array with AI tripwire alarm and live cloud dashboard streaming.',
        deliverablesSummary: ['Hardware Commissioning Signoff', 'Cloud Stream Login Credentials', '24/7 AI Perimeter Rules Setup'],
        budget: 85000,
        estimatedCost: 59500,
        sellPrice: 85000,
        marginAmount: 25500,
        marginPercentage: 30,
        marginStatus: 'HEALTHY',
        workModel: 'VENDOR',
        commercialModel: 'REVENUE_SHARE',
        assignedPartyId: 'fl-04',
        assignedPartyName: 'Farhan Zaidi',
        assignedPartyRole: 'VENDOR',
        assignedPartyEmail: 'farhan.zaidi@freelance.beg',
        status: 'IN_PROGRESS',
        dueDate: '2026-09-05T18:00:00Z',
        startedAt: '2026-08-26T10:00:00Z',
        payoutBreakdown: {
          payableToExecutor: 59500,
          consultantReviewFee: 6800,
          platformRetainedMargin: 18700,
          tdsApplicable: 5950,
          netPayout: 53550,
          payoutStatus: 'PENDING_APPROVAL',
        },
        allowsBidding: true,
        bidsCount: 3,
        createdAt: '2026-08-20T10:00:00Z',
        updatedAt: '2026-08-26T10:00:00Z',
      }
    ];

    initialWorkPackages.forEach(wp => {
      this.workPackages.set(wp.id, wp);
      this.workPackages.set(wp.packageReference, wp);
    });

    // 4. Seed Freelancer Opportunities & Bids
    const initialOpportunities: FreelancerOpportunityRecord[] = [
      {
        id: 'opp-01',
        opportunityReference: 'BEG-OPP-2026-901',
        title: 'PVSyst 3D Shading Simulation for 120kWp Commercial Rooftop',
        serviceSlug: 'solar-rooftop',
        serviceName: 'Commercial Solar PV Design',
        pillar: 'SURVEILLANCE_SITE_TECH',
        category: 'SOLAR_DESIGN',
        scopeSummary: 'Conduct comprehensive near-shading simulation using PVSyst 7.4. Optimize string voltages and calculate annual specific yield (kWh/kWp).',
        skillsRequired: ['PVSyst', 'Solar Rooftop Design', 'AutoCAD Electrical'],
        location: 'Bengaluru / Remote',
        workType: 'REMOTE',
        budgetMin: 35000,
        budgetMax: 50000,
        urgency: 'EXPRESS',
        deadline: '2026-09-12T18:00:00Z',
        status: 'OPEN',
        applicationsCount: 3,
        createdAt: '2026-08-28T09:00:00Z',
      },
      {
        id: 'opp-02',
        opportunityReference: 'BEG-OPP-2026-902',
        title: 'LiDAR Point Cloud Cleanup & 3D Topographic Mesh Extraction',
        serviceSlug: 'drone-lidar-survey',
        serviceName: 'Drone & LiDAR Aerial Survey',
        pillar: 'SURVEILLANCE_SITE_TECH',
        category: 'DRONE_LIDAR',
        scopeSummary: 'Process raw LAS/LAZ point cloud dataset (120GB) to remove vegetation artifacts and generate clean ground surface DTM.',
        skillsRequired: ['CloudCompare', 'Global Mapper', 'LiDAR Data Processing', 'QGIS'],
        location: 'Hyderabad / Remote',
        workType: 'REMOTE',
        budgetMin: 40000,
        budgetMax: 60000,
        urgency: 'NORMAL',
        deadline: '2026-09-15T18:00:00Z',
        status: 'SHORTLISTING',
        applicationsCount: 4,
        createdAt: '2026-08-26T11:00:00Z',
      },
      {
        id: 'opp-03',
        opportunityReference: 'BEG-OPP-2026-903',
        title: 'MEP BIM Clash Detection & Coordination Model (Revit)',
        serviceSlug: 'detailed-boq-estimation',
        serviceName: 'MEP BIM Coordination',
        pillar: 'CONSTRUCTION_SERVICES',
        category: 'MEP_BIM',
        scopeSummary: 'Run automated Navisworks clash tests between HVAC ducts, plumbing pipes and structural beams for a 4-storey commercial office.',
        skillsRequired: ['Autodesk Revit', 'Navisworks Manage', 'MEP BIM Coordination'],
        location: 'Mumbai / Remote',
        workType: 'REMOTE',
        budgetMin: 50000,
        budgetMax: 75000,
        urgency: 'CRITICAL',
        deadline: '2026-09-10T18:00:00Z',
        status: 'OPEN',
        applicationsCount: 2,
        createdAt: '2026-08-29T14:00:00Z',
      }
    ];

    initialOpportunities.forEach(op => {
      this.freelancerOpportunities.set(op.id, op);
      this.freelancerOpportunities.set(op.opportunityReference, op);
    });

    const initialBids: FreelancerBidRecord[] = [
      {
        id: 'bid-01',
        opportunityId: 'opp-01',
        freelancerId: 'fl-01',
        freelancerName: 'Arvind Mehta, PE',
        freelancerRating: 4.95,
        freelancerExperienceYears: 9,
        freelancerCity: 'Bengaluru',
        bidAmount: 42000,
        deliveryDays: 4,
        proposedTimeline: 'Complete PVSyst report and SLD delivered in 4 calendar days with 1 revision included.',
        coverNote: 'I have completed 38 similar commercial solar PVSyst simulations on BuildEcoGroup with 98% on-time delivery.',
        portfolioUrl: 'https://buildecogroup.com/portfolio/arvind-solar',
        status: 'SHORTLISTED',
        createdAt: '2026-08-28T12:00:00Z',
      },
      {
        id: 'bid-02',
        opportunityId: 'opp-01',
        freelancerId: 'fl-temp-01',
        freelancerName: 'Karthik Ramanathan',
        freelancerRating: 4.75,
        freelancerExperienceYears: 5,
        freelancerCity: 'Chennai',
        bidAmount: 38000,
        deliveryDays: 5,
        proposedTimeline: 'Simulation run and losses breakdown ready in 5 business days.',
        coverNote: 'Experienced in HelioScope and PVSyst simulation for rooftop arrays.',
        status: 'SUBMITTED',
        createdAt: '2026-08-28T15:30:00Z',
      },
      {
        id: 'bid-03',
        opportunityId: 'opp-02',
        freelancerId: 'fl-02',
        freelancerName: 'Neha Agarwal, M.Tech',
        freelancerRating: 4.92,
        freelancerExperienceYears: 7,
        freelancerCity: 'Hyderabad',
        bidAmount: 48000,
        deliveryDays: 5,
        proposedTimeline: 'Ground classification, DTM extraction, and contour mapping delivered in 5 business days.',
        coverNote: 'Specialized in multi-sensor LiDAR processing using Global Mapper and CloudCompare.',
        portfolioUrl: 'https://buildecogroup.com/portfolio/neha-gis',
        status: 'ACCEPTED',
        createdAt: '2026-08-26T14:00:00Z',
      }
    ];

    initialBids.forEach(b => {
      const existing = this.freelancerBids.get(b.opportunityId) || [];
      existing.push(b);
      this.freelancerBids.set(b.opportunityId, existing);
    });

    // 5. Seed Referrals
    const initialReferrals: ReferralRecord[] = [
      {
        id: 'ref-01',
        referralCode: 'BEG-REF-8921',
        referrerId: 'fl-01',
        referrerName: 'Arvind Mehta, PE',
        referrerRole: 'FREELANCER',
        referredClientName: 'Zenith Logistics Park Pvt Ltd',
        referredClientCity: 'Bengaluru',
        serviceCategory: 'solar-rooftop',
        caseId: 'case-4092',
        caseReference: 'BEG-4092',
        status: 'COMMISSION_APPROVED',
        projectValue: 480000,
        commissionRatePercent: 5,
        commissionAmount: 24000,
        createdAt: '2026-08-10T10:00:00Z',
        updatedAt: '2026-08-25T16:00:00Z',
      },
      {
        id: 'ref-02',
        referralCode: 'BEG-REF-4402',
        referrerId: 'fl-03',
        referrerName: 'Sandeep Kulkarni, MRICS',
        referrerRole: 'FREELANCER',
        referredClientName: 'Godavari Infra Developers',
        referredClientCity: 'Pune',
        serviceCategory: 'detailed-boq-estimation',
        caseId: 'case-4085',
        caseReference: 'BEG-4085',
        status: 'COMMISSION_PAID',
        projectValue: 320000,
        commissionRatePercent: 5,
        commissionAmount: 16000,
        paidAt: '2026-08-24T12:00:00Z',
        createdAt: '2026-08-01T11:00:00Z',
        updatedAt: '2026-08-24T12:00:00Z',
      },
      {
        id: 'ref-03',
        referralCode: 'BEG-REF-1199',
        referrerId: 'usr-consultant-01',
        referrerName: 'Dr. Elena Rostova',
        referrerRole: 'CONSULTANT',
        referredClientName: 'Nirvana Eco Resorts',
        referredClientCity: 'Coorg',
        serviceCategory: 'water-treatment-system',
        status: 'QUALIFIED',
        projectValue: 650000,
        commissionRatePercent: 4,
        commissionAmount: 26000,
        createdAt: '2026-08-22T14:00:00Z',
        updatedAt: '2026-08-27T09:00:00Z',
      }
    ];

    initialReferrals.forEach(r => {
      this.referrals.set(r.id, r);
      this.referrals.set(r.referralCode, r);
    });

    // 6. Seed Partner Wallets & Ledgers
    const seedLedgerForPartner = (
      partnerId: string,
      partnerName: string,
      partnerRole: 'FREELANCER' | 'CONSULTANT' | 'AGENCY' | 'REFERRAL_PARTNER' | 'VENDOR',
      openingBalance: number,
      transactions: PartnerLedgerTransaction[]
    ) => {
      const pendingApproval = transactions.filter(t => t.status === 'PENDING_APPROVAL').reduce((acc, t) => acc + t.netAmount, 0);
      const payableAmount = transactions.filter(t => t.status === 'APPROVED').reduce((acc, t) => acc + t.netAmount, 0);
      const paidAmount = transactions.filter(t => t.status === 'SETTLED').reduce((acc, t) => acc + t.netAmount, 0);
      const totalTdsDeducted = transactions.reduce((acc, t) => acc + t.tdsDeducted, 0);
      const newEarnings = transactions.filter(t => t.type === 'EARNING' || t.type === 'COMMISSION' || t.type === 'REFERRAL').reduce((acc, t) => acc + t.grossAmount, 0);

      const record: PartnerWalletLedgerRecord = {
        partnerId,
        partnerName,
        partnerRole,
        openingBalance,
        newEarnings,
        pendingApproval,
        payableAmount,
        paidAmount,
        totalTdsDeducted,
        currency: 'INR',
        transactions,
      };

      this.partnerLedgers.set(partnerId, record);
    };

    seedLedgerForPartner('fl-01', 'Arvind Mehta, PE', 'FREELANCER', 0, [
      {
        id: 'tx-01',
        date: '2026-08-25T16:00:00Z',
        type: 'REFERRAL',
        referenceNo: 'BEG-REF-8921',
        description: 'Referral Bonus for Zenith Logistics Park (Solar Rooftop Case BEG-4092)',
        grossAmount: 24000,
        tdsDeducted: 2400, // 10% TDS Section 194H
        netAmount: 21600,
        status: 'APPROVED',
        notes: 'Approved by Platform Commercial Desk. Scheduled in next weekly payout run.',
      },
      {
        id: 'tx-02',
        date: '2026-08-27T14:00:00Z',
        type: 'EARNING',
        referenceNo: 'BEG-WP-SOLAR-4092-01',
        description: 'Work Package Milestone: Site Shading & Structural Simulation',
        grossAmount: 31500,
        tdsDeducted: 3150, // 10% TDS Section 194J
        netAmount: 28350,
        status: 'PENDING_APPROVAL',
        notes: 'Awaiting client deliverable review completion.',
      },
      {
        id: 'tx-03',
        date: '2026-08-10T12:00:00Z',
        type: 'PAYOUT',
        referenceNo: 'BEG-PAY-SETTLE-8812',
        description: 'Bank NEFT Transfer to HDFC Bank A/c ending 4409 (UTR: HDFC009871234)',
        grossAmount: 45000,
        tdsDeducted: 0,
        netAmount: 45000,
        status: 'SETTLED',
        notes: 'Successfully credited.',
      }
    ]);

    seedLedgerForPartner('fl-03', 'Sandeep Kulkarni, MRICS', 'FREELANCER', 0, [
      {
        id: 'tx-04',
        date: '2026-08-21T11:00:00Z',
        type: 'EARNING',
        referenceNo: 'BEG-WP-BOQ-4085-01',
        description: 'Milestone Deliverable Approved: Civil & Structural Detailed BOQ',
        grossAmount: 42000,
        tdsDeducted: 4200,
        netAmount: 37800,
        status: 'APPROVED',
        notes: 'Client approved final BOQ document. Ready for settlement.',
      },
      {
        id: 'tx-05',
        date: '2026-08-24T12:00:00Z',
        type: 'REFERRAL',
        referenceNo: 'BEG-REF-4402',
        description: 'Referral Bonus: Godavari Infra Developers',
        grossAmount: 16000,
        tdsDeducted: 1600,
        netAmount: 14400,
        status: 'SETTLED',
        notes: 'Settled via IMPS UTR: SBIN008237198.',
      }
    ]);
  }

  // -------------------------------------------------------------------------
  // Commercial Rule Management
  // -------------------------------------------------------------------------

  public getServiceCommercialRules(serviceSlug?: string): ServiceCommercialRuleRecord[] {
    if (serviceSlug) {
      const rule = this.serviceCommercialRules.get(serviceSlug);
      return rule ? [rule] : [];
    }
    return Array.from(this.serviceCommercialRules.values());
  }

  public updateServiceCommercialRule(
    input: UpdateServiceCommercialRuleInput,
    actorId: string
  ): ServiceCommercialRuleRecord {
    const existing = this.serviceCommercialRules.get(input.serviceSlug);
    if (!existing) {
      throw new Error(`Commercial rule not found for service slug: ${input.serviceSlug}`);
    }

    const updated: ServiceCommercialRuleRecord = {
      ...existing,
      defaultWorkModel: input.defaultWorkModel,
      commercialModel: input.commercialModel,
      marginType: input.marginType,
      defaultMarginPercent: input.defaultMarginPercent,
      fixedMarginAmount: input.fixedMarginAmount,
      minMarginPercent: input.minMarginPercent,
      expressMultiplier: input.expressMultiplier,
      defaultSplit: input.defaultSplit,
      freelancerMaxPayPercent: input.freelancerMaxPayPercent,
      taxRatePercent: input.taxRatePercent,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };

    this.serviceCommercialRules.set(input.serviceSlug, updated);

    this.recordSecurityAudit({
      actorId,
      action: 'UPDATE_SERVICE_COMMERCIAL_RULE',
      entityType: 'COMMERCIAL_RULE',
      entityId: updated.id,
      changes: {
        serviceSlug: input.serviceSlug,
        version: updated.version,
        defaultMarginPercent: input.defaultMarginPercent,
        split: input.defaultSplit,
      }
    });

    return updated;
  }

  // -------------------------------------------------------------------------
  // Multi-Party Revenue Sharing & Margin Simulation Engine
  // -------------------------------------------------------------------------

  public calculateMultiPartySplit(input: MultiPartySplitCalculationInput): MultiPartySplitCalculationResult {
    const rule = this.serviceCommercialRules.get(input.serviceSlug) || {
      id: 'rule-default',
      serviceSlug: input.serviceSlug,
      serviceName: input.serviceSlug.replace(/-/g, ' ').toUpperCase(),
      pillar: 'CONSTRUCTION_SERVICES' as PillarType,
      active: true,
      defaultWorkModel: (input.workModel || 'FREELANCER') as WorkModelType,
      allowedWorkModels: ['FREELANCER', 'CONSULTANT', 'EPC_PARTNER', 'IN_HOUSE'],
      commercialModel: 'REVENUE_SHARE' as CommercialModelType,
      marginType: 'PERCENTAGE' as MarginType,
      defaultMarginPercent: 18,
      minMarginPercent: 8,
      expressMultiplier: 1.25,
      defaultSplit: {
        providerSharePercent: 65,
        consultantSharePercent: 10,
        freelancerSharePercent: 5,
        referralSharePercent: 5,
        coordinatorSharePercent: 3,
        platformGrossMarginPercent: 12,
      },
      freelancerMaxPayPercent: 70,
      workPackageTemplates: [],
      taxRatePercent: 18,
      version: 1,
      effectiveFrom: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const grossQuote = Math.max(0, input.quoteAmount);
    const taxRate = rule.taxRatePercent || 18;
    // Client billed quote amount includes 18% GST in standard Indian commercial contracts or is base + GST
    const netBaseQuote = round2(grossQuote / (1 + taxRate / 100));
    const taxAmount = round2(grossQuote - netBaseQuote);

    // Evaluate Margin and Split percentages (allow user custom overrides for live simulation)
    const providerPct = input.customOverrides?.providerPercent ?? rule.defaultSplit.providerSharePercent;
    const consultantPct = input.customOverrides?.consultantPercent ?? rule.defaultSplit.consultantSharePercent;
    const freelancerPct = input.customOverrides?.freelancerPercent ?? rule.defaultSplit.freelancerSharePercent;
    const referralPct = input.customOverrides?.referralPercent ?? rule.defaultSplit.referralSharePercent;
    const coordinatorPct = input.customOverrides?.coordinatorPercent ?? rule.defaultSplit.coordinatorSharePercent;
    
    // Platform Gross Margin percentage is calculated from remaining or configured margin
    const platformGrossMarginPct = input.customOverrides?.marginPercent ?? rule.defaultSplit.platformGrossMarginPercent;

    const providerPayable = round2((netBaseQuote * providerPct) / 100);
    const consultantCommission = round2((netBaseQuote * consultantPct) / 100);
    const freelancerPayable = round2((netBaseQuote * freelancerPct) / 100);
    const referralShare = round2((netBaseQuote * referralPct) / 100);
    const coordinatorFee = round2((netBaseQuote * coordinatorPct) / 100);
    
    const platformGrossMargin = round2(
      netBaseQuote - (providerPayable + consultantCommission + freelancerPayable + referralShare + coordinatorFee)
    );
    const effectivePlatformMarginPct = netBaseQuote > 0 ? round2((platformGrossMargin / netBaseQuote) * 100) : 0;

    // Platform Direct Operational Overhead (Payment Gateway 2% + Verification/Compliance 2%)
    const platformDirectCosts = round2(netBaseQuote * 0.04);
    const platformNetMargin = round2(platformGrossMargin - platformDirectCosts);
    const platformNetMarginPct = netBaseQuote > 0 ? round2((platformNetMargin / netBaseQuote) * 100) : 0;

    // Margin Protection Health Check
    let marginStatus: MarginHealthStatus = 'HEALTHY';
    let marginWarningMessage: string | undefined = undefined;

    if (platformGrossMargin < 0) {
      marginStatus = 'NEGATIVE_MARGIN_ALERT';
      marginWarningMessage = `CRITICAL ALERT: Total payouts (₹${formatINR(netBaseQuote - platformGrossMargin)}) exceed net project billing (₹${formatINR(netBaseQuote)}). Negative margin will cause financial loss.`;
    } else if (effectivePlatformMarginPct < rule.minMarginPercent) {
      marginStatus = 'LOW_MARGIN_WARNING';
      marginWarningMessage = `WARNING: Projected gross margin (${effectivePlatformMarginPct}%) is below the minimum mandatory platform protection threshold (${rule.minMarginPercent}%). Special commercial approval required.`;
    }

    return {
      serviceSlug: rule.serviceSlug,
      serviceName: rule.serviceName,
      workModel: input.workModel || rule.defaultWorkModel,
      grossCustomerQuote: grossQuote,
      taxAmount,
      netCustomerQuoteBeforeTax: netBaseQuote,
      providerPayable,
      providerPercent: providerPct,
      consultantCommission,
      consultantPercent: consultantPct,
      freelancerPayable,
      freelancerPercent: freelancerPct,
      referralShare,
      referralPercent: referralPct,
      coordinatorFee,
      coordinatorPercent: coordinatorPct,
      platformGrossMargin,
      platformGrossMarginPercent: effectivePlatformMarginPct,
      estimatedPlatformDirectCosts: platformDirectCosts,
      platformNetMargin,
      platformNetMarginPercent: platformNetMarginPct,
      marginStatus,
      marginWarningMessage,
      effectiveRuleVersion: rule.version,
    };
  }

  // -------------------------------------------------------------------------
  // Work Package Management
  // -------------------------------------------------------------------------

  public getWorkPackages(params?: {
    caseId?: string;
    projectId?: string;
    status?: string;
    serviceSlug?: string;
    assignedPartyId?: string;
  }): WorkPackageRecord[] {
    let list = Array.from(new Set(this.workPackages.values()));

    if (params?.caseId) {
      list = list.filter(w => w.caseId === params.caseId || w.caseReference === params.caseId);
    }
    if (params?.projectId) {
      list = list.filter(w => w.projectId === params.projectId);
    }
    if (params?.status && params.status !== 'ALL') {
      list = list.filter(w => w.status === params.status);
    }
    if (params?.serviceSlug && params.serviceSlug !== 'ALL') {
      list = list.filter(w => w.serviceSlug === params.serviceSlug);
    }
    if (params?.assignedPartyId) {
      list = list.filter(w => w.assignedPartyId === params.assignedPartyId);
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getWorkPackageById(id: string): WorkPackageRecord | null {
    return this.workPackages.get(id) || null;
  }

  public createWorkPackage(input: CreateWorkPackageInput, actorId: string): WorkPackageRecord {
    const caseRecord = this.getCaseById(input.caseId);
    const caseRef = caseRecord ? caseRecord.caseReference : input.caseId;
    const caseId = caseRecord ? caseRecord.id : input.caseId;

    const id = `wp-${crypto.randomUUID().slice(0, 8)}`;
    const packageRef = `BEG-WP-${input.serviceSlug.toUpperCase().slice(0, 5)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const marginAmount = input.sellPrice - input.estimatedCost;
    const marginPct = input.sellPrice > 0 ? round2((marginAmount / input.sellPrice) * 100) : 0;
    
    let marginStatus: MarginHealthStatus = 'HEALTHY';
    if (marginAmount < 0) marginStatus = 'NEGATIVE_MARGIN_ALERT';
    else if (marginPct < 10) marginStatus = 'LOW_MARGIN_WARNING';

    const payableToExecutor = round2(input.estimatedCost * 0.88);
    const consultantFee = round2(input.estimatedCost * 0.12);
    const platformRetained = round2(marginAmount);
    const tdsApplicable = round2(payableToExecutor * 0.10);
    const netPayout = round2(payableToExecutor - tdsApplicable);

    const record: WorkPackageRecord = {
      id,
      packageReference: packageRef,
      caseId,
      caseReference: caseRef,
      projectId: (caseRecord as any)?.projectId || (input as any)?.projectId,
      title: input.title,
      serviceSlug: input.serviceSlug,
      packageCategory: input.packageCategory || 'GENERAL',
      scopeDescription: input.scopeDescription,
      deliverablesSummary: input.deliverablesSummary || [],
      budget: input.budget,
      estimatedCost: input.estimatedCost,
      sellPrice: input.sellPrice,
      marginAmount,
      marginPercentage: marginPct,
      marginStatus,
      workModel: input.workModel,
      commercialModel: input.commercialModel,
      assignedPartyId: input.assignedPartyId,
      assignedPartyName: input.assignedPartyName,
      assignedPartyRole: input.assignedPartyRole,
      status: input.assignedPartyId ? 'ASSIGNED' : 'PENDING_ASSIGNMENT',
      dueDate: input.dueDate,
      payoutBreakdown: {
        payableToExecutor,
        consultantReviewFee: consultantFee,
        platformRetainedMargin: platformRetained,
        tdsApplicable,
        netPayout,
        payoutStatus: 'PENDING_APPROVAL',
      },
      allowsBidding: input.allowsBidding ?? false,
      bidsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.workPackages.set(id, record);
    this.workPackages.set(packageRef, record);

    this.recordSecurityAudit({
      actorId,
      action: 'CREATE_WORK_PACKAGE',
      entityType: 'WORK_PACKAGE',
      entityId: id,
      changes: {
        packageReference: packageRef,
        caseReference: caseRef,
        sellPrice: input.sellPrice,
        estimatedCost: input.estimatedCost,
        marginPercentage: marginPct,
      }
    });

    return record;
  }

  public updateWorkPackageStatus(
    id: string,
    status: WorkPackageStatus,
    notes?: string,
    actorId?: string
  ): WorkPackageRecord {
    const existing = this.workPackages.get(id);
    if (!existing) {
      throw new Error(`Work package not found: ${id}`);
    }

    const updated: WorkPackageRecord = {
      ...existing,
      status,
      startedAt: status === 'IN_PROGRESS' && !existing.startedAt ? new Date().toISOString() : existing.startedAt,
      submittedAt: status === 'SUBMITTED' ? new Date().toISOString() : existing.submittedAt,
      approvedAt: status === 'APPROVED' ? new Date().toISOString() : existing.approvedAt,
      completedAt: status === 'COMPLETED' ? new Date().toISOString() : existing.completedAt,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'APPROVED') {
      updated.payoutBreakdown.payoutStatus = 'APPROVED';
      // Automatically record partner earning in ledger if assigned
      if (updated.assignedPartyId) {
        this.recordPartnerLedgerTransaction(updated.assignedPartyId, {
          type: 'EARNING',
          referenceNo: updated.packageReference,
          description: `Work Package Approved: ${updated.title}`,
          grossAmount: updated.payoutBreakdown.payableToExecutor,
          tdsDeducted: updated.payoutBreakdown.tdsApplicable,
          netAmount: updated.payoutBreakdown.netPayout,
          status: 'APPROVED',
          notes: notes || 'Approved by project supervisor.',
        });
      }
    }

    this.workPackages.set(id, updated);
    this.workPackages.set(updated.packageReference, updated);

    if (actorId) {
      this.recordSecurityAudit({
        actorId,
        action: 'UPDATE_WORK_PACKAGE_STATUS',
        entityType: 'WORK_PACKAGE',
        entityId: id,
        changes: { oldStatus: existing.status, newStatus: status, notes }
      });
    }

    return updated;
  }

  public assignWorkPackage(
    id: string,
    party: { partyId: string; partyName: string; partyRole: any; email?: string },
    actorId: string
  ): WorkPackageRecord {
    const existing = this.workPackages.get(id);
    if (!existing) throw new Error(`Work package not found: ${id}`);

    const updated: WorkPackageRecord = {
      ...existing,
      assignedPartyId: party.partyId,
      assignedPartyName: party.partyName,
      assignedPartyRole: party.partyRole,
      assignedPartyEmail: party.email,
      status: 'ASSIGNED',
      updatedAt: new Date().toISOString(),
    };

    this.workPackages.set(id, updated);
    this.workPackages.set(updated.packageReference, updated);

    this.recordSecurityAudit({
      actorId,
      action: 'ASSIGN_WORK_PACKAGE',
      entityType: 'WORK_PACKAGE',
      entityId: id,
      changes: { assignedParty: party }
    });

    return updated;
  }

  public updateWorkPackagePayoutStatus(
    id: string,
    payoutStatus: 'PENDING_APPROVAL' | 'APPROVED' | 'HELD' | 'PROCESSED' | 'PAID',
    notes?: string,
    actorId?: string
  ): WorkPackageRecord {
    const existing = this.workPackages.get(id);
    if (!existing) throw new Error(`Work package not found: ${id}`);

    existing.payoutBreakdown.payoutStatus = payoutStatus;
    existing.updatedAt = new Date().toISOString();

    this.workPackages.set(id, existing);
    this.workPackages.set(existing.packageReference, existing);

    if (actorId) {
      this.recordSecurityAudit({
        actorId,
        action: 'UPDATE_WORK_PACKAGE_PAYOUT_STATUS',
        entityType: 'WORK_PACKAGE',
        entityId: id,
        changes: { payoutStatus, notes }
      });
    }

    return existing;
  }

  // -------------------------------------------------------------------------
  // Freelancer Marketplace & Bids
  // -------------------------------------------------------------------------

  public getFreelancerOpportunities(params?: {
    service?: string;
    status?: string;
    search?: string;
  }): FreelancerOpportunityRecord[] {
    let list = Array.from(new Set(this.freelancerOpportunities.values()));

    if (params?.service && params.service !== 'ALL') {
      list = list.filter(o => o.serviceSlug === params.service);
    }
    if (params?.status && params.status !== 'ALL') {
      list = list.filter(o => o.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(o => 
        o.title.toLowerCase().includes(q) ||
        o.skillsRequired.some(s => s.toLowerCase().includes(q)) ||
        o.opportunityReference.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getFreelancerOpportunityById(id: string): {
    opportunity: FreelancerOpportunityRecord;
    bids: FreelancerBidRecord[];
  } | null {
    const opp = this.freelancerOpportunities.get(id);
    if (!opp) return null;
    const bids = this.freelancerBids.get(opp.id) || [];
    return { opportunity: opp, bids };
  }

  public submitFreelancerBid(
    input: SubmitFreelancerBidInput,
    freelancer: { id: string; name: string; city?: string }
  ): FreelancerBidRecord {
    const opp = this.freelancerOpportunities.get(input.opportunityId);
    if (!opp) throw new Error(`Opportunity not found: ${input.opportunityId}`);

    const existingBids = this.freelancerBids.get(opp.id) || [];
    const alreadyApplied = existingBids.some(b => b.freelancerId === freelancer.id);
    if (alreadyApplied) throw new Error(`You have already submitted a proposal for this opportunity.`);

    const profile = this.freelancerProfiles.get(freelancer.id);

    const bid: FreelancerBidRecord = {
      id: `bid-${crypto.randomUUID().slice(0, 8)}`,
      opportunityId: opp.id,
      freelancerId: freelancer.id,
      freelancerName: freelancer.name,
      freelancerRating: profile?.rating || 4.9,
      freelancerExperienceYears: profile?.experienceYears || 5,
      freelancerCity: freelancer.city || profile?.city || 'Bengaluru',
      bidAmount: input.bidAmount,
      deliveryDays: input.deliveryDays,
      proposedTimeline: input.proposedTimeline,
      coverNote: input.coverNote,
      portfolioUrl: input.portfolioUrl,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    };

    existingBids.push(bid);
    this.freelancerBids.set(opp.id, existingBids);

    opp.applicationsCount = existingBids.length;
    this.freelancerOpportunities.set(opp.id, opp);

    return bid;
  }

  public updateBidStatus(
    opportunityId: string,
    bidId: string,
    status: 'SHORTLISTED' | 'ACCEPTED' | 'DECLINED',
    actorId: string
  ): { bid: FreelancerBidRecord; opportunity: FreelancerOpportunityRecord } {
    const opp = this.freelancerOpportunities.get(opportunityId);
    if (!opp) throw new Error(`Opportunity not found: ${opportunityId}`);

    const bids = this.freelancerBids.get(opp.id) || [];
    const bidIndex = bids.findIndex(b => b.id === bidId);
    if (bidIndex === -1) throw new Error(`Bid not found: ${bidId}`);

    bids[bidIndex].status = status;
    this.freelancerBids.set(opp.id, bids);

    if (status === 'ACCEPTED') {
      opp.status = 'AWARDED';
      this.freelancerOpportunities.set(opp.id, opp);

      // If tied to a work package, auto-assign
      if (opp.workPackageId) {
        this.assignWorkPackage(
          opp.workPackageId,
          {
            partyId: bids[bidIndex].freelancerId,
            partyName: bids[bidIndex].freelancerName,
            partyRole: 'FREELANCER',
          },
          actorId
        );
      }
    }

    this.recordSecurityAudit({
      actorId,
      action: 'UPDATE_BID_STATUS',
      entityType: 'FREELANCER_BID',
      entityId: bidId,
      changes: { status, opportunityId }
    });

    return { bid: bids[bidIndex], opportunity: opp };
  }

  public getFreelancerProfiles(params?: { category?: string; verifiedOnly?: boolean }): FreelancerProfileRecord[] {
    let list = Array.from(new Set(this.freelancerProfiles.values()));

    if (params?.category && params.category !== 'ALL') {
      list = list.filter(f => f.categories.includes(params.category!));
    }
    if (params?.verifiedOnly) {
      list = list.filter(f => f.verifiedStatus === 'VERIFIED');
    }

    return list.sort((a, b) => b.rating - a.rating);
  }

  public getFreelancerProfileById(id: string): FreelancerProfileRecord | null {
    return this.freelancerProfiles.get(id) || null;
  }

  // -------------------------------------------------------------------------
  // Referrals Engine
  // -------------------------------------------------------------------------

  public getReferrals(params?: { referrerId?: string; status?: string }): ReferralRecord[] {
    let list = Array.from(new Set(this.referrals.values()));

    if (params?.referrerId) {
      list = list.filter(r => r.referrerId === params.referrerId);
    }
    if (params?.status && params.status !== 'ALL') {
      list = list.filter(r => r.status === params.status);
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createReferral(
    input: CreateReferralInput,
    referrer: { id: string; name: string; role: any }
  ): ReferralRecord {
    const id = `ref-${crypto.randomUUID().slice(0, 8)}`;
    const referralCode = `BEG-REF-${Math.floor(1000 + Math.random() * 9000)}`;

    const rule = this.serviceCommercialRules.get(input.serviceCategory);
    const commissionRate = rule?.defaultSplit.referralSharePercent || 5;
    const projectVal = input.projectValueEstimate || 100000;
    const commissionAmount = round2((projectVal * commissionRate) / 100);

    const record: ReferralRecord = {
      id,
      referralCode,
      referrerId: referrer.id,
      referrerName: referrer.name,
      referrerRole: referrer.role,
      referredClientName: input.referredClientName,
      referredClientCity: input.referredClientCity,
      serviceCategory: input.serviceCategory,
      status: 'ENQUIRY_RECEIVED',
      projectValue: projectVal,
      commissionRatePercent: commissionRate,
      commissionAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.referrals.set(id, record);
    this.referrals.set(referralCode, record);

    return record;
  }

  public updateReferralStatus(
    id: string,
    status: ReferralRecord['status'],
    actorId: string
  ): ReferralRecord {
    const existing = this.referrals.get(id);
    if (!existing) throw new Error(`Referral not found: ${id}`);

    existing.status = status;
    existing.updatedAt = new Date().toISOString();
    if (status === 'COMMISSION_PAID') {
      existing.paidAt = new Date().toISOString();
    }

    this.referrals.set(id, existing);
    this.referrals.set(existing.referralCode, existing);

    // If commission approved, add to referrer wallet
    if (status === 'COMMISSION_APPROVED') {
      this.recordPartnerLedgerTransaction(existing.referrerId, {
        type: 'REFERRAL',
        referenceNo: existing.referralCode,
        description: `Referral Commission for ${existing.referredClientName} (${existing.serviceCategory})`,
        grossAmount: existing.commissionAmount,
        tdsDeducted: round2(existing.commissionAmount * 0.10),
        netAmount: round2(existing.commissionAmount * 0.90),
        status: 'APPROVED',
        notes: 'Commercial qualification milestone achieved.',
      });
    }

    this.recordSecurityAudit({
      actorId,
      action: 'UPDATE_REFERRAL_STATUS',
      entityType: 'REFERRAL',
      entityId: id,
      changes: { status }
    });

    return existing;
  }

  // -------------------------------------------------------------------------
  // Partner Wallet & Ledger
  // -------------------------------------------------------------------------

  public getPartnerLedger(partnerId: string): PartnerWalletLedgerRecord {
    let ledger = this.partnerLedgers.get(partnerId);
    if (!ledger) {
      const profile = this.freelancerProfiles.get(partnerId);
      const user = this.users.get(partnerId);
      ledger = {
        partnerId,
        partnerName: profile?.fullName || user?.fullName || 'Partner Account',
        partnerRole: (profile ? 'FREELANCER' : user?.role === 'CONSULTANT' ? 'CONSULTANT' : 'PARTNER') as any,
        openingBalance: 0,
        newEarnings: 0,
        pendingApproval: 0,
        payableAmount: 0,
        paidAmount: 0,
        totalTdsDeducted: 0,
        currency: 'INR',
        transactions: [],
      };
      this.partnerLedgers.set(partnerId, ledger);
    }
    return ledger;
  }

  public recordPartnerLedgerTransaction(
    partnerId: string,
    tx: Omit<PartnerLedgerTransaction, 'id' | 'date'>
  ): PartnerWalletLedgerRecord {
    const ledger = this.getPartnerLedger(partnerId);

    const newTx: PartnerLedgerTransaction = {
      ...tx,
      id: `tx-${crypto.randomUUID().slice(0, 8)}`,
      date: new Date().toISOString(),
    };

    ledger.transactions.unshift(newTx);
    ledger.pendingApproval = ledger.transactions.filter(t => t.status === 'PENDING_APPROVAL').reduce((acc, t) => acc + t.netAmount, 0);
    ledger.payableAmount = ledger.transactions.filter(t => t.status === 'APPROVED').reduce((acc, t) => acc + t.netAmount, 0);
    ledger.paidAmount = ledger.transactions.filter(t => t.status === 'SETTLED').reduce((acc, t) => acc + t.netAmount, 0);
    ledger.totalTdsDeducted = ledger.transactions.reduce((acc, t) => acc + t.tdsDeducted, 0);
    ledger.newEarnings = ledger.transactions.filter(t => t.type === 'EARNING' || t.type === 'COMMISSION' || t.type === 'REFERRAL').reduce((acc, t) => acc + t.grossAmount, 0);

    this.partnerLedgers.set(partnerId, ledger);
    return ledger;
  }

  // -------------------------------------------------------------------------
  // Commercial & Financial Analytics Aggregation
  // -------------------------------------------------------------------------

  public getCommercialAnalytics(): CommercialAnalyticsOverviewRecord {
    const workPackages = Array.from(new Set(this.workPackages.values()));
    const referrals = Array.from(new Set(this.referrals.values()));
    const freelancers = Array.from(new Set(this.freelancerProfiles.values()));

    const totalWorkValue = workPackages.reduce((sum, wp) => sum + wp.sellPrice, 0) + 1450000;
    const outsourcedValue = workPackages.reduce((sum, wp) => sum + wp.estimatedCost, 0) + 980000;
    const freelancerValue = workPackages.filter(wp => wp.workModel === 'FREELANCER').reduce((sum, wp) => sum + wp.payoutBreakdown.payableToExecutor, 0) + 420000;
    const consultantPayoutsTotal = workPackages.reduce((sum, wp) => sum + wp.payoutBreakdown.consultantReviewFee, 0) + 180000;
    const vendorPayoutsTotal = workPackages.filter(wp => wp.workModel === 'VENDOR' || wp.workModel === 'EPC_PARTNER').reduce((sum, wp) => sum + wp.payoutBreakdown.payableToExecutor, 0) + 520000;
    
    const commissionsGeneratedTotal = referrals.reduce((sum, r) => sum + r.commissionAmount, 0) + 66000;
    const commissionsPaidTotal = referrals.filter(r => r.status === 'COMMISSION_PAID').reduce((sum, r) => sum + r.commissionAmount, 0) + 16000;
    const referralCostsTotal = commissionsGeneratedTotal;

    const platformGrossMarginTotal = round2(totalWorkValue - outsourcedValue);
    const platformNetMarginTotal = round2(platformGrossMarginTotal - (totalWorkValue * 0.04));
    const averageMarginPercentage = totalWorkValue > 0 ? round2((platformGrossMarginTotal / totalWorkValue) * 100) : 18;

    const categoryPerformance = [
      {
        serviceSlug: 'solar-rooftop',
        serviceName: 'Solar Rooftop & Microgrid EPC',
        pillar: 'SURVEILLANCE_SITE_TECH' as PillarType,
        enquiriesCount: 48,
        convertedCount: 22,
        conversionRatePercent: 45.8,
        totalRevenue: 680000,
        outsourceCost: 476000,
        grossMargin: 204000,
        marginPercent: 30.0,
        avgCompletionDays: 14,
        complaintRatePercent: 1.2,
      },
      {
        serviceSlug: 'land-gis-survey',
        serviceName: 'Land GIS & Contour Survey',
        pillar: 'LAND_PROPERTY' as PillarType,
        enquiriesCount: 64,
        convertedCount: 38,
        conversionRatePercent: 59.3,
        totalRevenue: 490000,
        outsourceCost: 343000,
        grossMargin: 147000,
        marginPercent: 30.0,
        avgCompletionDays: 5,
        complaintRatePercent: 0.8,
      },
      {
        serviceSlug: 'detailed-boq-estimation',
        serviceName: 'Detailed BOQ & Rate Estimation',
        pillar: 'CONSTRUCTION_SERVICES' as PillarType,
        enquiriesCount: 82,
        convertedCount: 54,
        conversionRatePercent: 65.8,
        totalRevenue: 560000,
        outsourceCost: 392000,
        grossMargin: 168000,
        marginPercent: 30.0,
        avgCompletionDays: 6,
        complaintRatePercent: 0.5,
      },
      {
        serviceSlug: 'water-treatment-system',
        serviceName: 'Commercial Water Treatment & STP',
        pillar: 'CONSTRUCTION_SERVICES' as PillarType,
        enquiriesCount: 36,
        convertedCount: 16,
        conversionRatePercent: 44.4,
        totalRevenue: 420000,
        outsourceCost: 294000,
        grossMargin: 126000,
        marginPercent: 30.0,
        avgCompletionDays: 18,
        complaintRatePercent: 2.1,
      },
      {
        serviceSlug: 'site-cctv-iot-surveillance',
        serviceName: 'Smart Site CCTV & Perimeter Tech',
        pillar: 'SURVEILLANCE_SITE_TECH' as PillarType,
        enquiriesCount: 52,
        convertedCount: 29,
        conversionRatePercent: 55.7,
        totalRevenue: 380000,
        outsourceCost: 266000,
        grossMargin: 114000,
        marginPercent: 30.0,
        avgCompletionDays: 4,
        complaintRatePercent: 0.9,
      }
    ];

    const avgAcceptance = freelancers.length > 0
      ? round2(freelancers.reduce((s, f) => s + f.onTimeDeliveryPercent, 0) / freelancers.length)
      : 96;

    return {
      totalWorkValue,
      outsourcedValue,
      freelancerValue,
      consultantPayoutsTotal,
      vendorPayoutsTotal,
      commissionsGeneratedTotal,
      commissionsPaidTotal,
      referralCostsTotal,
      platformGrossMarginTotal,
      platformNetMarginTotal,
      averageMarginPercentage,
      categoryPerformance,
      freelancerNetworkStats: {
        totalFreelancers: freelancers.length,
        activeWorkPackages: workPackages.filter(wp => wp.status === 'IN_PROGRESS' || wp.status === 'ASSIGNED').length,
        avgAcceptanceRatePercent: 94.2,
        avgOnTimeDeliveryPercent: avgAcceptance,
        avgReworkRatePercent: 2.3,
        topPerformersCount: freelancers.filter(f => f.tier === 'PREFERRED_PARTNER').length,
      }
    };
  }
}

export const store = new DataStore();
