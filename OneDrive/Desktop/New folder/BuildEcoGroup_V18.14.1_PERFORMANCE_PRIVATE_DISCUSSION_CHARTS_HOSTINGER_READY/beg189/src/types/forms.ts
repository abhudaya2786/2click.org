// Types for BuildEcoGroup Dynamic Forms & Universal Request Tracking Architecture

export type FormType =
  | 'CONSULTANT_QUERY'
  | 'PROVIDER_ENROLLMENT'
  | 'LAND_REGISTRATION'
  | 'CONSTRUCTION_REQ'
  | 'BOQ_ESTIMATION'
  | 'VENDOR_RFQ'
  | 'PROPERTY_LISTING'
  | 'SOLAR_ASSESSMENT'
  | 'WATER_TREATMENT'
  | 'MAINTENANCE_SERVICE'
  | 'GENERAL_REQUEST';

export type QueryCategory =
  | 'LAND'
  | 'CONSTRUCTION'
  | 'PROPERTY'
  | 'BOQ'
  | 'SOLAR'
  | 'WATER'
  | 'WASTE'
  | 'ELECTRICAL'
  | 'PLUMBING'
  | 'INTERIOR'
  | 'MAINTENANCE'
  | 'TECHNOLOGY'
  | 'MATERIAL_PROCUREMENT'
  | 'VASTU'
  | 'LABOUR'
  | 'EQUIPMENT';

export type EnrollmentRole =
  | 'PROFESSIONAL'
  | 'SKILLED_PERSON'
  | 'SERVICE_PROVIDER'
  | 'CONTRACTOR'
  | 'VENDOR_SUPPLIER'
  | 'SHOP_DEALER'
  | 'BRAND_DISTRIBUTOR'
  | 'MACHINERY_PROVIDER'
  | 'LAND_PROVIDER'
  | 'DEVELOPER_BUILDER';

// Universal Request Lifecycles
export type GeneralRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'ACTION_REQUIRED'
  | 'APPROVED_CONVERTED'
  | 'CLOSED';

export type EnrollmentRequestStatus =
  | 'SUBMITTED'
  | 'KYC_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'ACTIVE';

export type UniversalFormStatus = GeneralRequestStatus | EnrollmentRequestStatus | 'EXPERT_ASSIGNED' | 'PROPOSAL_READY' | 'CONVERTED_TO_PROJECT' | 'NEEDS_INFO';

export interface FormAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
  uploadedAt?: string;
  uploadedBy?: string;
}

export interface StatusHistoryLog {
  id: string;
  status: UniversalFormStatus;
  timestamp: string;
  author: string;
  authorRole?: string;
  note: string;
  actionTaken?: string;
}

export interface UserCorrectionEntry {
  id: string;
  timestamp: string;
  message: string;
  author: string;
  attachedDocs?: FormAttachment[];
}

export interface AssignedEntity {
  id?: string;
  name: string;
  role: string;
  specialization?: string;
  department?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  type?: 'TEAM' | 'CONSULTANT' | 'VENDOR' | 'DESK' | 'OPERATIONS';
}

export interface ConversionHierarchy {
  formId: string;
  queryId?: string;
  caseId?: string;
  projectId?: string;
  convertedAt?: string;
}

export interface UniversalFormRecord {
  id: string; // e.g. BEG-FRM-2026-00125, BEG-QRY-2026-00451, BEG-ENR-2026-00882
  formType: FormType;
  category: QueryCategory | string;
  title: string;
  primaryObjective?: string;
  location: string;
  city?: string;
  pincode: string;
  status: UniversalFormStatus;
  urgency?: 'STANDARD' | 'HIGH' | 'CRITICAL';
  
  // Client / Submitter details
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  preferredContact: 'CALL' | 'WHATSAPP' | 'EMAIL';
  
  // Assignment details
  assignedTo?: AssignedEntity;
  assignedExpert?: AssignedEntity;
  assignedExpertName?: string;
  
  // Dates
  createdAt: string;
  updatedAt: string;
  lastUpdatedAt?: string;
  
  // Action alerts
  pendingAction?: {
    required: boolean;
    message: string;
    actionType: 'UPLOAD_DOC' | 'CONFIRM_SPEC' | 'MAKE_CORRECTION' | 'VERIFY_PHONE' | 'AWAITING_CLIENT_APPROVAL';
    requestedAt?: string;
  };

  // Documents & corrections
  attachments?: FormAttachment[];
  documents?: FormAttachment[];
  userCorrections?: UserCorrectionEntry[];

  // Conversion links
  conversionChain?: ConversionHierarchy;
  convertedCaseId?: string;
  convertedCaseReference?: string;
  convertedProjectId?: string;

  // Audit and Status History
  statusHistory: StatusHistoryLog[];

  // Category specific payload
  details: Record<string, any>;
  fields?: Record<string, any>;
}

// Backward compatibility aliases
export type CustomerQueryRecord = UniversalFormRecord;
export type QueryStatus = UniversalFormStatus;

export interface ProviderEnrollmentRecord {
  id: string; // e.g. BEG-ENR-2026-00882 or BEG-MBR-2026-0882
  formType?: FormType;
  role: EnrollmentRole;
  fullName: string;
  businessName?: string;
  email: string;
  phone: string;
  city: string;
  pincode: string;
  serviceRadiusKm: number;
  profileCompletion: number; // percentage e.g. 70
  kycStatus: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  categoryVerification: 'PENDING' | 'VERIFIED';
  serviceAreaStatus: 'COMPLETE' | 'INCOMPLETE';
  catalogStatus: 'COMPLETE' | 'INCOMPLETE';
  createdAt: string;
  updatedAt?: string;
  status?: UniversalFormStatus;
  statusHistory?: StatusHistoryLog[];
  assignedTo?: AssignedEntity;
  pendingAction?: {
    required: boolean;
    message: string;
    actionType: string;
  };
  details: Record<string, any>;
  documents: FormAttachment[];
  attachments?: FormAttachment[];
}
