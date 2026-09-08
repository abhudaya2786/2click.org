/**
 * Super Admin RBAC safeguards
 * Run: npm run rbac:test
 */
import express from 'express';
import cookieParser from 'cookie-parser';
import { apiRouter } from '../routes';
import { authenticateSession } from '../middleware/auth';
import { store } from '../store';

let BASE = '';

async function startTestServer() {
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
    close: async () => new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve()))),
  };
}

function extractCookie(setCookie: string): string {
  const match = setCookie.match(/beg_session=[^;]+/);
  return match ? match[0] : '';
}

async function loginAs(email: string) {
  const res = await fetch(`${BASE}/api/auth/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  const cookie = extractCookie(res.headers.get('set-cookie') || '');
  return { status: res.status, data, cookie };
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

async function main() {
  const server = await startTestServer();
  console.log('\n=== RBAC SUPER ADMIN TESTS ===\n');

  const customer = await loginAs('aditya.vardhan@ecoventures.in');
  assert(customer.status === 200, 'customer login');
  const admin = await loginAs('admin@buildecogroup.in');
  assert(admin.status === 200, 'admin login');
  const superAdmin = await loginAs('superadmin@buildecogroup.in');
  assert(superAdmin.status === 200 && superAdmin.data.user?.role === 'SUPER_ADMIN', 'super admin login');

  const deniedCustomer = await fetch(`${BASE}/api/admin/users`, { headers: { Cookie: customer.cookie } });
  assert(deniedCustomer.status === 403 || deniedCustomer.status === 401, 'customer denied /api/admin/users');

  const deniedAdminLogs = await fetch(`${BASE}/api/admin/audit-logs`, { headers: { Cookie: admin.cookie } });
  assert(deniedAdminLogs.status === 403, 'admin denied audit logs');

  const allowed = await fetch(`${BASE}/api/admin/users`, { headers: { Cookie: superAdmin.cookie } });
  const allowedData = await allowed.json();
  assert(allowed.status === 200 && Array.isArray(allowedData.users), 'super admin lists users');

  const target = store.findUserByEmail('aditya.vardhan@ecoventures.in');
  assert(Boolean(target), 'customer target exists');

  const roleChange = await fetch(`${BASE}/api/admin/users/${target!.id}/role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: superAdmin.cookie },
    body: JSON.stringify({ newRole: 'CONSULTANT', reason: 'QA role change' }),
  });
  const roleData = await roleChange.json();
  assert(roleChange.status === 200 && roleData.user?.role === 'CONSULTANT', 'super admin changes role');

  const restore = await fetch(`${BASE}/api/admin/users/${target!.id}/role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: superAdmin.cookie },
    body: JSON.stringify({ newRole: 'CUSTOMER', reason: 'QA restore role' }),
  });
  assert(restore.status === 200, 'super admin restores customer role');

  const adminEscalate = await fetch(`${BASE}/api/admin/users/${superAdmin.data.user.id}/role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: admin.cookie },
    body: JSON.stringify({ newRole: 'SUPER_ADMIN', reason: 'attempt escalate' }),
  });
  assert(adminEscalate.status === 403, 'admin cannot assign Super Admin');

  // Last super admin protection — demote only SA if they are the only active one
  const activeSAs = store.countActiveSuperAdmins();
  assert(activeSAs >= 1, 'at least one active super admin');
  if (activeSAs === 1) {
    const demoteLast = await fetch(`${BASE}/api/admin/users/${superAdmin.data.user.id}/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: superAdmin.cookie },
      body: JSON.stringify({ newRole: 'ADMIN', reason: 'attempt demote last SA' }),
    });
    assert(demoteLast.status === 400, 'cannot demote last active Super Admin');

    const suspendLast = await fetch(`${BASE}/api/admin/users/${superAdmin.data.user.id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: superAdmin.cookie },
      body: JSON.stringify({ newStatus: 'SUSPENDED', reason: 'attempt suspend last SA' }),
    });
    assert(suspendLast.status === 400, 'cannot suspend last active Super Admin');
  }

  const logout = await fetch(`${BASE}/api/auth/logout`, {
    method: 'POST',
    headers: { Cookie: superAdmin.cookie },
  });
  assert(logout.status === 200, 'logout succeeds');
  const meAfter = await fetch(`${BASE}/api/auth/me`, { headers: { Cookie: superAdmin.cookie } });
  assert(meAfter.status === 401, 'session destroyed after logout');

  await server.close();
  console.log(`\nRBAC results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
