import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { env } from './env';

let appInstance: App | null = null;
let initAttempted = false;
let initError: string | null = null;

/**
 * Hostinger and many panel UIs store PEM keys with literal \n, wrapping quotes,
 * or CRLF. Normalize before cert().
 */
export function normalizeFirebasePrivateKey(raw: string | undefined): string | null {
  if (!raw) return null;
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  key = key.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();
  if (!key.includes('BEGIN PRIVATE KEY') || !key.includes('END PRIVATE KEY')) {
    return null;
  }
  return key;
}

export function getFirebaseAdminInitError(): string | null {
  return initError;
}

function initFirebaseAdmin(): boolean {
  if (appInstance) return true;
  if (initAttempted && !appInstance) return false;
  initAttempted = true;
  initError = null;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    appInstance = existingApps[0];
    return true;
  }

  const projectId = env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = normalizeFirebasePrivateKey(env.FIREBASE_PRIVATE_KEY);

  if (projectId && clientEmail && privateKey) {
    try {
      appInstance = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('[BuildEcoGroup] Firebase Admin SDK initialized successfully.');
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown Admin init error';
      initError = message;
      console.error('[BuildEcoGroup] Failed to initialize Firebase Admin SDK:', message);
      return false;
    }
  }

  if (projectId && env.NODE_ENV !== 'production') {
    try {
      appInstance = initializeApp({ projectId });
      console.log(`[BuildEcoGroup] Firebase Admin initialized with project ID only: ${projectId}`);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown Admin init error';
      initError = message;
      console.error('[BuildEcoGroup] Failed to initialize Firebase Admin with project ID:', message);
      return false;
    }
  }

  if (!projectId || !clientEmail || !privateKey) {
    initError = 'Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or a valid FIREBASE_PRIVATE_KEY PEM.';
  }
  return false;
}

/** True only when Admin SDK actually initialized (not merely env names present). */
export function isFirebaseAdminReady(): boolean {
  return initFirebaseAdmin();
}

export function getFirebaseAdminStatus() {
  const envPresent = Boolean(
    env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY
  );
  const privateKeyParsable = Boolean(normalizeFirebasePrivateKey(env.FIREBASE_PRIVATE_KEY));
  const ready = isFirebaseAdminReady();
  return {
    envPresent,
    privateKeyParsable,
    ready,
    projectId: env.FIREBASE_PROJECT_ID ? 'set' : 'missing',
    initError: ready ? null : initError,
  };
}

export interface VerifiedIdentity {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  provider?: string;
}

/**
 * Authoritatively verifies a Firebase ID token on the Express backend
 */
export async function verifyFirebaseToken(idToken: string): Promise<VerifiedIdentity> {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Missing or invalid identity token');
  }

  const adminReady = initFirebaseAdmin();

  if (adminReady && !idToken.startsWith('dev-mock-token:')) {
    try {
      const auth = getAuth(appInstance || undefined);
      const decoded = await auth.verifyIdToken(idToken);
      return {
        uid: decoded.uid,
        email: decoded.email || '',
        emailVerified: Boolean(decoded.email_verified),
        displayName: decoded.name,
        provider: decoded.firebase?.sign_in_provider,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown verification error';
      throw new Error(`Firebase token verification failed: ${message}`);
    }
  }

  if (idToken.startsWith('dev-mock-token:') && env.NODE_ENV !== 'production') {
    try {
      const payloadStr = Buffer.from(idToken.replace('dev-mock-token:', ''), 'base64').toString('utf-8');
      const payload = JSON.parse(payloadStr);

      if (!payload.email || !payload.uid) {
        throw new Error('Malformed development identity payload');
      }

      return {
        uid: payload.uid,
        email: payload.email,
        emailVerified: true,
        displayName: payload.name,
        provider: payload.provider || 'password',
      };
    } catch {
      throw new Error('Invalid development identity signature');
    }
  }

  if (env.NODE_ENV !== 'production') {
    try {
      const parts = idToken.split('.');
      if (parts.length === 3 && parts[1]) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        if (payload.email) {
          return {
            uid: payload.user_id || payload.sub || payload.uid || 'dev-uid',
            email: payload.email,
            emailVerified: Boolean(payload.email_verified),
            displayName: payload.name,
          };
        }
      }
    } catch {
      // ignore
    }
  }

  throw new Error('Firebase Admin SDK is not configured in production. Cannot verify ID token.');
}

export async function ensureFirebaseUser(params: {
  email: string;
  password?: string;
  displayName?: string;
  resetPassword?: boolean;
}): Promise<{ uid: string; email: string; created: boolean; passwordReset: boolean }> {
  if (!initFirebaseAdmin() || !appInstance) {
    throw new Error('Firebase Admin SDK is not configured. Cannot bootstrap identity.');
  }

  const auth = getAuth(appInstance);
  const email = params.email.trim().toLowerCase();

  try {
    const existing = await auth.getUserByEmail(email);
    let passwordReset = false;
    if (params.resetPassword && params.password) {
      await auth.updateUser(existing.uid, {
        password: params.password,
        displayName: params.displayName || existing.displayName,
      });
      passwordReset = true;
    } else if (params.displayName && params.displayName !== existing.displayName) {
      await auth.updateUser(existing.uid, { displayName: params.displayName });
    }
    return { uid: existing.uid, email, created: false, passwordReset };
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code !== 'auth/user-not-found') {
      throw error;
    }
  }

  if (!params.password) {
    throw new Error('Temporary password is required to create a new Firebase user.');
  }

  const created = await auth.createUser({
    email,
    password: params.password,
    displayName: params.displayName,
    emailVerified: true,
  });

  return { uid: created.uid, email, created: true, passwordReset: false };
}

export async function setFirebaseCustomClaims(uid: string, claims: Record<string, unknown>): Promise<void> {
  if (!initFirebaseAdmin() || !appInstance) {
    throw new Error('Firebase Admin SDK is not configured. Cannot set custom claims.');
  }
  await getAuth(appInstance).setCustomUserClaims(uid, claims);
}

export async function sendFirebasePasswordResetLink(email: string): Promise<string | null> {
  if (!initFirebaseAdmin() || !appInstance) {
    return null;
  }
  try {
    return await getAuth(appInstance).generatePasswordResetLink(email.trim().toLowerCase());
  } catch {
    return null;
  }
}
