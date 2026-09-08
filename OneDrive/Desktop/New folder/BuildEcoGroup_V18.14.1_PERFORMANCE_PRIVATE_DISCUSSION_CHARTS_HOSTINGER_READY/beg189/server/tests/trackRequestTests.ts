/**
 * Targeted tests for /api/track public lookup
 * Run: node --import tsx server/tests/trackRequestTests.ts
 * Requires dev server on localhost:3000 for HTTP tests
 */
import { store } from '../store';

const assert = (ok: boolean, msg: string) => {
  if (!ok) throw new Error(msg);
  console.log('✓', msg);
};

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function login(email: string): Promise<string> {
  const res = await fetch(`${BASE}/api/auth/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const cookie = res.headers.get('set-cookie');
  if (!cookie) throw new Error(`Login failed for ${email}`);
  return cookie.split(';')[0];
}

function runStoreUnitTests() {
  const { caseRecord } = store.createCase({
    pillar: 'CONSTRUCTION_SERVICES',
    serviceSlug: 'structural-engineering',
    primaryDiscipline: 'Structural Engineering',
    subDisciplines: [],
    address: 'Track Test Site, Lucknow',
    city: 'Lucknow',
    stateRegion: 'Uttar Pradesh',
    pincode: '226010',
    plotSizeSqFt: '1200 sq ft',
    terrainType: 'Urban',
    projectTitle: 'Track Test Villa',
    buildingType: 'Villa',
    scopeDescription: 'Track request test case for automated verification.',
    scopeDetails: {},
    specialRequirements: [],
    budgetRange: '₹50 Lakhs',
    financingStatus: 'Self-Funded',
    startDateUrgency: 'Within 1-3 Months',
    expectedDuration: '6 - 9 Months',
    clientName: 'Track Test User',
    clientEmail: 'tracktest@example.com',
    clientPhone: '+91 90000 00001',
    clientOrg: 'Individual Client',
    preferredCommunication: 'Email',
    consentAccepted: true,
  });

  const enrollment = store.createEnrollment({
    role: 'PROFESSIONAL',
    fullName: 'Track Test Architect',
    email: 'track.enroll@example.com',
    phone: '+91 90000 00002',
    city: 'Lucknow',
    pincode: '226010',
    serviceRadiusKm: 50,
    details: {},
    documents: [],
    consentAccepted: true,
  });

  const publicCaseView = store.getTrackView(caseRecord.caseReference);
  assert(publicCaseView !== null && publicCaseView.type === 'CASE', 'Store returns case track view');
  assert(publicCaseView!.clientEmail === undefined, 'Public case view hides client email without auth');
  assert(publicCaseView!.status === 'NEW', 'Case status is NEW');

  const publicEnrView = store.getTrackView(enrollment.enrollmentReference);
  assert(publicEnrView !== null && publicEnrView.type === 'ENROLLMENT', 'Store returns enrollment track view');
  assert(publicEnrView!.clientEmail === undefined, 'Public enrollment view hides email without auth');

  const missing = store.getTrackView('BEG-INVALID-99999');
  assert(missing === null, 'Invalid ID returns null from store');

  const adminUser = store.findUserByEmail('admin@buildecogroup.in');
  const fullCaseView = store.getTrackView(caseRecord.caseReference, adminUser);
  assert(fullCaseView!.isFullAccess === true, 'Admin gets full access on case track view');
  assert(fullCaseView!.clientEmail === 'tracktest@example.com', 'Admin sees client email');

  const customerUser = store.findUserByEmail('customer.test@example.com');
  const deniedCase = store.getTrackView(caseRecord.caseReference, customerUser);
  assert(deniedCase!.isFullAccess === false, 'Unrelated customer cannot see private case data');
}

async function runHttpTests() {
  const health = await fetch(`${BASE}/api/health`);
  if (!health.ok) throw new Error('server down');

  const caseRes = await fetch(`${BASE}/api/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pillar: 'CONSTRUCTION_SERVICES',
      serviceSlug: 'structural-engineering',
      primaryDiscipline: 'Structural Engineering',
      subDisciplines: [],
      address: 'HTTP Track Test Site, Lucknow',
      city: 'Lucknow',
      stateRegion: 'Uttar Pradesh',
      pincode: '226010',
      plotSizeSqFt: '1200 sq ft',
      terrainType: 'Urban',
      projectTitle: 'HTTP Track Test Villa',
      buildingType: 'Villa',
      scopeDescription: 'HTTP track request test case.',
      scopeDetails: {},
      specialRequirements: [],
      budgetRange: '₹50 Lakhs',
      financingStatus: 'Self-Funded',
      startDateUrgency: 'Within 1-3 Months',
      expectedDuration: '6 - 9 Months',
      clientName: 'HTTP Track User',
      clientEmail: 'http.track@example.com',
      clientPhone: '+91 90000 00003',
      clientOrg: 'Individual Client',
      preferredCommunication: 'Email',
      consentAccepted: true,
    }),
  });
  const caseData = await caseRes.json();
  assert(caseRes.status === 201, `Case created on server: ${caseData.caseReference}`);
  const caseRef = caseData.caseReference;

  const enrRes = await fetch(`${BASE}/api/enrollments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'PROFESSIONAL',
      fullName: 'HTTP Track Architect',
      email: 'http.track.enroll@example.com',
      phone: '+91 90000 00004',
      city: 'Lucknow',
      pincode: '226010',
      serviceRadiusKm: 50,
      details: {},
      documents: [],
      consentAccepted: true,
    }),
  });
  const enrData = await enrRes.json();
  assert(enrRes.status === 201, `Enrollment created on server: ${enrData.enrollmentReference}`);
  const enrRef = enrData.enrollmentReference;

  const trackCaseRes = await fetch(`${BASE}/api/track/${caseRef}`);
  const trackCaseData = await trackCaseRes.json();
  assert(trackCaseRes.status === 200, 'GET /api/track case returns 200');
  assert(trackCaseData.track.reference === caseRef, 'API returns correct case reference');
  assert(!trackCaseData.track.clientEmail, 'API public response hides client email');

  const trackEnrRes = await fetch(`${BASE}/api/track/${enrRef}`);
  const trackEnrData = await trackEnrRes.json();
  assert(trackEnrRes.status === 200, 'GET /api/track enrollment returns 200');
  assert(trackEnrData.track.type === 'ENROLLMENT', 'API returns enrollment type');

  const badRes = await fetch(`${BASE}/api/track/BEG-FAKE-INVALID-ID`);
  assert(badRes.status === 404, 'Invalid ID returns 404');

  const adminCookie = await login('admin@buildecogroup.in');
  const adminTrackRes = await fetch(`${BASE}/api/track/${caseRef}`, {
    headers: { Cookie: adminCookie },
  });
  const adminTrack = await adminTrackRes.json();
  assert(adminTrack.track.isFullAccess === true, 'Authenticated admin gets full access via API');
  assert(adminTrack.track.clientEmail === 'http.track@example.com', 'Admin API sees client email');

  const customerCookie = await login('customer.test@example.com');
  const custTrackRes = await fetch(`${BASE}/api/track/${caseRef}`, {
    headers: { Cookie: customerCookie },
  });
  const custTrack = await custTrackRes.json();
  assert(custTrack.track.isFullAccess === false, 'Unauthorized customer denied private case data');

  const refreshRes = await fetch(`${BASE}/api/track/${caseRef}`);
  const refreshData = await refreshRes.json();
  assert(refreshData.track.status === trackCaseData.track.status, 'Refresh returns consistent authoritative status');
}

async function main() {
  console.log('=== Track Request API Tests ===\n');

  console.log('--- Store unit tests ---');
  runStoreUnitTests();

  console.log('\n--- HTTP API tests (server process) ---');
  try {
    await runHttpTests();
    console.log('\n=== ALL TRACK REQUEST TESTS PASSED ===');
  } catch (e: any) {
    if (e.message === 'server down') {
      console.log('\n⚠ HTTP tests skipped (server not running). Store unit tests passed.');
    } else {
      throw e;
    }
  }
}

main().catch((err) => {
  console.error('\n✗ TRACK TEST FAILED:', err.message);
  process.exit(1);
});
