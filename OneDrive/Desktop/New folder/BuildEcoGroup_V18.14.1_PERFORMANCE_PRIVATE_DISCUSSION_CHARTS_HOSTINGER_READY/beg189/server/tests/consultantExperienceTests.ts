/**
 * Consultant Experience Tests — featured consultants, assignments, case isolation
 * Run: node --import tsx server/tests/consultantExperienceTests.ts
 */
import express from 'express';
import cookieParser from 'cookie-parser';
import { apiRouter } from '../routes';
import { authenticateSession } from '../middleware/auth';

let BASE = process.env.TEST_BASE_URL || '';

async function startTestServer() {
  if (BASE) return { close: async () => {} };

  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(authenticateSession);
  app.use('/api', apiRouter);

  const server = await new Promise<import('http').Server>((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  BASE = `http://127.0.0.1:${port}`;
  return {
    close: async () => {
      await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
    },
  };
}

const SEED = {
  abbhudaya: 'abbhudaya@buildecogroup.in',
  abhishek: 'abhishek.mishra@buildecogroup.in',
  superAdmin: 'superadmin@buildecogroup.in',
  abbAssignedCase: 'BEG-2026-A1B2C3',
  abbActiveCase: 'BEG-2026-D4E5F6',
  abhOfferedCase: 'BEG-2026-G7H8I9',
  abhBoqCase: 'BEG-2026-J1K2L3',
  abhCompletedCase: 'BEG-2026-M4N5O6',
  elenaCase: 'BEG-4092',
};

function devMockToken(email: string): string {
  const payload = JSON.stringify({ email, uid: `uid-dev-${email.replace(/[^a-zA-Z0-9]/g, '_')}`, ts: Date.now() });
  return `dev-mock-token:${Buffer.from(payload).toString('base64')}`;
}

function extractSessionCookie(setCookie: string): string {
  const match = setCookie.match(/beg_session=[^;]+/);
  return match ? match[0] : setCookie.split(';')[0];
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
  const cookie = extractSessionCookie(res.headers.get('set-cookie') || '');
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
  console.log('\n=== Consultant Experience Tests ===\n');

  const harness = await startTestServer();

  const abb = await sessionLogin(SEED.abbhudaya);
  const abh = await sessionLogin(SEED.abhishek);
  const superA = await sessionLogin(SEED.superAdmin);

  assert(abb.ok, 'Abbhudaya consultant login');
  assert(abh.ok, 'Abhishek Mishra consultant login');
  assert(superA.ok, 'Super Admin login');

  // --- Abbhudaya assignments ---
  console.log('\nAbbhudaya — assignments & case access');
  const abbAssign = await api('/api/consultant/assignments', { cookie: abb.cookie });
  assert(abbAssign.status === 200, 'Abbhudaya → GET /consultant/assignments → 200');
  assert(abbAssign.data.count === 2, 'Abbhudaya → 2 assignments seeded');

  const abbRefs = (abbAssign.data.assignments || []).map((a: { caseReference: string }) => a.caseReference);
  assert(abbRefs.includes(SEED.abbAssignedCase), 'Abbhudaya → pending assignment BEG-2026-A1B2C3');
  assert(abbRefs.includes(SEED.abbActiveCase), 'Abbhudaya → active assignment BEG-2026-D4E5F6');

  const abbOwn = await api(`/api/cases/${SEED.abbAssignedCase}`, { cookie: abb.cookie });
  assert(abbOwn.status === 200, 'Abbhudaya → GET own assigned case → 200');

  const abbForeign = await api(`/api/cases/${SEED.abhOfferedCase}`, { cookie: abb.cookie });
  assert(abbForeign.status === 403, 'Abbhudaya → GET Abhishek case → 403');

  const abbCases = await api('/api/cases', { cookie: abb.cookie });
  assert(abbCases.status === 200, 'Abbhudaya → GET /cases → 200');
  assert(abbCases.data.count === 2, 'Abbhudaya → /cases returns only assigned cases');

  // --- Abhishek Mishra assignments ---
  console.log('\nAbhishek Mishra — assignments & case access');
  const abhAssign = await api('/api/consultant/assignments', { cookie: abh.cookie });
  assert(abhAssign.status === 200, 'Abhishek → GET /consultant/assignments → 200');
  assert(abhAssign.data.count === 3, 'Abhishek → 3 assignments seeded');

  const abhRefs = (abhAssign.data.assignments || []).map((a: { caseReference: string }) => a.caseReference);
  assert(abhRefs.includes(SEED.abhOfferedCase), 'Abhishek → offered assignment BEG-2026-G7H8I9');
  assert(abhRefs.includes(SEED.abhBoqCase), 'Abhishek → BOQ assignment BEG-2026-J1K2L3');
  assert(abhRefs.includes(SEED.abhCompletedCase), 'Abhishek → completed assignment BEG-2026-M4N5O6');

  const abhOwn = await api(`/api/cases/${SEED.abhBoqCase}`, { cookie: abh.cookie });
  assert(abhOwn.status === 200, 'Abhishek → GET own BOQ case → 200');

  const abhForeign = await api(`/api/cases/${SEED.abbAssignedCase}`, { cookie: abh.cookie });
  assert(abhForeign.status === 403, 'Abhishek → GET Abbhudaya case → 403');

  const abhCases = await api('/api/cases', { cookie: abh.cookie });
  assert(abhCases.status === 200, 'Abhishek → GET /cases → 200');
  assert(abhCases.data.count === 3, 'Abhishek → /cases returns only assigned cases');

  // --- Cross-consultant isolation on Elena's case ---
  console.log('\nCross-consultant isolation');
  const abbElena = await api(`/api/cases/${SEED.elenaCase}`, { cookie: abb.cookie });
  assert(abbElena.status === 403, 'Abbhudaya → GET Elena case → 403');

  const abhElena = await api(`/api/cases/${SEED.elenaCase}`, { cookie: abh.cookie });
  assert(abhElena.status === 403, 'Abhishek → GET Elena case → 403');

  // --- Super Admin full access ---
  console.log('\nSuper Admin — full visibility');
  const superCases = await api('/api/cases', { cookie: superA.cookie });
  assert(superCases.status === 200, 'Super Admin → GET /cases → 200');
  assert(superCases.data.count >= 6, 'Super Admin → sees all seed cases');

  const superAbb = await api(`/api/cases/${SEED.abbAssignedCase}`, { cookie: superA.cookie });
  assert(superAbb.status === 200, 'Super Admin → GET Abbhudaya case → 200');

  const superAbh = await api(`/api/cases/${SEED.abhBoqCase}`, { cookie: superA.cookie });
  assert(superAbh.status === 200, 'Super Admin → GET Abhishek BOQ case → 200');

  // --- Assignment status in case summary ---
  console.log('\nAssignment payload enrichment');
  const pendingAssign = (abbAssign.data.assignments || []).find(
    (a: { caseReference: string }) => a.caseReference === SEED.abbAssignedCase
  );
  assert(pendingAssign?.status === 'PENDING', 'Abbhudaya pending assignment status = PENDING');

  const offeredAssign = (abhAssign.data.assignments || []).find(
    (a: { caseReference: string }) => a.caseReference === SEED.abhOfferedCase
  );
  assert(offeredAssign?.status === 'OFFERED', 'Abhishek offered assignment status = OFFERED');

  await harness.close();

  console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
