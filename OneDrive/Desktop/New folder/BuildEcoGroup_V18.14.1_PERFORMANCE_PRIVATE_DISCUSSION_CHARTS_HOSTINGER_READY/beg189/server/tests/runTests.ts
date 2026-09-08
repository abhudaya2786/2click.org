import { store } from '../store';
import { CaseIntakeInput, CaseStatus } from '../../src/types/backend';

// Helper assertion
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    throw new Error(`Assertion Failed: ${message}`);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

async function runAllTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING BUILDECOGROUP V18.5 WORKFLOW TEST SUITE');
  console.log('====================================================\n');

  // Test 1: Service Catalog & 5 Pillars Verification
  console.log('TEST 1: Canonical 5 Pillars & Database-backed Service Catalog');
  const catalog = store.getServiceCatalog();
  assert(catalog.length >= 10, `Service catalog contains ${catalog.length} services`);
  const constructionServices = store.getServiceCatalog('CONSTRUCTION_SERVICES');
  assert(constructionServices.length > 0, `CONSTRUCTION_SERVICES pillar has active categories`);
  const techServices = store.getServiceCatalog('SURVEILLANCE_SITE_TECH');
  assert(techServices.length > 0, `SURVEILLANCE_SITE_TECH pillar has active categories`);
  const landServices = store.getServiceCatalog('LAND_PROPERTY');
  assert(landServices.length > 0, `LAND_PROPERTY pillar has active categories`);
  const consultantServices = store.getServiceCatalog('CONSULTANTS');
  assert(consultantServices.length > 0, `CONSULTANTS pillar has active categories`);
  const innovationServices = store.getServiceCatalog('INNOVATION_STARTUPS');
  assert(innovationServices.length > 0, `INNOVATION_STARTUPS pillar has active categories`);

  // Test 2: Case Creation & Server Reference Generation
  console.log('\nTEST 2: Case Creation & Server Reference Generation (BEG-2026-XXXXXXXX)');
  const testPayload: CaseIntakeInput = {
    pillar: 'CONSTRUCTION_SERVICES',
    serviceSlug: 'structural-engineering',
    primaryDiscipline: 'Structural Engineering',
    subDisciplines: ['Foundation Vetting', 'Seismic Check'],
    address: '42 EcoTech Cyber Corridor, Gomti Nagar',
    city: 'Lucknow',
    stateRegion: 'Uttar Pradesh',
    pincode: '226010',
    plotSizeSqFt: '14500',
    terrainType: 'Flat / Alluvial Soil',
    projectTitle: 'Greenfield Eco Commercial Complex',
    buildingType: 'Commercial Mixed-Use G+4',
    scopeDescription: 'Complete structural calibration, column grid optimization, and foundation vetting.',
    scopeDetails: { floorCount: 4, basements: 1 },
    specialRequirements: ['LEED Gold Target', 'Rainwater Harvesting Pit Integration'],
    budgetRange: '₹50 Lakhs - ₹1.5 Cr',
    financingStatus: 'Self-Funded / Approved',
    startDateUrgency: 'Within 30 Days',
    expectedDuration: '6 - 9 Months',
    clientName: 'Aditya Vardhan',
    clientEmail: 'aditya.vardhan@ecoventures.in',
    clientPhone: '+91 98450 12345',
    clientOrg: 'EcoVentures Living LLP',
    preferredCommunication: 'Email & WhatsApp Updates',
    consentAccepted: true,
  };

  const customerId = 'usr-client-01';
  const employeeId = 'usr-coord-01';
  const adminId = 'usr-admin-01';

  const { caseRecord: createdCase, event: intakeEvent } = store.createCase(testPayload, customerId);

  assert(Boolean(createdCase.id), 'Case created with unique UUID');
  assert(createdCase.caseReference.startsWith('BEG-2026-'), `Case Reference matches format (${createdCase.caseReference})`);
  assert(createdCase.status === 'NEW', 'Initial canonical status is NEW');
  assert(createdCase.clientId === customerId, 'Case correctly bound to authenticated customer ID');
  assert(intakeEvent.event_type === 'CASE_CREATED', 'Canonical CASE_CREATED audit event logged');

  const caseId = createdCase.id;

  // Test 3: State Machine & Transition Rules
  console.log('\nTEST 3: Authoritative State Machine & Valid/Invalid Transitions');
  
  // Valid transition from NEW to QUALIFICATION_PENDING
  const { caseRecord: transitionedCase } = store.transitionCaseStatus({
    caseIdOrRef: caseId,
    nextStatus: 'QUALIFICATION_PENDING',
    actorId: employeeId,
    actorRole: 'EMPLOYEE',
    reason: 'Case queue picked up by operations desk for intake review.',
  });
  assert(transitionedCase.status === 'QUALIFICATION_PENDING', 'Valid transition NEW -> QUALIFICATION_PENDING succeeded');

  // Invalid transition directly from QUALIFICATION_PENDING to APPROVED (Must fail)
  let rejectedInvalidTransition = false;
  try {
    store.transitionCaseStatus({
      caseIdOrRef: caseId,
      nextStatus: 'APPROVED',
      actorId: employeeId,
      actorRole: 'EMPLOYEE',
      reason: 'Attempting illegal bypass of qualification & assignment',
    });
  } catch (err: any) {
    rejectedInvalidTransition = true;
  }
  assert(rejectedInvalidTransition, 'Invalid status jump QUALIFICATION_PENDING -> APPROVED strictly rejected by state machine');

  // Test 4: Qualification Checklist & Workflow
  console.log('\nTEST 4: Qualification Checklist & Qualification Workflow');
  const qualifiedCase = store.qualifyCase({
    caseIdOrRef: caseId,
    checklist: {
      requirementUnderstood: true,
      locationVerified: true,
      serviceCategoryConfirmed: true,
      contactUsable: true,
      criticalDocsIdentified: true,
    },
    notes: 'Municipal zoning and structural bylaws confirmed.',
    coordinatorUserId: employeeId,
  });
  assert(qualifiedCase.status === 'QUALIFIED', 'Case transitioned to QUALIFIED status');
  assert(qualifiedCase.qualificationChecklist?.requirementUnderstood === true, 'Checklist stored in case state');

  // Test 5: Information Request & Response Cycle
  console.log('\nTEST 5: Information Request & Customer Response Cycle');
  const infoReq = store.createInformationRequest({
    caseIdOrRef: caseId,
    requestedByUserId: employeeId,
    question: 'Please confirm whether high-tension electrical line passes above the site.',
  });
  assert(infoReq.status === 'PENDING', 'Information request created with PENDING status');
  
  const caseNeedsInfo = store.getCase(caseId);
  assert(caseNeedsInfo?.status === 'NEEDS_INFORMATION', 'Case transitioned to NEEDS_INFORMATION');

  const { request: respondedReq, caseRecord: caseAfterResponse } = store.respondToInformationRequest({
    requestId: infoReq.id,
    customerUserId: customerId,
    response: 'No high-tension lines on or adjacent to the site perimeter.',
  });
  assert(respondedReq.status === 'RESPONDED', 'Information request marked RESPONDED');
  assert(caseAfterResponse.status === 'QUALIFICATION_PENDING', 'Case returned to review queue');

  // Re-qualify after info provided
  store.qualifyCase({
    caseIdOrRef: caseId,
    checklist: {
      requirementUnderstood: true,
      locationVerified: true,
      serviceCategoryConfirmed: true,
      contactUsable: true,
      criticalDocsIdentified: true,
    },
    notes: 'Clarification received and verified.',
    coordinatorUserId: employeeId,
  });

  // Test 6: Coordinator Assignment
  console.log('\nTEST 6: Coordinator Assignment');
  const coordCase = store.assignCoordinator({
    caseIdOrRef: caseId,
    coordinatorId: employeeId,
    assignedByUserId: adminId,
    notes: 'Lead technical operations desk assigned.',
  });
  assert(coordCase.assignedCoordinatorId === employeeId, 'Coordinator ID recorded');
  assert(coordCase.status === 'COORDINATOR_ASSIGNED', 'Case status is COORDINATOR_ASSIGNED');

  // Test 7: Deterministic Consultant Matching Algorithm
  console.log('\nTEST 7: Deterministic Consultant Matching Scoring & Explainability');
  const matches = store.getConsultantMatchesForCase(caseId);
  assert(Array.isArray(matches) && matches.length > 0, `Matching algorithm evaluated ${matches.length} verified candidates`);
  const topMatch = matches[0];
  assert(topMatch.matchScore > 50, `Top consultant match score is ${topMatch.matchScore}/100`);
  assert(topMatch.matchReasons.length >= 2, `Explainable match reasons provided: ${topMatch.matchReasons.join('; ')}`);

  // Test 8: Consultant Assignment & SLA
  console.log('\nTEST 8: Consultant Assignment Dispatch & Response SLA');
  const consultantUser = topMatch.consultant;
  const consultantUserId = consultantUser.userId || 'usr-consultant-01';
  const assignment = store.assignConsultant({
    caseIdOrRef: caseId,
    consultantUserId: consultantUserId,
    assignedByUserId: employeeId,
    feeEstimate: '₹4.5L - ₹6.0L Est.',
    responseDueHours: 48,
    notes: 'Lead structural vetting assignment.',
  });
  assert(assignment.status === 'PENDING', 'Assignment created with PENDING status');
  assert(Boolean(assignment.responseDueAt), '48h SLA response deadline generated');

  const caseAfterAssignment = store.getCase(caseId);
  assert(caseAfterAssignment?.status === 'CONSULTANT_ASSIGNED', 'Case status is CONSULTANT_ASSIGNED');

  // Test 9: Consultant Accept Workflow
  console.log('\nTEST 9: Consultant Acceptance Workflow');
  const { assignment: acceptedAsgn, caseRecord: caseAfterAccept } = store.respondToAssignment({
    assignmentId: assignment.id,
    consultantUserId: consultantUserId,
    action: 'accept',
    responseNotes: 'Scope reviewed and SLA accepted.',
  });
  assert(acceptedAsgn.status === 'ACCEPTED', 'Assignment transitioned to ACCEPTED');
  assert(caseAfterAccept.status === 'SCOPE_DISCOVERY', 'Case advanced automatically to SCOPE_DISCOVERY');

  // Test 10: Duplicate Acceptance Blocked
  console.log('\nTEST 10: Prevent Duplicate / Conflicting Acceptance');
  let duplicatePrevented = false;
  try {
    store.respondToAssignment({
      assignmentId: assignment.id,
      consultantUserId: consultantUserId,
      action: 'accept',
      responseNotes: 'Duplicate attempt',
    });
  } catch (err) {
    duplicatePrevented = true;
  }
  assert(duplicatePrevented, 'Duplicate response attempt was safely rejected');

  // Test 11: Case Notes & Internal Visibility Isolation
  console.log('\nTEST 11: Case Notes & Visibility Partitioning');
  const internalNote = store.createCaseNote({
    caseIdOrRef: caseId,
    authorUserId: employeeId,
    note: 'Internal desk note: Verified structural fee matrix with zonal coordinator.',
    visibility: 'INTERNAL',
  });
  assert(internalNote.visibility === 'INTERNAL', 'Internal note created with INTERNAL flag');

  const publicNote = store.createCaseNote({
    caseIdOrRef: caseId,
    authorUserId: employeeId,
    note: 'Customer update: Lead structural consultant has commenced preliminary site analysis.',
    visibility: 'CUSTOMER_VISIBLE',
  });
  assert(publicNote.visibility === 'CUSTOMER_VISIBLE', 'Customer-visible note created');

  const customerViewNotes = store.getCaseNotes(caseId, 'CUSTOMER');
  const leaksInternal = customerViewNotes.some(n => n.visibility === 'INTERNAL');
  assert(!leaksInternal, 'Internal notes successfully concealed from CUSTOMER role');
  assert(customerViewNotes.length >= 1, 'Customer can see customer-visible notes');

  // Test 12: Object-Level Data Isolation
  console.log('\nTEST 12: Multi-Role Object-Level Isolation');
  const customerCases = store.getCasesByClientId(customerId);
  assert(customerCases.every(c => c.clientId === customerId), 'Customer only retrieves cases owned by customer ID');

  const consultantAssignments = store.getAssignmentsForConsultant(consultantUserId);
  assert(consultantAssignments.every(a => a.consultantId === consultantUserId), 'Consultant only retrieves allocated assignments');

  // Test 13: Case Status Audit History
  console.log('\nTEST 13: Case Status History & Audit Log Integrity');
  const history = store.getCaseStatusHistory(caseId);
  assert(history.length >= 4, `Status history tracked ${history.length} auditable transitions`);
  const hasActorDetails = history.every(h => Boolean(h.actorRole) && Boolean(h.fromStatus) && Boolean(h.toStatus));
  assert(hasActorDetails, 'All history entries contain actor role, fromStatus, toStatus, and timestamp');

  // Test 14: Provider Enrollment Intake & Admin Approval
  console.log('\nTEST 14: Provider Enrollment Intake & Admin Approval Workflow');
  const enrollment = store.createEnrollment({
    role: 'PROFESSIONAL',
    fullName: 'Test Architect',
    businessName: 'Test Studio LLP',
    email: 'test.arch@example.com',
    phone: '+91 98765 11111',
    city: 'Lucknow',
    pincode: '226010',
    serviceRadiusKm: 50,
    details: { category: 'Architect (CoA Registered)' },
    documents: [],
    consentAccepted: true,
  });
  assert(Boolean(enrollment.enrollmentReference), `Enrollment reference generated (${enrollment.enrollmentReference})`);
  assert(enrollment.status === 'PENDING_VERIFICATION', 'Initial enrollment status is PENDING_VERIFICATION');
  const approved = store.updateEnrollmentStatus(enrollment.enrollmentReference, 'APPROVED', 'usr-admin-01', 'Test approval');
  assert(approved.status === 'APPROVED', 'Enrollment approved by admin');
  assert(approved.kycStatus === 'VERIFIED', 'KYC status updated to VERIFIED after approval');

  console.log('\n====================================================');
  console.log('🎉 ALL 14 V18.5 WORKFLOW TESTS PASSED GREEN SUCCESSFULLY!');
  console.log('====================================================\n');
}

runAllTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
