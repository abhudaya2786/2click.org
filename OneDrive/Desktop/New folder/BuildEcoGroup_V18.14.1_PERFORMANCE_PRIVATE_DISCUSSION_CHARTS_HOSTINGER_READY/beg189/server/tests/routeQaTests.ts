/**
 * Route QA — HTTP smoke + content heuristics for SPA routes
 * Run: node --import tsx server/tests/routeQaTests.ts
 */
import { ROUTES } from '../../src/lib/routes';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

const PUBLIC_ROUTES: string[] = [
  ROUTES.HOME,
  ROUTES.ABOUT,
  ROUTES.PILLARS,
  ROUTES.SERVICES,
  ROUTES.CONSULTANTS,
  ROUTES.PROPERTY,
  ROUTES.TECHNOLOGY,
  ROUTES.CONTACT,
  ROUTES.INITIATE_PROJECT,
  ROUTES.ONBOARDING,
  ROUTES.LAND_DEVELOPMENT,
  ROUTES.LAND_FEASIBILITY,
  ROUTES.CONSTRUCTION_MANAGEMENT,
  ROUTES.PROJECT_MONITORING,
  ROUTES.BOQ_ESTIMATION,
  ROUTES.SOLAR,
  ROUTES.WATER_TREATMENT,
  ROUTES.WASTE_MANAGEMENT,
  ROUTES.MAINTENANCE_AMC,
  ROUTES.GIS,
  ROUTES.MATERIAL_PROCUREMENT,
  ROUTES.INTERIOR,
  ROUTES.VASTU,
  ROUTES.WORKERS,
  ROUTES.EQUIPMENT,
  '/water',
  ROUTES.LOCAL_LUCKNOW,
  ROUTES.LOCAL_GORAKHPUR,
  '/services/bengaluru',
  ROUTES.PROJECTS,
  ROUTES.RESEARCH,
  ROUTES.BLOG,
  ROUTES.TRACK_REQUEST,
  '/track/BEG-4092',
  '/projects/BEG-4092',
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  '/this-route-should-404',
];

const AUTH_ROUTES: { path: string; roles: string[] }[] = [
  { path: ROUTES.DASHBOARD, roles: ['CUSTOMER', 'ADMIN'] },
  { path: ROUTES.CONSULTANT_DASHBOARD, roles: ['CONSULTANT', 'ADMIN'] },
  { path: ROUTES.EMPLOYEE_DASHBOARD, roles: ['EMPLOYEE', 'ADMIN'] },
  { path: ROUTES.ADMIN_DASHBOARD, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { path: ROUTES.SUPER_ADMIN_DASHBOARD, roles: ['SUPER_ADMIN'] },
  { path: ROUTES.COMMERCIAL_SUITE, roles: ['ADMIN', 'CONSULTANT'] },
  { path: ROUTES.MARKETPLACE, roles: ['CUSTOMER', 'ADMIN'] },
  { path: ROUTES.CASES, roles: ['CUSTOMER', 'ADMIN'] },
  { path: ROUTES.DOCUMENTS, roles: ['CUSTOMER', 'ADMIN'] },
  { path: ROUTES.MESSAGES, roles: ['CUSTOMER', 'ADMIN'] },
  { path: ROUTES.SETTINGS, roles: ['CUSTOMER', 'ADMIN'] },
];

const ROLE_EMAILS: Record<string, string> = {
  CUSTOMER: 'aditya.vardhan@ecoventures.in',
  CONSULTANT: 'elena.rostova@beg-partner.in',
  EMPLOYEE: 'coordinator@buildecogroup.in',
  ADMIN: 'admin@buildecogroup.in',
  SUPER_ADMIN: 'superadmin@buildecogroup.in',
};

function devMockToken(email: string): string {
  const payload = JSON.stringify({ email, uid: `uid-dev-${email.replace(/[^a-zA-Z0-9]/g, '_')}`, ts: Date.now() });
  return `dev-mock-token:${Buffer.from(payload).toString('base64')}`;
}

let passed = 0;
let failed = 0;
const issues: string[] = [];

function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    issues.push(msg);
    console.error(`  ✗ FAIL: ${msg}`);
  }
}

async function fetchRoute(path: string, cookie?: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: cookie ? { Cookie: cookie } : {},
    redirect: 'manual',
  });
  const html = await res.text();
  return { status: res.status, html, location: res.headers.get('location') };
}

async function login(email: string): Promise<string> {
  const res = await fetch(`${BASE}/api/auth/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, idToken: devMockToken(email) }),
  });
  const cookie = res.headers.get('set-cookie') || '';
  return cookie.split(';')[0];
}

async function main() {
  console.log('\n=== Route QA — Public Pages ===\n');

  for (const path of PUBLIC_ROUTES) {
    const { status, html } = await fetchRoute(path);
    const is404Route = path.includes('should-404');
    if (is404Route) {
      assert(status === 200 && html.includes('root'), `404 route ${path} → SPA shell (client 404)`);
      continue;
    }
    assert(status === 200, `${path} → HTTP 200`);
    assert(html.includes('id="root"') || html.includes('root'), `${path} → SPA index served`);
    assert(!html.includes('Internal Server Error'), `${path} → no server error text`);
  }

  // API health for broken backend
  const health = await fetch(`${BASE}/api/health`);
  const healthJson = await health.json();
  assert(health.ok, '/api/health → OK');
  assert(healthJson.status === 'ok' || healthJson.status === 'degraded', '/api/health status present');

  console.log('\n=== Route QA — Authenticated Redirects (no cookie) ===\n');
  for (const { path } of AUTH_ROUTES) {
    const { status, html } = await fetchRoute(path);
    // SPA always returns 200 index; client-side ProtectedRoute redirects to login
    assert(status === 200, `${path} unauthenticated → index shell 200`);
    assert(html.includes('root'), `${path} unauthenticated → React mount point`);
  }

  console.log('\n=== Route QA — Role Dashboard Access (HTTP shell) ===\n');
  const cookies: Record<string, string> = {};
  for (const [role, email] of Object.entries(ROLE_EMAILS)) {
    cookies[role] = await login(email);
    assert(!!cookies[role], `Login ${role}`);
  }

  for (const { path, roles } of AUTH_ROUTES) {
    for (const role of roles) {
      const { status, html } = await fetchRoute(path, cookies[role]);
      assert(status === 200, `${role} → ${path} → 200`);
      assert(html.includes('root'), `${role} → ${path} → SPA shell`);
    }
  }

  // Wrong role should still get SPA (client guard)
  const custOnAdmin = await fetchRoute(ROUTES.SUPER_ADMIN_DASHBOARD, cookies.CUSTOMER);
  assert(custOnAdmin.status === 200, 'Customer → super-admin route serves SPA (client blocks)');

  console.log('\n=== Route QA — Key API endpoints from pages ===\n');
  const apiChecks = [
    { path: '/api/services', auth: false },
    { path: '/api/cases', auth: true, role: 'CUSTOMER' },
    { path: '/api/track/BEG-4092', auth: false },
    { path: '/api/track/BEG-INVALID-99999', auth: false, expect404: true },
  ];

  for (const check of apiChecks) {
    const headers: Record<string, string> = {};
    if (check.auth && check.role) headers.Cookie = cookies[check.role];
    const res = await fetch(`${BASE}${check.path}`, { headers });
    if (check.expect404) {
      assert(res.status === 404, `${check.path} → 404 for invalid ID`);
    } else if (check.auth) {
      assert(res.status === 200, `${check.path} authenticated → 200`);
    } else {
      assert(res.status === 200, `${check.path} public → 200`);
    }
  }

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  if (issues.length) {
    console.log('\nIssues:');
    issues.forEach(i => console.log(`  - ${i}`));
  }
  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
