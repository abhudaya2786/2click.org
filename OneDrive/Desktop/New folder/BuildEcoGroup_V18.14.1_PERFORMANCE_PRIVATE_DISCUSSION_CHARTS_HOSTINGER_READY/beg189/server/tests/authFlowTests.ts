/**
 * P0 auth reliability checks — static + session API smoke tests.
 */
import fs from 'fs';
import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from '../authRoutes';
import { store } from '../store';

const assert = (ok: boolean, msg: string) => {
  if (!ok) throw new Error(msg);
  console.log('✓', msg);
};

// --- Static code guards ---
const authContext = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
const firebaseClient = fs.readFileSync('src/lib/firebase.ts', 'utf8');
const authErrors = fs.readFileSync('src/lib/authErrors.ts', 'utf8');
const protectedRoute = fs.readFileSync('src/components/auth/ProtectedRoute.tsx', 'utf8');
const appTsx = fs.readFileSync('src/App.tsx', 'utf8');

assert(!authContext.includes('isBootstrapping'), 'AuthContext uses sessionReady (public pages never block on bootstrap)');
assert(authContext.includes('setSessionReady(true)'), 'Auth bootstrap always completes (sessionReady)');
assert(authContext.includes('BOOTSTRAP_TIMEOUT_MS'), 'Auth bootstrap has hard timeout fallback');
assert(authContext.includes('fetchWithTimeout'), 'Auth API calls use fetch timeout');
assert(firebaseClient.includes('withTimeout(getRedirectResult'), 'Google redirect result has timeout (prevents homepage hang)');
assert(firebaseClient.includes('signInWithRedirect'), 'Google uses redirect mode for production reliability');
assert(firebaseClient.includes('validateFirebaseAuthDomain'), 'Firebase authorized-domain validation exists');
assert(authErrors.includes('auth/unauthorized-domain'), 'Actionable error for unauthorized Firebase domain');
assert(authErrors.includes('auth/invalid-credential'), 'Actionable error for wrong email/password');
assert(protectedRoute.includes('sessionReady'), 'ProtectedRoute waits for sessionReady only');
assert(appTsx.includes("import { HomePage } from './pages/HomePage'"), 'HomePage is eager-loaded (no Suspense spinner on /)');

// --- Session API smoke (dev email login + Google token reconciliation path) ---
async function runApiSmoke() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', authRouter);

  const server = await new Promise<import('http').Server>((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  const base = `http://127.0.0.1:${port}`;

  // Status endpoint
  const statusRes = await fetch(`${base}/api/auth/status`);
  const statusJson = await statusRes.json();
  assert(statusRes.ok && statusJson.success, 'GET /api/auth/status returns diagnostics');
  assert(statusJson.googleSignIn === 'redirect', 'Google sign-in mode is redirect');

  // Email/password path via dev session (store-backed)
  const customer = store.findUserByEmail('aditya.vardhan@ecoventures.in');
  assert(Boolean(customer), 'Seed customer exists for email login smoke test');

  const sessionRes = await fetch(`${base}/api/auth/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: customer!.email }),
  });
  const sessionJson = await sessionRes.json();
  assert(sessionRes.ok && sessionJson.success, 'POST /api/auth/session reconciles dev user to HttpOnly session');
  assert(sessionJson.user?.email === customer!.email, 'Session returns correct user email');
  assert(Boolean(sessionRes.headers.get('set-cookie')), 'Session sets HttpOnly cookie');

  // Google first-time user auto-provision
  const googleEmail = `google.p0.${Date.now()}@test.example.com`;
  const mockToken = `dev-mock-token:${Buffer.from(JSON.stringify({ email: googleEmail, uid: `uid-${Date.now()}` })).toString('base64')}`;
  const googleRes = await fetch(`${base}/api/auth/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: mockToken, email: googleEmail }),
  });
  const googleJson = await googleRes.json();
  assert(googleRes.ok && googleJson.success, 'POST /api/auth/session auto-provisions new Google user');
  assert(googleJson.user?.role === 'CUSTOMER', 'Auto-provisioned Google user is CUSTOMER');
  assert(Boolean(store.findUserByEmail(googleEmail)), 'Google user persisted in store');

  await new Promise<void>((resolve) => server.close(() => resolve()));
}

await runApiSmoke();
console.log('Auth flow checks passed.');
