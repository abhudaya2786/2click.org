/**
 * Role & Privacy QA — HTTP integration tests
 * Run: node --import tsx server/tests/rolePrivacyTests.ts
 */
const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

const SEED = {
  caseOwner: 'aditya.vardhan@ecoventures.in',
  otherCustomer: 'customer.test@example.com',
  assignedConsultant: 'elena.rostova@beg-partner.in',
  unassignedConsultant: 'marcus.chen@bioclimatic-studio.com',
  coordinator: 'coordinator@buildecogroup.in',
  admin: 'admin@buildecogroup.in',
  superAdmin: 'superadmin@buildecogroup.in',
  vendor: 'supply@ultratech-direct.in',
  suspended: 'suspended.user@example.com',
  caseId: 'BEG-4092',
  boqId: 'boq-demo-01',
  quoteId: 'quo-demo-01',
};

function devMockToken(email: string): string {
  const payload = JSON.stringify({ email, uid: `uid-dev-${email.replace(/[^a-zA-Z0-9]/g, '_')}`, ts: Date.now() });
  return `dev-mock-token:${Buffer.from(payload).toString('base64')}`;
}

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${msg}`);
  }
}

async function sessionLogin(email: string) {
  const res = await fetch(`${BASE}/api/auth/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, idToken: devMockToken(email) }),
  });
  const data = await res.json();
  const cookie = res.headers.get('set-cookie') || '';
  return { status: res.status, data, cookie, ok: res.ok };
}

async function api(path: string, opts: { method?: string; cookie?: string; body?: unknown } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: opts.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.cookie ? { Cookie: opts.cookie } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function main() {
  console.log('\n=== Role & Privacy QA Tests ===\n');

  // --- VISITOR (unauthenticated) ---
  console.log('VISITOR (no session)');
  const vCases = await api('/api/cases');
  assert(vCases.status === 401, 'Visitor → GET /cases → 401');

  const vMe = await api('/api/auth/me');
  assert(vMe.status === 401, 'Visitor → GET /auth/me → 401');

  const vAdmin = await api('/api/admin/users');
  assert(vAdmin.status === 401, 'Visitor → GET /admin/users → 401');

  const vBoq = await api(`/api/boqs/${SEED.boqId}`);
  assert(vBoq.status === 401, 'Visitor → GET /boqs/:id → 401');

  const vTrack = await api(`/api/track/${SEED.caseId}`);
  assert(vTrack.status === 200 && vTrack.data.success, 'Visitor → GET /track/:caseId → 200 (public summary)');
  assert(!vTrack.data.track?.clientEmail, 'Visitor → track hides clientEmail');
  assert(!vTrack.data.track?.clientPhone, 'Visitor → track hides clientPhone');
  assert(vTrack.data.track?.isFullAccess === false, 'Visitor → track isFullAccess=false');

  const vDb = await api('/api/db/status');
  assert(vDb.status === 401, 'Visitor → GET /db/status → 401');

  // --- Login all roles ---
  const owner = await sessionLogin(SEED.caseOwner);
  const other = await sessionLogin(SEED.otherCustomer);
  const elena = await sessionLogin(SEED.assignedConsultant);
  const marcus = await sessionLogin(SEED.unassignedConsultant);
  const coord = await sessionLogin(SEED.coordinator);
  const admin = await sessionLogin(SEED.admin);
  const superA = await sessionLogin(SEED.superAdmin);
  const vendor = await sessionLogin(SEED.vendor);
  const suspended = await sessionLogin(SEED.suspended);

  assert(owner.ok, 'Case owner login');
  assert(other.ok, 'Other customer login');
  assert(elena.ok, 'Assigned consultant login');
  assert(marcus.ok, 'Unassigned consultant login');
  assert(admin.ok, 'Admin login');
  assert(superA.ok, 'Super Admin login');

  // --- CUSTOMER ownership ---
  console.log('\nCUSTOMER — Case isolation (IDOR)');
  const ownerCase = await api(`/api/cases/${SEED.caseId}`, { cookie: owner.cookie });
  assert(ownerCase.status === 200, 'Owner → GET own case → 200');

  const otherCase = await api(`/api/cases/${SEED.caseId}`, { cookie: other.cookie });
  assert(otherCase.status === 403, 'Other customer → GET foreign case → 403');

  const otherMsgs = await api(`/api/cases/${SEED.caseId}/messages`, { cookie: other.cookie });
  assert(otherMsgs.status === 403, 'Other customer → GET foreign messages → 403');

  const otherNotes = await api(`/api/cases/${SEED.caseId}/notes`, { cookie: other.cookie });
  assert(otherNotes.status === 403, 'Other customer → GET foreign notes → 403');

  // --- BOQ IDOR ---
  console.log('\nBOQ / Quotation visibility');
  const ownerBoq = await api(`/api/boqs/${SEED.boqId}`, { cookie: owner.cookie });
  assert(ownerBoq.status === 200, 'Owner → GET own BOQ → 200');

  const otherBoq = await api(`/api/boqs/${SEED.boqId}`, { cookie: other.cookie });
  assert(otherBoq.status === 403, 'Other customer → GET foreign BOQ → 403');

  const otherQuote = await api(`/api/quotations/${SEED.quoteId}`, { cookie: other.cookie });
  assert(otherQuote.status === 403, 'Other customer → GET foreign quotation → 403');

  const otherCompare = await api(`/api/boqs/${SEED.boqId}/compare`, { cookie: other.cookie });
  assert(otherCompare.status === 403, 'Other customer → GET BOQ compare → 403');

  const otherBoqDoc = await api(`/api/boqs/${SEED.boqId}/document`, { cookie: other.cookie });
  assert(otherBoqDoc.status === 403, 'Other customer → GET BOQ document → 403');

  const ownerQuotes = await api(`/api/boqs/${SEED.boqId}/quotations`, { cookie: owner.cookie });
  assert(ownerQuotes.status === 200 && ownerQuotes.data.count >= 1, 'Owner → list quotations → 200');

  const otherQuotes = await api(`/api/boqs/${SEED.boqId}/quotations`, { cookie: other.cookie });
  assert(otherQuotes.status === 403, 'Other customer → list quotations → 403');

  // --- CONSULTANT assignment ---
  console.log('\nCONSULTANT — Assignment scope');
  const elenaCase = await api(`/api/cases/${SEED.caseId}`, { cookie: elena.cookie });
  assert(elenaCase.status === 200, 'Assigned consultant → GET case → 200');
  assert(!elenaCase.data.case?.clientPhone, 'Assigned consultant → case hides customer phone');
  assert(!elenaCase.data.case?.clientEmail, 'Assigned consultant → case hides customer email');

  const elenaCaseList = await api('/api/cases', { cookie: elena.cookie });
  assert(elenaCaseList.status === 200, 'Assigned consultant → GET assigned case list → 200');
  assert(elenaCaseList.data.cases?.every((row: any) => !row.clientPhone && !row.clientEmail), 'Consultant case list → hides all customer direct contact details');

  const marcusCase = await api(`/api/cases/${SEED.caseId}`, { cookie: marcus.cookie });
  assert(marcusCase.status === 403, 'Unassigned consultant → GET case → 403');

  const marcusBoq = await api(`/api/boqs/${SEED.boqId}`, { cookie: marcus.cookie });
  assert(marcusBoq.status === 403, 'Unassigned consultant → GET BOQ → 403');

  // --- ADMIN / SUPER ADMIN ---
  console.log('\nADMIN / SUPER ADMIN permissions');
  const adminCase = await api(`/api/cases/${SEED.caseId}`, { cookie: admin.cookie });
  assert(adminCase.status === 200, 'Admin → GET any case → 200');

  const adminUsers = await api('/api/admin/users', { cookie: admin.cookie });
  assert(adminUsers.status === 200, 'Admin → GET /admin/users → 200');

  const adminRoleChange = await api(`/api/admin/users/usr-client-02/role`, {
    method: 'POST',
    cookie: admin.cookie,
    body: { newRole: 'ADMIN', reason: 'QA test attempt' },
  });
  assert(adminRoleChange.status === 403, 'Admin → POST role change → 403 (Super Admin only)');

  const superRoleChange = await api(`/api/admin/users/usr-client-02/role`, {
    method: 'POST',
    cookie: superA.cookie,
    body: { newRole: 'CONSULTANT', reason: 'QA privacy test' },
  });
  assert(superRoleChange.status === 200 || superRoleChange.status === 400, 'Super Admin → POST role change → allowed (200/400)');

  const coordQueue = await api('/api/coordinator/queue/qualification', { cookie: coord.cookie });
  assert(coordQueue.status === 200, 'Coordinator (EMPLOYEE) → qualification queue → 200');

  const customerQueue = await api('/api/coordinator/queue/qualification', { cookie: owner.cookie });
  assert(customerQueue.status === 403, 'Customer → coordinator queue → 403');

  const adminCommercial = await api('/api/commercial/rules', { cookie: admin.cookie });
  assert(adminCommercial.status === 200, 'Admin → commercial rules → 200');

  const customerCommercial = await api('/api/commercial/rules', { cookie: owner.cookie });
  assert(customerCommercial.status === 403, 'Customer → commercial rules → 403');

  // --- VENDOR (seed uses EMPLOYEE role) ---
  console.log('\nVENDOR / Supplier access');
  const vendorCaseList = await api('/api/cases', { cookie: vendor.cookie });
  assert(vendorCaseList.status === 200, 'Vendor (EMPLOYEE) → GET /cases → 200 (ops role)');
  const vendorForeignBoqRead = await api(`/api/boqs/${SEED.boqId}`, { cookie: vendor.cookie });
  assert(vendorForeignBoqRead.status === 200, 'Vendor (EMPLOYEE) → can read BOQ (ops visibility)');

  // --- Privacy: authenticated track ---
  console.log('\nPrivacy — contact data');
  const ownerTrack = await api(`/api/track/${SEED.caseId}`, { cookie: owner.cookie });
  assert(ownerTrack.data.track?.clientEmail === 'aditya.vardhan@ecoventures.in', 'Owner → track shows own email');
  assert(!!ownerTrack.data.track?.clientPhone, 'Owner → track shows own phone');

  const consultantTrack = await api(`/api/track/${SEED.caseId}`, { cookie: elena.cookie });
  assert(!consultantTrack.data.track?.clientEmail, 'Consultant → track hides customer email');
  assert(!consultantTrack.data.track?.clientPhone, 'Consultant → track hides customer phone');

  const otherTrack = await api(`/api/track/${SEED.caseId}`, { cookie: other.cookie });
  assert(!otherTrack.data.track?.clientEmail, 'Other customer → track hides email');
  assert(otherTrack.data.track?.isFullAccess === false, 'Other customer → track denied full access');

  const health = await api('/api/health');
  assert(!JSON.stringify(health.data).includes('aditya.vardhan'), 'Health endpoint → no user emails leaked');

  // --- Role escalation ---
  console.log('\nRole escalation attempts');
  const regEscalation = await fetch(`${BASE}/api/auth/register-customer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stakeholderType: 'CLIENT',
      fullName: 'QA Escalation Test',
      email: `qa.escalation.${Date.now()}@test.example.com`,
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!',
      phone: '+91 9876010099',
      city: 'Lucknow',
      stateRegion: 'Uttar Pradesh',
      pincode: '226010',
      country: 'India',
      preferredLanguage: 'English',
      projectScale: 'Residential Eco-Villa (2,000 - 6,000 sq ft)',
      primaryPurpose: 'New Project / Requirement',
      projectStage: 'Planning / Feasibility',
      budgetRange: 'Not decided yet',
      interests: ['Parametric Normalized BOQ'],
      termsAccepted: true,
      privacyAccepted: true,
      ndaAccepted: true,
      escrowAccepted: true,
      role: 'SUPER_ADMIN',
      idToken: devMockToken(`qa.escalation.${Date.now()}@test.example.com`),
    }),
  });
  const regData = await regEscalation.json();
  assert(regEscalation.status === 201 && regData.user?.role === 'CUSTOMER', 'Registration role injection → coerced to CUSTOMER');

  const custAdminAttempt = await api('/api/admin/users', {
    method: 'GET',
    cookie: other.cookie,
  });
  assert(custAdminAttempt.status === 403, 'Customer → admin users list → 403');

  // --- Suspended account ---
  console.log('\nSuspended account');
  if (suspended.status === 403) {
    assert(true, 'Suspended user → login blocked → 403');
  } else {
    const suspMe = await api('/api/auth/me', { cookie: suspended.cookie });
    assert(suspMe.status === 403, 'Suspended user → /me → 403');
  }

  // --- BOQ mutation IDOR ---
  console.log('\nBOQ mutation IDOR');
  const otherBoqCreate = await api(`/api/cases/${SEED.caseId}/boqs`, {
    method: 'POST',
    cookie: other.cookie,
    body: { title: 'Malicious BOQ', estimateType: 'DETAILED' },
  });
  assert(otherBoqCreate.status === 403, 'Other customer → create BOQ on foreign case → 403');

  const otherBoqRev = await api(`/api/boqs/${SEED.boqId}/revisions`, {
    method: 'POST',
    cookie: other.cookie,
    body: { notes: 'IDOR attempt' },
  });
  assert(otherBoqRev.status === 403, 'Other customer → create BOQ revision → 403');

  // --- Enrollment privacy ---
  console.log('\nEnrollment data');
  const custEnrollments = await api('/api/enrollments', { cookie: owner.cookie });
  assert(custEnrollments.status === 403, 'Customer → list all enrollments → 403');

  const adminEnrollments = await api('/api/enrollments', { cookie: admin.cookie });
  assert(adminEnrollments.status === 200, 'Admin → list enrollments → 200');

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
