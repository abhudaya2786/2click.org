/**
 * Registration Reliability Tests — HTTP layer
 * Run: node --import tsx server/tests/registrationTests.ts
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

function extractSessionCookie(setCookie: string): string {
  const match = setCookie.match(/beg_session=[^;]+/);
  return match ? match[0] : setCookie.split(';')[0];
}

function devMockToken(email: string): string {
  const payload = JSON.stringify({ email, uid: `uid-dev-${email.replace(/[^a-zA-Z0-9]/g, '_')}`, ts: Date.now() });
  return `dev-mock-token:${Buffer.from(payload).toString('base64')}`;
}

function basePayload(email: string, phone = '9876510001') {
  return {
    fullName: 'QA Reg Test User',
    email,
    password: 'TestPass123!',
    confirmPassword: 'TestPass123!',
    phone,
    city: 'Lucknow',
    district: 'Lucknow',
    stateRegion: 'Uttar Pradesh',
    pincode: '226010',
    country: 'India',
    termsAccepted: true,
    privacyAccepted: true,
    idToken: devMockToken(email),
  };
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

async function register(payload: Record<string, unknown>) {
  const res = await fetch(`${BASE}/api/auth/register-customer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, headers: res.headers };
}

async function sessionLogin(email: string) {
  const res = await fetch(`${BASE}/api/auth/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include' as RequestCredentials,
    body: JSON.stringify({ email, idToken: devMockToken(email) }),
  });
  const data = await res.json();
  const cookie = res.headers.get('set-cookie') || '';
  return { status: res.status, data, cookie };
}

async function getMe(cookie: string) {
  const res = await fetch(`${BASE}/api/auth/me`, {
    headers: { Cookie: extractSessionCookie(cookie) },
  });
  return { status: res.status, data: await res.json() };
}

async function logout(cookie: string) {
  return fetch(`${BASE}/api/auth/logout`, {
    method: 'POST',
    headers: { Cookie: extractSessionCookie(cookie) },
  });
}

async function lookupPincode(code: string) {
  const res = await fetch(`${BASE}/api/pincode/${code}`);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function main() {
  const harness = await startTestServer();
  console.log('\n=== Registration Reliability HTTP Tests ===\n');
  if (!process.env.TEST_BASE_URL) {
    console.log(`Test server: ${BASE}\n`);
  }
  const ts = Date.now();
  const emails = [
    `qa.reg.rel.a.${ts}@test.example.com`,
    `qa.reg.rel.b.${ts}@test.example.com`,
    `qa.reg.rel.c.${ts}@test.example.com`,
  ];

  // --- Pincode lookup ---
  console.log('PINCODE LOOKUP');
  const pin = await lookupPincode('226010');
  assert(pin.status === 200 && pin.data.success, 'pincode 226010 → success');
  assert(pin.data.pincode === '226010', 'pincode normalized to 6 digits');
  assert(Boolean(pin.data.city), 'pincode lookup returns city');
  assert(Boolean(pin.data.district), 'pincode lookup returns district');
  assert(pin.data.state === 'Uttar Pradesh', 'pincode lookup returns state');

  const badPin = await lookupPincode('123');
  assert(badPin.status === 400, 'invalid pincode length → 400');

  // --- Negative tests ---
  console.log('\nNEGATIVE CASES');

  const blank = await register({ ...basePayload('blank@test.example.com'), fullName: '' });
  assert(blank.status === 400, 'blank fullName → 400');

  const badEmail = await register({ ...basePayload('not-an-email'), email: 'not-an-email' });
  assert(badEmail.status === 400, 'invalid email → 400');

  const weakPass = await register({ ...basePayload('weak@test.example.com'), password: 'weak', confirmPassword: 'weak', idToken: undefined });
  assert(weakPass.status === 400, 'weak password → 400');

  const mismatch = await register({ ...basePayload('mismatch@test.example.com'), password: 'TestPass123!', confirmPassword: 'OtherPass123!', idToken: undefined });
  assert(mismatch.status === 400, 'password mismatch → 400');

  const shortPhone = await register({ ...basePayload('shortphone@test.example.com'), phone: '123' });
  assert(shortPhone.status === 400, 'invalid/short phone → 400');

  const badPincode = await register({ ...basePayload('badpin@test.example.com'), pincode: '12' });
  assert(badPincode.status === 400, 'invalid pincode → 400');

  // Role injection via extra JSON fields (zod strips unknown keys)
  const roleInject = await register({
    ...basePayload(`qa.reg.inject.${ts}@test.example.com`),
    role: 'SUPER_ADMIN',
    admin: true,
  } as Record<string, unknown>);
  assert(roleInject.status === 201, 'registration with extra role field → 201');
  if (roleInject.data?.user) {
    assert(roleInject.data.user.role === 'CUSTOMER', 'extra role field ignored — user is CUSTOMER');
  }

  // Direct store defense-in-depth (privileged role coercion)
  const { store } = await import('../store');
  const coerced = store.createUser({
    email: `qa.reg.coerce.${ts}@test.example.com`,
    fullName: 'Coerce Test',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
  });
  assert(coerced.role === 'CUSTOMER', 'store.createUser coerces SUPER_ADMIN → CUSTOMER');

  // --- Positive: 3 fresh identities ---
  console.log('\nPOSITIVE: 3 FRESH IDENTITIES');

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    const phone = `98765${String(10001 + i).padStart(5, '0')}`;
    console.log(`\nIdentity ${i + 1}: ${email}`);

    const reg = await register({
      ...basePayload(email, phone),
      fullName: `QA Reg User ${['Alpha', 'Beta', 'Gamma'][i]}`,
    });
    assert(reg.status === 201 && reg.data.success, `register → 201 success`);
    assert(reg.data.user?.role === 'CUSTOMER', `role === CUSTOMER`);
    assert(reg.data.user?.email === email.toLowerCase(), `email persisted correctly`);
    assert(reg.data.user?.phone === `+91${phone}`, `phone persisted normalized`);
    assert(reg.data.user?.profile?.pincode === '226010', `pincode persisted`);
    assert(reg.data.user?.profile?.city === 'Lucknow', `city persisted`);
    assert(reg.data.user?.profile?.district === 'Lucknow', `district persisted`);
    assert(reg.data.user?.profile?.stateRegion === 'Uttar Pradesh', `state persisted`);
    assert(reg.data.user?.profile?.country === 'India', `country persisted`);

    const cookie = reg.headers.get('set-cookie') || '';
    assert(cookie.includes('beg_session'), 'session cookie set on register');

    const me = await getMe(cookie);
    assert(me.status === 200 && me.data.user?.role === 'CUSTOMER', `/me returns CUSTOMER`);
    assert(me.data.user?.profile?.pincode === '226010', `/me returns persisted pincode`);

    await logout(cookie);

    const relogin = await sessionLogin(email);
    assert(relogin.status === 200 && relogin.data.user?.role === 'CUSTOMER', `re-login after logout → CUSTOMER`);
    assert(relogin.data.user?.profile?.pincode === '226010', `location persists after re-login`);
    assert(relogin.data.user?.profile?.district === 'Lucknow', `district persists after re-login`);
  }

  // Full flow: pincode lookup → register → dashboard route → logout → login
  console.log('\nFULL REGISTRATION FLOW');
  const flowEmail = `qa.reg.flow.${ts}@test.example.com`;
  const flowPhone = `98765${String(ts).slice(-5)}`;
  const flowPin = await lookupPincode('560001');
  assert(flowPin.status === 200 && flowPin.data.success, 'flow: pincode lookup success');

  const flowReg = await register({
    ...basePayload(flowEmail, flowPhone),
    fullName: 'QA Flow User',
    pincode: flowPin.data.pincode,
    city: flowPin.data.city,
    district: flowPin.data.district,
    stateRegion: flowPin.data.state,
    country: flowPin.data.country,
  });
  assert(flowReg.status === 201 && flowReg.data.success, 'flow: register success');
  assert(flowReg.data.user?.role === 'CUSTOMER', 'flow: role CUSTOMER (dashboard eligible)');
  assert(flowReg.data.user?.profile?.pincode === '560001', 'flow: pincode saved');
  assert(Boolean(flowReg.data.user?.profile?.city), 'flow: city saved');

  const flowCookie = flowReg.headers.get('set-cookie') || '';
  await logout(flowCookie);
  const flowRelogin = await sessionLogin(flowEmail);
  assert(flowRelogin.status === 200, 'flow: re-login success');
  assert(flowRelogin.data.user?.profile?.pincode === '560001', 'flow: profile/location persists after logout+login');

  // Duplicate email
  console.log('\nDUPLICATE EMAIL');
  const dup = await register(basePayload(emails[0], '9876510099'));
  assert(dup.status === 409, 'duplicate email → 409');

  // Duplicate phone
  console.log('\nDUPLICATE PHONE');
  const dupPhone = await register({
    ...basePayload(`qa.reg.dupphone.${ts}@test.example.com`),
    phone: '9876510001',
  });
  assert(dupPhone.status === 409, 'duplicate phone → 409');

  // Orphan recovery: Firebase UID profile upsert on repeated register
  console.log('\nORPHAN / IDEMPOTENT REGISTER');
  const orphanEmail = `qa.reg.orphan.${ts}@test.example.com`;
  const orphanToken = devMockToken(orphanEmail);
  const first = await register({ ...basePayload(orphanEmail, '9876510088'), idToken: orphanToken });
  assert(first.status === 201, 'orphan first register → 201');
  const second = await register({ ...basePayload(orphanEmail, '9876510088'), idToken: orphanToken });
  assert(second.status === 200 || second.status === 201, 'orphan second register upserts without duplicate crash');
  assert(second.data.user?.id === first.data.user?.id, 'orphan upsert keeps same user id');

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===\n`);
  await harness.close();
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
