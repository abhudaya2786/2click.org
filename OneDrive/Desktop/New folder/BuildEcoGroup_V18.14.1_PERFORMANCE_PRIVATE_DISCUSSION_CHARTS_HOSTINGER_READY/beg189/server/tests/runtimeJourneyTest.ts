/**
 * Runtime integration test for case intake + enrollment APIs
 * Run: node --import tsx server/tests/runtimeJourneyTest.ts
 */
const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function login(email: string): Promise<string> {
  const res = await fetch(`${BASE}/api/auth/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Login failed for ${email}: ${data.error}`);
  const cookie = res.headers.get('set-cookie');
  if (!cookie) throw new Error(`No session cookie for ${email}`);
  return cookie.split(';')[0];
}

function authHeaders(cookie: string) {
  return { 'Content-Type': 'application/json', Cookie: cookie };
}

function assert(ok: boolean, msg: string) {
  if (!ok) throw new Error(msg);
  console.log('✓', msg);
}

async function main() {
  console.log('=== Runtime Journey API Test ===\n');

  // 1. Create case (unauthenticated - public intake)
  const caseRes = await fetch(`${BASE}/api/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pillar: 'CONSTRUCTION_SERVICES',
      serviceSlug: 'turnkey-contracting',
      primaryDiscipline: 'Turnkey Construction',
      subDisciplines: [],
      address: 'Sector 7, Gomti Nagar, Lucknow',
      city: 'Lucknow',
      stateRegion: 'Uttar Pradesh',
      pincode: '226010',
      plotSizeSqFt: '2,400 sq ft',
      terrainType: 'Urban / Semi-Urban Developable Land',
      projectTitle: 'Test Villa Construction • Lucknow',
      buildingType: 'Residential Multi-Floor Villa',
      scopeDescription: 'Runtime test case submission via DynamicQueryForm mapper equivalent payload.',
      scopeDetails: { formSource: 'runtimeJourneyTest' },
      budgetRange: '₹75 Lakhs - ₹1.2 Crore',
      startDateUrgency: 'Within 1-3 Months',
      clientName: 'Runtime Test Customer',
      clientEmail: 'runtime.test@example.com',
      clientPhone: '+91 98765 00001',
      consentAccepted: true,
    }),
  });
  const caseData = await caseRes.json();
  assert(caseRes.status === 201, `Case created: ${caseData.caseReference}`);
  const caseRef = caseData.caseReference;

  // 2. Create enrollment (unauthenticated)
  const enrRes = await fetch(`${BASE}/api/enrollments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'PROFESSIONAL',
      fullName: 'Runtime Test Architect',
      businessName: 'Test Design Studio',
      email: 'runtime.provider@example.com',
      phone: '+91 98765 00002',
      city: 'Lucknow',
      pincode: '226010',
      serviceRadiusKm: 50,
      details: { category: 'Architect (CoA Registered)' },
      documents: [],
      consentAccepted: true,
    }),
  });
  const enrData = await enrRes.json();
  assert(enrRes.status === 201, `Enrollment created: ${enrData.enrollmentReference}`);
  const enrRef = enrData.enrollmentReference;

  // 3. Admin login and verify case + enrollment visible
  const adminCookie = await login('admin@buildecogroup.in');

  const adminCasesRes = await fetch(`${BASE}/api/cases`, { headers: authHeaders(adminCookie) });
  const adminCases = await adminCasesRes.json();
  assert(
    adminCases.cases.some((c: any) => c.caseReference === caseRef),
    `Admin sees case ${caseRef}`
  );

  const adminEnrRes = await fetch(`${BASE}/api/enrollments`, { headers: authHeaders(adminCookie) });
  const adminEnr = await adminEnrRes.json();
  assert(
    adminEnr.enrollments.some((e: any) => e.enrollmentReference === enrRef),
    `Admin sees enrollment ${enrRef}`
  );

  // 4. Admin approves enrollment
  const approveRes = await fetch(`${BASE}/api/enrollments/${enrRef}/approve`, {
    method: 'POST',
    headers: authHeaders(adminCookie),
    body: JSON.stringify({ notes: 'Runtime test approval' }),
  });
  const approveData = await approveRes.json();
  assert(approveRes.ok && approveData.enrollment.status === 'APPROVED', `Enrollment ${enrRef} approved`);

  // 5. Super Admin login
  const superCookie = await login('superadmin@buildecogroup.in');
  const superCasesRes = await fetch(`${BASE}/api/cases`, { headers: authHeaders(superCookie) });
  const superCases = await superCasesRes.json();
  assert(
    superCases.cases.some((c: any) => c.caseReference === caseRef),
    `Super Admin sees case ${caseRef}`
  );

  // 6. Employee/coordinator sees cases
  const coordCookie = await login('coordinator@buildecogroup.in');
  const coordCasesRes = await fetch(`${BASE}/api/cases`, { headers: authHeaders(coordCookie) });
  const coordCases = await coordCasesRes.json();
  assert(
    coordCases.cases.some((c: any) => c.caseReference === caseRef),
    `Coordinator sees case ${caseRef}`
  );

  // 7. Health check
  const healthRes = await fetch(`${BASE}/api/health`);
  const health = await healthRes.json();
  assert(health.status === 'ok' || health.status === 'degraded', `Health endpoint OK (${health.status})`);

  console.log('\n=== ALL RUNTIME JOURNEY API TESTS PASSED ===');
}

main().catch((err) => {
  console.error('\n✗ RUNTIME TEST FAILED:', err.message);
  process.exit(1);
});
