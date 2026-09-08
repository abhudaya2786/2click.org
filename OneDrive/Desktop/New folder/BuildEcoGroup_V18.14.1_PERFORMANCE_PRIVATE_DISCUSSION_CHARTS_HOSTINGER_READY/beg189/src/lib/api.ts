import { 
  CaseIntakeInput, 
  ConsultantOnboardingInput, 
  CaseRecord, 
  ConsultantRecord, 
  CaseEvent,
  ProjectMilestoneRecord,
  DocumentRecord,
  ServiceCategoryRecord,
  CaseStatusHistoryRecord,
  AssignmentRecord,
  CaseInformationRequestRecord,
  CaseNoteRecord,
  CaseMessageRecord,
  NotificationRecord,
  ConsultantMatchResult,
  QualificationChecklist,
  CaseStatus,
  TaxCodeRecord,
  BOQRecord,
  BOQRevisionRecord,
  BOQItemRecord,
  BOQAdjustmentRecord,
  BOQApprovalRecord,
  QuotationRecord,
  QuotationItemRecord,
  QuotationComparisonMatrix,
  CreateBOQRequestInput,
  SaveBOQRevisionInput,
  CreateQuotationInput,
  EnrollmentIntakeInput,
  EnrollmentRecord,
  PublicTrackRecord,
} from '../types/backend';

const API_BASE = '/api';

// ==========================================
// 1. Service Catalog & Categories
// ==========================================

export async function fetchServiceCatalogApi(pillar?: string): Promise<{
  success: boolean;
  count: number;
  pillar: string;
  services: ServiceCategoryRecord[];
}> {
  const url = pillar ? `${API_BASE}/services?pillar=${encodeURIComponent(pillar)}` : `${API_BASE}/services`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch service catalog: ${response.status}`);
  }
  return response.json();
}

export async function fetchServiceCategoryApi(slug: string): Promise<{
  success: boolean;
  service: ServiceCategoryRecord;
}> {
  const response = await fetch(`${API_BASE}/services/${encodeURIComponent(slug)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch service category: ${response.status}`);
  }
  return response.json();
}

// ==========================================
// 2. Cases API
// ==========================================

export async function createCaseApi(input: CaseIntakeInput): Promise<{
  success: boolean;
  caseId: string;
  caseReference: string;
  status: string;
  pillar: string;
  serviceSlug: string;
  createdAt: string;
  case: CaseRecord;
  event: CaseEvent;
}> {
  const response = await fetch(`${API_BASE}/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Server responded with status ${response.status}`);
  }

  return response.json();
}

export async function fetchAllCasesApi(): Promise<{ count: number; cases: CaseRecord[] }> {
  const response = await fetch(`${API_BASE}/cases`);
  if (!response.ok) {
    throw new Error(`Failed to fetch cases: ${response.status}`);
  }
  return response.json();
}

export async function fetchCaseByIdApi(idOrRef: string): Promise<{
  success: boolean;
  case: CaseRecord;
  milestones: ProjectMilestoneRecord[];
  documents: DocumentRecord[];
  events: CaseEvent[];
  statusHistory: CaseStatusHistoryRecord[];
  assignments: AssignmentRecord[];
  infoRequests: CaseInformationRequestRecord[];
  notes: CaseNoteRecord[];
  messages: CaseMessageRecord[];
}> {
  const response = await fetch(`${API_BASE}/cases/${encodeURIComponent(idOrRef)}`);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to fetch case ${idOrRef}: ${response.status}`);
  }
  return response.json();
}

export async function transitionCaseStatusApi(
  caseIdOrRef: string, 
  nextStatus: CaseStatus, 
  reason: string, 
  metadata?: Record<string, any>
): Promise<{
  success: boolean;
  message: string;
  case: CaseRecord;
  history: CaseStatusHistoryRecord;
}> {
  const response = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseIdOrRef)}/transition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nextStatus, reason, metadata }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to transition case status: ${response.status}`);
  }

  return response.json();
}

export async function fetchCaseHistoryApi(caseIdOrRef: string): Promise<{
  success: boolean;
  count: number;
  history: CaseStatusHistoryRecord[];
}> {
  const response = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseIdOrRef)}/history`);
  if (!response.ok) {
    throw new Error(`Failed to fetch case history: ${response.status}`);
  }
  return response.json();
}

// ==========================================
// 3. Coordinator Queues & Workflow
// ==========================================

export async function fetchQualificationQueueApi(): Promise<{ count: number; queue: CaseRecord[] }> {
  const response = await fetch(`${API_BASE}/coordinator/queue/qualification`);
  if (!response.ok) {
    throw new Error(`Failed to fetch qualification queue: ${response.status}`);
  }
  return response.json();
}

export async function fetchMatchingQueueApi(): Promise<{ count: number; queue: CaseRecord[] }> {
  const response = await fetch(`${API_BASE}/coordinator/queue/matching`);
  if (!response.ok) {
    throw new Error(`Failed to fetch matching queue: ${response.status}`);
  }
  return response.json();
}

export async function fetchActiveCoordinationQueueApi(): Promise<{ count: number; queue: CaseRecord[] }> {
  const response = await fetch(`${API_BASE}/coordinator/queue/active`);
  if (!response.ok) {
    throw new Error(`Failed to fetch active coordination queue: ${response.status}`);
  }
  return response.json();
}

export async function qualifyCaseApi(
  caseIdOrRef: string,
  checklist: QualificationChecklist,
  notes?: string
): Promise<{ success: boolean; message: string; case: CaseRecord }> {
  const response = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseIdOrRef)}/qualify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checklist, notes }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to qualify case: ${response.status}`);
  }

  return response.json();
}

export async function assignCoordinatorApi(
  caseIdOrRef: string,
  coordinatorId: string,
  notes?: string
): Promise<{ success: boolean; message: string; case: CaseRecord }> {
  const response = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseIdOrRef)}/assign-coordinator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coordinatorId, notes }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to assign coordinator: ${response.status}`);
  }

  return response.json();
}

export async function fetchConsultantMatchesApi(caseIdOrRef: string): Promise<{
  success: boolean;
  caseId: string;
  count: number;
  matches: ConsultantMatchResult[];
}> {
  const response = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseIdOrRef)}/matches`);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to fetch matches: ${response.status}`);
  }
  return response.json();
}

export async function assignConsultantApi(
  caseIdOrRef: string,
  params: {
    consultantUserId: string;
    feeEstimate?: string;
    responseDueHours?: number;
    notes?: string;
    overrideJustification?: string;
  }
): Promise<{ success: boolean; message: string; assignment: AssignmentRecord }> {
  const response = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseIdOrRef)}/assign-consultant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to assign consultant: ${response.status}`);
  }

  return response.json();
}

// ==========================================
// 4. Consultant Workflow
// ==========================================

export async function fetchConsultantAssignmentsApi(): Promise<{
  success: boolean;
  count: number;
  assignments: AssignmentRecord[];
}> {
  const response = await fetch(`${API_BASE}/consultant/assignments`);
  if (!response.ok) {
    throw new Error(`Failed to fetch consultant assignments: ${response.status}`);
  }
  return response.json();
}

export async function respondToAssignmentApi(
  assignmentId: string,
  params: {
    action: 'accept' | 'decline';
    reason?: string;
    responseNotes?: string;
  }
): Promise<{
  success: boolean;
  message: string;
  assignment: AssignmentRecord;
  case: CaseRecord;
}> {
  const response = await fetch(`${API_BASE}/assignments/${encodeURIComponent(assignmentId)}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to submit response: ${response.status}`);
  }

  return response.json();
}

// ==========================================
// 5. Information Requests
// ==========================================

export async function fetchInformationRequestsApi(caseIdOrRef: string): Promise<{
  success: boolean;
  count: number;
  requests: CaseInformationRequestRecord[];
}> {
  const response = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseIdOrRef)}/info-requests`);
  if (!response.ok) {
    throw new Error(`Failed to fetch information requests: ${response.status}`);
  }
  return response.json();
}

export async function createInformationRequestApi(
  caseIdOrRef: string,
  question: string
): Promise<{ success: boolean; message: string; request: CaseInformationRequestRecord }> {
  const response = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseIdOrRef)}/info-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to create request: ${response.status}`);
  }

  return response.json();
}

export async function respondToInformationRequestApi(
  requestId: string,
  responseMessage: string
): Promise<{ success: boolean; message: string; request: CaseInformationRequestRecord; case: CaseRecord }> {
  const response = await fetch(`${API_BASE}/info-requests/${encodeURIComponent(requestId)}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ response: responseMessage }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to submit response: ${response.status}`);
  }

  return response.json();
}

// ==========================================
// 6. Notes & Messages
// ==========================================

export async function fetchCaseNotesApi(caseIdOrRef: string): Promise<{
  success: boolean;
  count: number;
  notes: CaseNoteRecord[];
}> {
  const response = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseIdOrRef)}/notes`);
  if (!response.ok) {
    throw new Error(`Failed to fetch case notes: ${response.status}`);
  }
  return response.json();
}

export async function createCaseNoteApi(
  caseIdOrRef: string,
  note: string,
  visibility: 'INTERNAL' | 'CUSTOMER_VISIBLE'
): Promise<{ success: boolean; note: CaseNoteRecord }> {
  const response = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseIdOrRef)}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note, visibility }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to save note: ${response.status}`);
  }

  return response.json();
}

export async function fetchCaseMessagesApi(caseIdOrRef: string): Promise<{
  success: boolean;
  count: number;
  messages: CaseMessageRecord[];
}> {
  const response = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseIdOrRef)}/messages`);
  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.status}`);
  }
  return response.json();
}

export async function sendCaseMessageApi(
  caseIdOrRef: string,
  message: string
): Promise<{ success: boolean; messageRecord: CaseMessageRecord }> {
  const response = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseIdOrRef)}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to send message: ${response.status}`);
  }

  return response.json();
}

// ==========================================
// 7. Notifications
// ==========================================

export async function fetchNotificationsApi(): Promise<{
  success: boolean;
  count: number;
  unreadCount: number;
  notifications: NotificationRecord[];
}> {
  const response = await fetch(`${API_BASE}/notifications`);
  if (!response.ok) {
    throw new Error(`Failed to fetch notifications: ${response.status}`);
  }
  return response.json();
}

export async function markNotificationReadApi(notificationId: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to mark notification read: ${response.status}`);
  }
  return response.json();
}

// ==========================================
// 8. Consultant Empanelment & Directory
// ==========================================

export async function submitConsultantOnboardingApi(input: ConsultantOnboardingInput): Promise<{
  success: boolean;
  consultantId: string;
  verificationStatus: string;
  message: string;
  consultant: ConsultantRecord;
}> {
  const response = await fetch(`${API_BASE}/consultants/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to submit onboarding application (${response.status})`);
  }

  return response.json();
}

export async function fetchConsultantsApi(): Promise<{ count: number; consultants: ConsultantRecord[] }> {
  const response = await fetch(`${API_BASE}/consultants`);
  if (!response.ok) {
    throw new Error(`Failed to fetch consultants: ${response.status}`);
  }
  return response.json();
}

export async function submitLeadActionApi(leadId: string, action: 'accept' | 'decline', reason?: string): Promise<{
  success: boolean;
  leadId: string;
  action: string;
  message: string;
  event: CaseEvent;
}> {
  const response = await fetch(`${API_BASE}/leads/${encodeURIComponent(leadId)}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, reason }),
  });

  if (!response.ok) {
    throw new Error(`Failed to perform lead action: ${response.status}`);
  }

  return response.json();
}

export async function fetchEventsApi(caseId?: string): Promise<{ count: number; events: CaseEvent[] }> {
  const url = caseId ? `${API_BASE}/events?caseId=${encodeURIComponent(caseId)}` : `${API_BASE}/events`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.status}`);
  }
  return response.json();
}

export async function fetchMetricsApi(): Promise<{
  success: boolean;
  metrics: {
    totalCases: number;
    realCasesCount: number;
    activeCasesCount: number;
    totalEvents: number;
    totalConsultants: number;
    statusBreakdown: Record<string, number>;
    postgresConnectionStatus: string;
  };
}> {
  const response = await fetch(`${API_BASE}/metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch platform telemetry: ${response.status}`);
  }
  return response.json();
}

// ==========================================
// 14. Phase 6: Commercial Engine API
// ==========================================

export async function fetchTaxCodesApi(): Promise<{ success: boolean; count: number; taxCodes: TaxCodeRecord[] }> {
  const response = await fetch(`${API_BASE}/tax-codes`);
  if (!response.ok) {
    throw new Error(`Failed to fetch tax codes: ${response.status}`);
  }
  return response.json();
}

export async function createTaxCodeApi(input: { code: string; name: string; rate: number; hsnSacCode?: string }): Promise<{ success: boolean; taxCode: TaxCodeRecord; message: string }> {
  const response = await fetch(`${API_BASE}/tax-codes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to create tax code: ${response.status}`);
  }
  return response.json();
}

export async function createBOQRequestApi(caseId: string, input: Omit<CreateBOQRequestInput, 'caseId'>): Promise<{ success: boolean; boq: BOQRecord; message: string }> {
  const response = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseId)}/boqs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to create BOQ request: ${response.status}`);
  }
  return response.json();
}

export async function fetchBOQsForCaseApi(caseId: string): Promise<{ success: boolean; count: number; boqs: BOQRecord[] }> {
  const response = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseId)}/boqs`);
  if (!response.ok) {
    throw new Error(`Failed to fetch BOQs for case: ${response.status}`);
  }
  return response.json();
}

export async function fetchBOQByIdApi(boqIdOrRef: string): Promise<{ success: boolean; boq: BOQRecord }> {
  const response = await fetch(`${API_BASE}/boqs/${encodeURIComponent(boqIdOrRef)}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch BOQ: ${response.status}`);
  }
  return response.json();
}

export async function createBOQRevisionApi(boqId: string, notes?: string): Promise<{ success: boolean; revision: BOQRevisionRecord; message: string }> {
  const response = await fetch(`${API_BASE}/boqs/${encodeURIComponent(boqId)}/revisions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to create BOQ revision: ${response.status}`);
  }
  return response.json();
}

export async function updateBOQRevisionApi(
  boqId: string, 
  revisionId: string, 
  data: SaveBOQRevisionInput
): Promise<{ success: boolean; revision: BOQRevisionRecord; message: string }> {
  const response = await fetch(`${API_BASE}/boqs/${encodeURIComponent(boqId)}/revisions/${encodeURIComponent(revisionId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to update BOQ revision: ${response.status}`);
  }
  return response.json();
}

export async function submitBOQForReviewApi(
  boqId: string, 
  revisionId: string, 
  notes?: string
): Promise<{ success: boolean; boq: BOQRecord; message: string }> {
  const response = await fetch(`${API_BASE}/boqs/${encodeURIComponent(boqId)}/revisions/${encodeURIComponent(revisionId)}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to submit BOQ for review: ${response.status}`);
  }
  return response.json();
}

export async function requestBOQChangesApi(
  boqId: string, 
  revisionId: string, 
  comment: string, 
  reasonCategory?: string
): Promise<{ success: boolean; boq: BOQRecord; approval: BOQApprovalRecord; message: string }> {
  const response = await fetch(`${API_BASE}/boqs/${encodeURIComponent(boqId)}/revisions/${encodeURIComponent(revisionId)}/request-changes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment, reasonCategory }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to request BOQ changes: ${response.status}`);
  }
  return response.json();
}

export async function approveBOQApi(
  boqId: string, 
  revisionId: string, 
  comment?: string
): Promise<{ success: boolean; boq: BOQRecord; approval: BOQApprovalRecord; message: string }> {
  const response = await fetch(`${API_BASE}/boqs/${encodeURIComponent(boqId)}/revisions/${encodeURIComponent(revisionId)}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to approve BOQ: ${response.status}`);
  }
  return response.json();
}

export async function fetchQuotationsForBOQApi(boqId: string): Promise<{ success: boolean; count: number; quotations: QuotationRecord[] }> {
  const response = await fetch(`${API_BASE}/boqs/${encodeURIComponent(boqId)}/quotations`);
  if (!response.ok) {
    throw new Error(`Failed to fetch quotations: ${response.status}`);
  }
  return response.json();
}

export async function createQuotationApi(boqId: string, data: Omit<CreateQuotationInput, 'boqId'>): Promise<{ success: boolean; quotation: QuotationRecord; message: string }> {
  const response = await fetch(`${API_BASE}/boqs/${encodeURIComponent(boqId)}/quotations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to submit quotation: ${response.status}`);
  }
  return response.json();
}

export async function fetchQuotationByIdApi(quotationId: string): Promise<{ success: boolean; quotation: QuotationRecord }> {
  const response = await fetch(`${API_BASE}/quotations/${encodeURIComponent(quotationId)}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch quotation: ${response.status}`);
  }
  return response.json();
}

export async function acceptQuotationApi(quotationId: string, notes?: string): Promise<{ success: boolean; quotation: QuotationRecord; boq: BOQRecord; message: string }> {
  const response = await fetch(`${API_BASE}/quotations/${encodeURIComponent(quotationId)}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to accept quotation: ${response.status}`);
  }
  return response.json();
}

export async function fetchQuotationComparisonApi(boqId: string, quoteIds?: string[]): Promise<{ success: boolean; comparison: QuotationComparisonMatrix }> {
  const query = quoteIds && quoteIds.length > 0 ? `?quotes=${encodeURIComponent(quoteIds.join(','))}` : '';
  const response = await fetch(`${API_BASE}/boqs/${encodeURIComponent(boqId)}/compare${query}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch quotation comparison: ${response.status}`);
  }
  return response.json();
}

export async function fetchBOQDocumentApi(boqId: string, revision?: number): Promise<{ success: boolean; document: any }> {
  const query = revision ? `?revision=${revision}` : '';
  const response = await fetch(`${API_BASE}/boqs/${encodeURIComponent(boqId)}/document${query}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch BOQ document: ${response.status}`);
  }
  return response.json();
}

// ==========================================
// Public Track Lookup API
// ==========================================

export async function trackRequestApi(idOrRef: string): Promise<{
  success: boolean;
  track: PublicTrackRecord;
}> {
  const response = await fetch(`${API_BASE}/track/${encodeURIComponent(idOrRef.trim())}`);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `No record found for tracking ID: ${idOrRef}`);
  }
  return response.json();
}

// ==========================================
// Provider Enrollment API
// ==========================================

export async function createEnrollmentApi(input: EnrollmentIntakeInput): Promise<{
  success: boolean;
  enrollmentId: string;
  enrollmentReference: string;
  status: string;
  enrollment: EnrollmentRecord;
}> {
  const response = await fetch(`${API_BASE}/enrollments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Server responded with status ${response.status}`);
  }
  return response.json();
}

export async function fetchMyEnrollmentsApi(): Promise<{
  success: boolean;
  count: number;
  enrollments: EnrollmentRecord[];
}> {
  const response = await fetch(`${API_BASE}/enrollments/mine`);
  if (!response.ok) {
    throw new Error(`Failed to fetch my enrollments: ${response.status}`);
  }
  return response.json();
}

export async function fetchAllEnrollmentsApi(status?: string): Promise<{
  success: boolean;
  count: number;
  enrollments: EnrollmentRecord[];
}> {
  const url = status ? `${API_BASE}/enrollments?status=${encodeURIComponent(status)}` : `${API_BASE}/enrollments`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch enrollments: ${response.status}`);
  }
  return response.json();
}

export async function fetchEnrollmentByIdApi(idOrRef: string): Promise<{
  success: boolean;
  enrollment: EnrollmentRecord;
}> {
  const response = await fetch(`${API_BASE}/enrollments/${encodeURIComponent(idOrRef)}`);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to fetch enrollment: ${response.status}`);
  }
  return response.json();
}

export async function approveEnrollmentApi(idOrRef: string, notes?: string): Promise<{
  success: boolean;
  message: string;
  enrollment: EnrollmentRecord;
}> {
  const response = await fetch(`${API_BASE}/enrollments/${encodeURIComponent(idOrRef)}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to approve enrollment: ${response.status}`);
  }
  return response.json();
}

export async function rejectEnrollmentApi(idOrRef: string, reason?: string): Promise<{
  success: boolean;
  message: string;
  enrollment: EnrollmentRecord;
}> {
  const response = await fetch(`${API_BASE}/enrollments/${encodeURIComponent(idOrRef)}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to reject enrollment: ${response.status}`);
  }
  return response.json();
}

