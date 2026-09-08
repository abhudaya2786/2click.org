import { 
  UniversalFormRecord, 
  CustomerQueryRecord, 
  ProviderEnrollmentRecord, 
  FormType, 
  UniversalFormStatus, 
  StatusHistoryLog, 
  FormAttachment, 
  UserCorrectionEntry,
  AssignedEntity
} from '../types/forms';

const UNIVERSAL_FORMS_STORAGE_KEY = 'buildecogroup_universal_forms_v2';
const ENROLLMENTS_STORAGE_KEY = 'buildecogroup_provider_enrollments_v2';

// Rich pre-seeded forms showcasing various categories, lifecycle states, assignments, and audit histories
const INITIAL_UNIVERSAL_FORMS: UniversalFormRecord[] = [
  {
    id: 'BEG-FRM-2026-00125',
    formType: 'LAND_REGISTRATION',
    category: 'LAND',
    title: '4.5 Acre Land Feasibility & JV Modeling',
    location: 'Sultanpur Road, Lucknow',
    city: 'Lucknow',
    pincode: '226002',
    status: 'ASSIGNED',
    urgency: 'HIGH',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    lastUpdatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    clientName: 'Aditya Vardhan',
    clientEmail: 'aditya.vardhan@ecoventures.in',
    clientPhone: '+91 98450 12345',
    preferredContact: 'WHATSAPP',
    assignedTo: {
      id: 'EXP-101',
      name: 'Er. Rajeshwar Nath',
      role: 'Senior Urban Planner & Land Feasibility Director',
      specialization: 'Town Planning & Mixed-Use JV Structuring',
      department: 'Land & Feasibility Cell',
      phone: '+91 70072 54932',
      type: 'CONSULTANT',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    assignedExpert: {
      id: 'EXP-101',
      name: 'Er. Rajeshwar Nath',
      role: 'Senior Urban Planner & Land Feasibility Director',
      specialization: 'Town Planning & Mixed-Use JV Structuring',
      department: 'Land & Feasibility Cell',
      phone: '+91 70072 54932',
      type: 'CONSULTANT',
    },
    conversionChain: {
      formId: 'BEG-FRM-2026-00125',
      queryId: 'BEG-QRY-2026-00451',
    },
    statusHistory: [
      {
        id: 'hist-1',
        status: 'SUBMITTED',
        timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        author: 'Aditya Vardhan (Client)',
        authorRole: 'Client',
        note: 'Submitted 4.5 Acre Sultanpur Road land details with initial Khasra survey map.',
      },
      {
        id: 'hist-2',
        status: 'UNDER_REVIEW',
        timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        author: 'Er. Alok Verma',
        authorRole: 'Central Operations Desk',
        note: 'Initial zoning check completed against Lucknow Master Plan 2031. Highway frontage verified.',
      },
      {
        id: 'hist-3',
        status: 'ASSIGNED',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        author: 'Admin Operations',
        authorRole: 'Admin Desk',
        note: 'Assigned to Er. Rajeshwar Nath for FAR feasibility analysis and JV sharing term sheet draft.',
      },
    ],
    details: {
      ownership: 'I Own Land',
      landArea: '4.5 Acres (approx 1,96,000 sq ft)',
      purpose: 'Joint Venture / Development',
      expectedBudget: '₹12 - 15 Crores (GDV)',
      roadWidth: '60 Feet Master Plan Sector Road',
      hasDocuments: 'Yes - Khatauni, 143 Order & Survey Map available',
      description: 'Looking to develop a mixed-use commercial and boutique plotted township. Need best-use feasibility analysis, FAR calculations, and legal title vetting.',
    },
    documents: [
      { id: 'att-1', name: 'Sultanpur_Road_Khasra_Map.pdf', size: '2.4 MB', type: 'application/pdf', uploadedAt: new Date(Date.now() - 3600000 * 70).toISOString() },
      { id: 'att-2', name: 'Site_Frontage_Photo.jpg', size: '3.1 MB', type: 'image/jpeg', uploadedAt: new Date(Date.now() - 3600000 * 70).toISOString() },
    ],
    attachments: [
      { id: 'att-1', name: 'Sultanpur_Road_Khasra_Map.pdf', size: '2.4 MB', type: 'application/pdf' },
      { id: 'att-2', name: 'Site_Frontage_Photo.jpg', size: '3.1 MB', type: 'image/jpeg' },
    ],
  },
  {
    id: 'BEG-FRM-2026-00219',
    formType: 'CONSTRUCTION_REQ',
    category: 'CONSTRUCTION',
    title: 'G+2 Eco-Villa Turnkey Construction',
    location: 'Gomti Nagar Extension, Lucknow',
    city: 'Lucknow',
    pincode: '226010',
    status: 'ACTION_REQUIRED',
    urgency: 'HIGH',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    lastUpdatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    clientName: 'Sanjay Trivedi',
    clientEmail: 'sanjay.trivedi@outlook.com',
    clientPhone: '+91 94150 78901',
    preferredContact: 'CALL',
    assignedTo: {
      id: 'EXP-102',
      name: 'Ar. Ananya Sen',
      role: 'Principal Bioclimatic Architect',
      specialization: 'Energy-Efficient Villa Design & Structural Vetting',
      department: 'Architecture & Sustainable Design',
      phone: '+91 70072 54932',
      type: 'CONSULTANT',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    assignedExpert: {
      id: 'EXP-102',
      name: 'Ar. Ananya Sen',
      role: 'Principal Bioclimatic Architect',
      specialization: 'Energy-Efficient Villa Design & Structural Vetting',
      department: 'Architecture & Sustainable Design',
      phone: '+91 70072 54932',
      type: 'CONSULTANT',
    },
    pendingAction: {
      required: true,
      message: 'Please upload LDA Plot Registry boundary coordinates or dimensional demarcation layout.',
      actionType: 'UPLOAD_DOC',
      requestedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    conversionChain: {
      formId: 'BEG-FRM-2026-00219',
      queryId: 'BEG-QRY-2026-00219',
    },
    statusHistory: [
      {
        id: 'hist-10',
        status: 'SUBMITTED',
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
        author: 'Sanjay Trivedi (Client)',
        authorRole: 'Client',
        note: 'Submitted 3,200 sq ft plot turnkey eco-villa construction requirement.',
      },
      {
        id: 'hist-11',
        status: 'UNDER_REVIEW',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        author: 'Er. Vikash Maurya',
        authorRole: 'Civil Estimation Lead',
        note: 'Preliminary BOQ estimation framed: ₹90L - ₹1.15 Cr range based on mass bioclimatic envelope.',
      },
      {
        id: 'hist-12',
        status: 'ASSIGNED',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        author: 'Operations Admin',
        authorRole: 'Admin Desk',
        note: 'Assigned to Ar. Ananya Sen for concept zoning and structural layout.',
      },
      {
        id: 'hist-13',
        status: 'ACTION_REQUIRED',
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        author: 'Ar. Ananya Sen',
        authorRole: 'Assigned Architect',
        note: 'Demarcation layout required before finalizing ground floor setbacks and sun-path orientation.',
      },
    ],
    details: {
      constructionType: 'New Construction',
      buildingType: 'Residential Multi-Floor',
      plotArea: '3,200 sq ft',
      builtUpArea: '5,800 sq ft',
      floors: 'G + 2 Floors',
      budget: '₹90 Lakhs - ₹1.2 Crore',
      currentStage: 'Plot Purchased, Ready for Architectural Drawings',
      needArchitect: true,
      needBOQ: true,
      needContractor: true,
      needMaterials: true,
      description: 'Need complete bioclimatic design, architectural blueprints, normalized BOQ tender, and empaneled contractor execution with daily progress tracking.',
    },
    documents: [
      { id: 'att-3', name: 'Gomti_Nagar_Plot_Sanction.pdf', size: '1.8 MB', type: 'application/pdf', uploadedAt: new Date(Date.now() - 3600000 * 48).toISOString() }
    ],
    attachments: [
      { id: 'att-3', name: 'Gomti_Nagar_Plot_Sanction.pdf', size: '1.8 MB', type: 'application/pdf' }
    ],
  },
  {
    id: 'BEG-FRM-2026-00108',
    formType: 'SOLAR_ASSESSMENT',
    category: 'SOLAR',
    title: '15 kW Rooftop Solar Hybrid Plant',
    location: 'Gorakhpur, Uttar Pradesh',
    city: 'Gorakhpur',
    pincode: '273001',
    status: 'APPROVED_CONVERTED',
    urgency: 'STANDARD',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    lastUpdatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    clientName: 'Manoj Kumar Gupta',
    clientEmail: 'mkgupta.gkp@gmail.com',
    clientPhone: '+91 99350 11223',
    preferredContact: 'WHATSAPP',
    assignedTo: {
      id: 'EXP-103',
      name: 'Er. Vikrant Joshi',
      role: 'Chief Renewable Energy Engineer',
      specialization: 'UPNEDA Net-Metering & Hybrid Inverter Systems',
      department: 'Solar & Clean Energy Cell',
      phone: '+91 70072 54932',
      type: 'CONSULTANT',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    assignedExpert: {
      id: 'EXP-103',
      name: 'Er. Vikrant Joshi',
      role: 'Chief Renewable Energy Engineer',
      specialization: 'UPNEDA Net-Metering & Hybrid Inverter Systems',
      department: 'Solar & Clean Energy Cell',
      phone: '+91 70072 54932',
      type: 'CONSULTANT',
    },
    conversionChain: {
      formId: 'BEG-FRM-2026-00108',
      queryId: 'BEG-QRY-2026-00108',
      caseId: 'BEG-CASE-4092',
      projectId: 'PRJ-GKP-SOLAR-08',
      convertedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    convertedCaseId: 'BEG-CASE-4092',
    convertedCaseReference: 'BEG-CASE-4092',
    convertedProjectId: 'PRJ-GKP-SOLAR-08',
    statusHistory: [
      {
        id: 'hist-20',
        status: 'SUBMITTED',
        timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
        author: 'Manoj Kumar Gupta (Client)',
        authorRole: 'Client',
        note: 'Submitted 15 kW commercial rooftop solar assessment for hospital clinic.',
      },
      {
        id: 'hist-21',
        status: 'UNDER_REVIEW',
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
        author: 'Er. Vikrant Joshi',
        authorRole: 'Solar Lead',
        note: 'Shadow analysis performed. 1,800 sq ft RCC roof can yield 18.2 kWp bifacial array.',
      },
      {
        id: 'hist-22',
        status: 'ASSIGNED',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        author: 'Central Admin',
        authorRole: 'Admin Desk',
        note: 'Turnkey quote with UPNEDA Net Metering assistance dispatched.',
      },
      {
        id: 'hist-23',
        status: 'APPROVED_CONVERTED',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        author: 'Client & Admin',
        authorRole: 'System Orchestrator',
        note: 'Client approved proposal. Form converted to active Project #PRJ-GKP-SOLAR-08 & Case #BEG-CASE-4092.',
      },
    ],
    details: {
      systemType: 'Hybrid (Grid + Lithium Storage)',
      propertyType: 'Commercial Hospital / Clinic',
      monthlyBill: '₹38,000 / month',
      roofArea: '1,800 sq ft shadow-free RCC roof',
      batteryNeeded: 'Yes - 10 kWh storage for critical medical equipment',
      subsidyGuidance: 'Yes - PM Surya Ghar / State subsidy assistance needed',
      financeGuidance: 'Yes - Green loan financing interest',
    },
    documents: [
      { id: 'att-4', name: 'Electricity_Bill_Latest.pdf', size: '1.1 MB', type: 'application/pdf', uploadedAt: new Date(Date.now() - 3600000 * 72).toISOString() },
      { id: 'att-5', name: 'BEG_15kW_Solar_Feasibility_Report.pdf', size: '3.4 MB', type: 'application/pdf', uploadedAt: new Date(Date.now() - 3600000 * 2).toISOString() }
    ],
    attachments: [
      { id: 'att-4', name: 'Electricity_Bill_Latest.pdf', size: '1.1 MB', type: 'application/pdf' },
      { id: 'att-5', name: 'BEG_15kW_Solar_Feasibility_Report.pdf', size: '3.4 MB', type: 'application/pdf' }
    ],
  },
  {
    id: 'BEG-ENR-2026-00882',
    formType: 'PROVIDER_ENROLLMENT',
    category: 'PROVIDER_ENROLLMENT',
    title: 'Bioclimatic Architect & Structural Consultant Empanelment',
    location: 'Hazratganj, Lucknow',
    city: 'Lucknow',
    pincode: '226001',
    status: 'KYC_REVIEW',
    urgency: 'STANDARD',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    lastUpdatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    clientName: 'Ar. Devendra Pratap Singh',
    clientEmail: 'devendra.architect@studiogreen.in',
    clientPhone: '+91 97920 44556',
    preferredContact: 'CALL',
    assignedTo: {
      id: 'TEAM-KYC',
      name: 'Central Empanelment Board',
      role: 'Provider KYC & Statutory Verification Cell',
      department: 'Empanelment Directorate',
      phone: '+91 70072 54932',
      type: 'TEAM',
    },
    conversionChain: {
      formId: 'BEG-ENR-2026-00882',
    },
    statusHistory: [
      {
        id: 'hist-30',
        status: 'SUBMITTED',
        timestamp: new Date(Date.now() - 3600000 * 36).toISOString(),
        author: 'Ar. Devendra Pratap Singh',
        authorRole: 'Applicant',
        note: 'Submitted Professional Empanelment Application with Council of Architecture (CoA) Registration.',
      },
      {
        id: 'hist-31',
        status: 'KYC_REVIEW',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        author: 'Neha Srivastava (KYC Lead)',
        authorRole: 'Verification Desk',
        note: 'CoA License CA/2012/58941 verified on portal. Portfolio peer review in progress.',
      },
    ],
    details: {
      role: 'PROFESSIONAL',
      qualification: 'B.Arch (IIT Roorkee), M.Plan',
      experienceYears: '12 Years',
      licenseNumber: 'CoA CA/2012/58941',
      serviceArea: 'Lucknow & 50km radius',
      portfolioProjects: 'Over 45 sustainable commercial and residential structures executed in UP.',
    },
    documents: [
      { id: 'att-6', name: 'CoA_Certificate_Devendra.pdf', size: '1.2 MB', type: 'application/pdf', uploadedAt: new Date(Date.now() - 3600000 * 36).toISOString() },
      { id: 'att-7', name: 'GST_Certificate.pdf', size: '890 KB', type: 'application/pdf', uploadedAt: new Date(Date.now() - 3600000 * 36).toISOString() },
    ],
  },
  {
    id: 'BEG-FRM-2026-00341',
    formType: 'BOQ_ESTIMATION',
    category: 'BOQ',
    title: 'Industrial Warehouse Structural Audit & Normalized BOQ',
    location: 'Amausi Industrial Area, Lucknow',
    city: 'Lucknow',
    pincode: '226008',
    status: 'SUBMITTED',
    urgency: 'STANDARD',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    lastUpdatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    clientName: 'Prashant Singhal',
    clientEmail: 'p.singhal@singhallogistics.com',
    clientPhone: '+91 98390 11998',
    preferredContact: 'WHATSAPP',
    assignedTo: {
      id: 'DESK-BOQ',
      name: 'BOQ Estimation & Quantity Surveying Cell',
      role: 'Central Rate Normalization Desk',
      department: 'Quantity Surveying',
      phone: '+91 70072 54932',
      type: 'TEAM',
    },
    conversionChain: {
      formId: 'BEG-FRM-2026-00341',
    },
    statusHistory: [
      {
        id: 'hist-40',
        status: 'SUBMITTED',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        author: 'Prashant Singhal (Client)',
        authorRole: 'Client',
        note: 'Submitted warehouse PEB structural audit and bill of quantities estimation request.',
      },
    ],
    details: {
      projectType: 'Industrial PEB Warehouse (24,000 sq ft)',
      currentStage: 'Structural drawings ready, need rate normalization and vendor bidding BOQ',
      expectedBudget: '₹2.8 Crores',
    },
    documents: [
      { id: 'att-8', name: 'Amausi_Warehouse_PEB_Drawings.dwg', size: '5.2 MB', type: 'application/octet-stream', uploadedAt: new Date(Date.now() - 3600000 * 8).toISOString() }
    ],
  },
  {
    id: 'BEG-FRM-2026-00512',
    formType: 'VENDOR_RFQ',
    category: 'MATERIAL_PROCUREMENT',
    title: 'Bulk TMT Rebar Fe550D (120 MT) & Ready-Mix Concrete Procurement',
    location: 'Shaheed Path, Lucknow',
    city: 'Lucknow',
    pincode: '226002',
    status: 'UNDER_REVIEW',
    urgency: 'HIGH',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    lastUpdatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    clientName: 'Vikas Agarwal',
    clientEmail: 'v.agarwal@apexinfra.co',
    clientPhone: '+91 94150 33445',
    preferredContact: 'CALL',
    assignedTo: {
      id: 'DESK-PROC',
      name: 'Material Procurement & Vendor Matching Desk',
      role: 'Direct Mill Supply & Testing Cell',
      department: 'Commercial Outsourcing',
      phone: '+91 70072 54932',
      type: 'TEAM',
    },
    conversionChain: {
      formId: 'BEG-FRM-2026-00512',
    },
    statusHistory: [
      {
        id: 'hist-50',
        status: 'SUBMITTED',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        author: 'Vikas Agarwal',
        authorRole: 'Developer Lead',
        note: 'Submitted 120 MT Fe550D TMT rebar and 450 cum M25 RMC requisition.',
      },
      {
        id: 'hist-51',
        status: 'UNDER_REVIEW',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        author: 'Procurement Director',
        authorRole: 'Material Desk',
        note: 'Floating live reverse RFQ to empaneled Tata Tiscon, Jindal Panther & Kamdhenu primary distributors.',
      },
    ],
    details: {
      materialCategory: 'Structural Steel & Ready Mix Concrete',
      quantity: '120 MT TMT + 450 Cum RMC M25',
      deliverySchedule: 'Phased delivery over 60 days to Shaheed Path site',
      testReportRequired: 'Yes - NABL certified mill test certificate mandatory',
    },
    documents: [],
  }
];

// Read from LocalStorage or seed
export function getUniversalForms(): UniversalFormRecord[] {
  try {
    const raw = localStorage.getItem(UNIVERSAL_FORMS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(UNIVERSAL_FORMS_STORAGE_KEY, JSON.stringify(INITIAL_UNIVERSAL_FORMS));
      return INITIAL_UNIVERSAL_FORMS;
    }
    const parsed: UniversalFormRecord[] = JSON.parse(raw);
    return parsed;
  } catch (e) {
    console.error('Error loading universal forms:', e);
    return INITIAL_UNIVERSAL_FORMS;
  }
}

// Alias for customer queries backward-compatibility
export const getCustomerQueries = getUniversalForms;
export const getSavedQueries = getUniversalForms;

// Find a form by ID (case-insensitive) or phone or email
export function findFormByQuery(searchQuery: string): UniversalFormRecord[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return [];

  const all = getUniversalForms();
  
  // 1. Exact or partial ID match
  const idMatches = all.filter(f => 
    f.id.toLowerCase().includes(query) ||
    (f.conversionChain?.queryId && f.conversionChain.queryId.toLowerCase().includes(query)) ||
    (f.conversionChain?.caseId && f.conversionChain.caseId.toLowerCase().includes(query)) ||
    (f.conversionChain?.projectId && f.conversionChain.projectId.toLowerCase().includes(query))
  );
  if (idMatches.length > 0) return idMatches;

  // 2. Phone or Email lookup
  const contactMatches = all.filter(f => 
    (f.clientPhone && f.clientPhone.replace(/\D/g, '').includes(query.replace(/\D/g, ''))) ||
    (f.clientEmail && f.clientEmail.toLowerCase().includes(query)) ||
    (f.clientName && f.clientName.toLowerCase().includes(query))
  );

  return contactMatches;
}

export function getFormById(id: string): UniversalFormRecord | undefined {
  const all = getUniversalForms();
  return all.find(f => 
    f.id.toLowerCase() === id.trim().toLowerCase() ||
    f.conversionChain?.queryId?.toLowerCase() === id.trim().toLowerCase() ||
    f.conversionChain?.caseId?.toLowerCase() === id.trim().toLowerCase()
  );
}

// Save a new form (generates formatted Unique ID e.g. BEG-FRM-2026-00125)
export function saveUniversalForm(
  form: Omit<UniversalFormRecord, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdatedAt' | 'statusHistory'> & {
    id?: string;
    statusHistory?: StatusHistoryLog[];
  }
): UniversalFormRecord {
  const all = getUniversalForms();
  const currentYear = new Date().getFullYear();
  const randomSeq = String(Math.floor(100 + Math.random() * 900)).padStart(5, '0');

  // Determine prefix based on form type
  let prefix = 'BEG-FRM';
  if (form.formType === 'PROVIDER_ENROLLMENT') prefix = 'BEG-ENR';
  else if (form.formType === 'CONSULTANT_QUERY') prefix = 'BEG-QRY';

  const newId = form.id || `${prefix}-${currentYear}-${randomSeq}`;
  const now = new Date().toISOString();

  const initialStatus: UniversalFormStatus = form.formType === 'PROVIDER_ENROLLMENT' ? 'SUBMITTED' : 'SUBMITTED';

  const initialHistory: StatusHistoryLog[] = form.statusHistory || [
    {
      id: `hist-${Date.now()}`,
      status: initialStatus,
      timestamp: now,
      author: form.clientName || 'Client Submitter',
      authorRole: 'Submitter',
      note: `Requirement registered for ${form.title || form.category}. Routed to BuildEcoGroup central dispatch queue.`,
    }
  ];

  const newRecord: UniversalFormRecord = {
    ...form,
    id: newId,
    status: form.status || initialStatus,
    createdAt: now,
    updatedAt: now,
    lastUpdatedAt: now,
    documents: form.documents || form.attachments || [],
    attachments: form.attachments || form.documents || [],
    statusHistory: initialHistory,
    conversionChain: form.conversionChain || {
      formId: newId,
    },
    assignedTo: form.assignedTo || {
      name: 'BuildEcoGroup Central Coordination Desk',
      role: 'Project Intake & Dispatch Coordinator',
      specialization: `${form.category} Engineering & Feasibility`,
      phone: '+91 70072 54932',
      type: 'DESK',
    },
    assignedExpert: form.assignedExpert || form.assignedTo || {
      name: 'BuildEcoGroup Central Coordination Desk',
      role: 'Project Intake & Dispatch Coordinator',
      specialization: `${form.category} Engineering & Feasibility`,
      phone: '+91 70072 54932',
      type: 'DESK',
    }
  };

  const updated = [newRecord, ...all];
  localStorage.setItem(UNIVERSAL_FORMS_STORAGE_KEY, JSON.stringify(updated));
  return newRecord;
}

// Backward-compatible query saver
export function saveCustomerQuery(query: any): CustomerQueryRecord {
  return saveUniversalForm({
    formType: 'CONSULTANT_QUERY',
    category: query.category || 'LAND',
    title: query.title || `${query.category} Requirement`,
    location: query.location || 'Lucknow',
    city: query.city || query.location || 'Lucknow',
    pincode: query.pincode || '226001',
    status: 'SUBMITTED',
    clientName: query.clientName || 'Client',
    clientEmail: query.clientEmail || 'client@buildecogroup.com',
    clientPhone: query.clientPhone || '+91 70072 54932',
    preferredContact: query.preferredContact || 'WHATSAPP',
    details: query.details || {},
    documents: query.documents || query.attachments || [],
    attachments: query.attachments || query.documents || [],
    assignedTo: query.assignedExpert,
    assignedExpert: query.assignedExpert,
  });
}

// Update status with full audit note
export function updateFormStatus(
  formId: string, 
  newStatus: UniversalFormStatus, 
  note: string, 
  author: string, 
  authorRole: string = 'Admin Desk',
  assignedTo?: AssignedEntity,
  pendingAction?: { required: boolean; message: string; actionType: any }
): UniversalFormRecord | null {
  const all = getUniversalForms();
  const index = all.findIndex(f => f.id === formId);
  if (index === -1) return null;

  const target = all[index];
  const now = new Date().toISOString();

  const newLog: StatusHistoryLog = {
    id: `hist-${Date.now()}`,
    status: newStatus,
    timestamp: now,
    author,
    authorRole,
    note,
  };

  const updated: UniversalFormRecord = {
    ...target,
    status: newStatus,
    updatedAt: now,
    lastUpdatedAt: now,
    assignedTo: assignedTo || target.assignedTo,
    assignedExpert: assignedTo || target.assignedExpert,
    pendingAction: pendingAction !== undefined ? (pendingAction.required ? { ...pendingAction, requestedAt: now } : undefined) : target.pendingAction,
    statusHistory: [...(target.statusHistory || []), newLog],
  };

  all[index] = updated;
  localStorage.setItem(UNIVERSAL_FORMS_STORAGE_KEY, JSON.stringify(all));
  return updated;
}

// Add document to existing form
export function addDocumentToForm(formId: string, document: FormAttachment, uploaderName: string = 'Client'): UniversalFormRecord | null {
  const all = getUniversalForms();
  const index = all.findIndex(f => f.id === formId);
  if (index === -1) return null;

  const target = all[index];
  const now = new Date().toISOString();

  const docWithMeta = {
    ...document,
    uploadedAt: now,
    uploadedBy: uploaderName,
  };

  const currentDocs = target.documents || target.attachments || [];
  const updatedDocs = [...currentDocs, docWithMeta];

  const newLog: StatusHistoryLog = {
    id: `hist-${Date.now()}`,
    status: target.status,
    timestamp: now,
    author: uploaderName,
    authorRole: 'Client Submitter',
    note: `Uploaded document: ${document.name} (${document.size}).`,
  };

  // If pending action was to upload doc, resolve it
  const resolvedPending = target.pendingAction?.actionType === 'UPLOAD_DOC' ? undefined : target.pendingAction;

  const updated: UniversalFormRecord = {
    ...target,
    documents: updatedDocs,
    attachments: updatedDocs,
    updatedAt: now,
    lastUpdatedAt: now,
    pendingAction: resolvedPending,
    statusHistory: [...(target.statusHistory || []), newLog],
  };

  all[index] = updated;
  localStorage.setItem(UNIVERSAL_FORMS_STORAGE_KEY, JSON.stringify(all));
  return updated;
}

// Submit a correction or clarification message from user
export function submitUserCorrection(formId: string, message: string, authorName: string = 'Client', docs?: FormAttachment[]): UniversalFormRecord | null {
  const all = getUniversalForms();
  const index = all.findIndex(f => f.id === formId);
  if (index === -1) return null;

  const target = all[index];
  const now = new Date().toISOString();

  const newCorrection: UserCorrectionEntry = {
    id: `corr-${Date.now()}`,
    timestamp: now,
    message,
    author: authorName,
    attachedDocs: docs,
  };

  const newLog: StatusHistoryLog = {
    id: `hist-${Date.now()}`,
    status: target.status === 'ACTION_REQUIRED' || target.status === 'CHANGES_REQUESTED' ? 'UNDER_REVIEW' : target.status,
    timestamp: now,
    author: authorName,
    authorRole: 'Client Submitter',
    note: `Client submitted correction/clarification: "${message.substring(0, 80)}${message.length > 80 ? '...' : ''}"`,
  };

  const updated: UniversalFormRecord = {
    ...target,
    status: target.status === 'ACTION_REQUIRED' ? 'UNDER_REVIEW' : target.status === 'CHANGES_REQUESTED' ? 'KYC_REVIEW' : target.status,
    userCorrections: [...(target.userCorrections || []), newCorrection],
    pendingAction: undefined, // Cleared on reply
    updatedAt: now,
    lastUpdatedAt: now,
    statusHistory: [...(target.statusHistory || []), newLog],
  };

  all[index] = updated;
  localStorage.setItem(UNIVERSAL_FORMS_STORAGE_KEY, JSON.stringify(all));
  return updated;
}

// Promote Form Hierarchy: Form ID -> Query ID -> Case ID -> Project ID
export function convertFormHierarchy(
  formId: string, 
  targetLevel: 'QUERY' | 'CASE' | 'PROJECT' | 'query' | 'case' | 'project', 
  actor: string = 'Admin Coordinator'
): { record: UniversalFormRecord; newId: string } | null {
  const all = getUniversalForms();
  const index = all.findIndex(f => f.id === formId);
  if (index === -1) return null;

  const target = all[index];
  const now = new Date().toISOString();
  const currentChain = target.conversionChain || { formId: target.id };

  const normLevel = targetLevel.toUpperCase();
  let newId = '';
  let updatedChain = { ...currentChain };
  let newStatus: UniversalFormStatus = target.status;
  let logNote = '';

  if (normLevel === 'QUERY') {
    newId = currentChain.queryId || `BEG-QRY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    updatedChain.queryId = newId;
    newStatus = 'UNDER_REVIEW';
    logNote = `Form #${target.id} evaluated & promoted to Technical Query #${newId}.`;
  } else if (normLevel === 'CASE') {
    newId = currentChain.caseId || `BEG-CASE-${Math.floor(1000 + Math.random() * 9000)}`;
    updatedChain.caseId = newId;
    if (!updatedChain.queryId) updatedChain.queryId = `BEG-QRY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    newStatus = 'APPROVED_CONVERTED';
    logNote = `Requirement promoted to Official Project Case #${newId} with allocated engineering desk.`;
  } else if (normLevel === 'PROJECT') {
    newId = currentChain.projectId || `PRJ-${target.location.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    updatedChain.projectId = newId;
    if (!updatedChain.caseId) updatedChain.caseId = `BEG-CASE-${Math.floor(1000 + Math.random() * 9000)}`;
    newStatus = 'APPROVED_CONVERTED';
    logNote = `Case upgraded to Active Project Execution Workspace #${newId}.`;
  }

  const newLog: StatusHistoryLog = {
    id: `hist-${Date.now()}`,
    status: newStatus,
    timestamp: now,
    author: actor,
    authorRole: 'System Orchestrator',
    note: logNote,
  };

  const updated: UniversalFormRecord = {
    ...target,
    status: newStatus,
    conversionChain: updatedChain,
    convertedCaseId: updatedChain.caseId,
    convertedCaseReference: updatedChain.caseId,
    convertedProjectId: updatedChain.projectId,
    updatedAt: now,
    lastUpdatedAt: now,
    statusHistory: [...(target.statusHistory || []), newLog],
  };

  all[index] = updated;
  localStorage.setItem(UNIVERSAL_FORMS_STORAGE_KEY, JSON.stringify(all));
  return { record: updated, newId };
}

// Convert Query to Case alias for backward compatibility
export function convertQueryToCase(queryId: string): string {
  const res = convertFormHierarchy(queryId, 'CASE');
  return res ? res.newId : `BEG-CASE-${Date.now().toString().slice(-6)}`;
}

// Provider Enrollment Storage
export function getSavedEnrollments(): ProviderEnrollmentRecord[] {
  try {
    const raw = localStorage.getItem(ENROLLMENTS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export const getProviderEnrollments = getSavedEnrollments;

export function saveProviderEnrollment(
  enrollment: Omit<ProviderEnrollmentRecord, 'id' | 'createdAt' | 'profileCompletion' | 'kycStatus' | 'categoryVerification' | 'serviceAreaStatus' | 'catalogStatus'>
): ProviderEnrollmentRecord {
  const all = getSavedEnrollments();
  const newYear = new Date().getFullYear();
  const randomSeq = String(Math.floor(100 + Math.random() * 900)).padStart(5, '0');
  const newId = `BEG-ENR-${newYear}-${randomSeq}`;

  const newRecord: ProviderEnrollmentRecord = {
    ...enrollment,
    id: newId,
    formType: 'PROVIDER_ENROLLMENT',
    profileCompletion: 70, // 70% after completing primary enrollment
    kycStatus: 'UNDER_REVIEW',
    categoryVerification: 'PENDING',
    serviceAreaStatus: 'COMPLETE',
    catalogStatus: 'INCOMPLETE',
    status: 'KYC_REVIEW',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newRecord, ...all];
  localStorage.setItem(ENROLLMENTS_STORAGE_KEY, JSON.stringify(updated));

  // Also register into Universal Forms so it is trackable via unified Form ID!
  saveUniversalForm({
    id: newId,
    formType: 'PROVIDER_ENROLLMENT',
    category: 'PROVIDER_ENROLLMENT',
    title: `${enrollment.role} Empanelment • ${enrollment.businessName || enrollment.fullName}`,
    location: enrollment.city,
    city: enrollment.city,
    pincode: enrollment.pincode,
    status: 'KYC_REVIEW',
    clientName: enrollment.fullName,
    clientEmail: enrollment.email,
    clientPhone: enrollment.phone,
    preferredContact: 'CALL',
    assignedTo: {
      name: 'Empanelment & KYC Verification Board',
      role: 'Statutory Credential & License Review Cell',
      department: 'Empanelment Directorate',
      phone: '+91 70072 54932',
      type: 'TEAM',
    },
    details: enrollment.details,
    documents: enrollment.documents,
    attachments: enrollment.documents,
  });

  return newRecord;
}
