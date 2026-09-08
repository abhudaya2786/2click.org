/// <reference types="vite/client" />
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  Auth,
} from 'firebase/auth';
import { mapFirebaseAuthError } from './authErrors';
import { withTimeout } from './withTimeout';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const REDIRECT_TIMEOUT_MS = 6000;
const AUTH_RETURN_KEY = 'beg_auth_return_to';
const GOOGLE_INTENT_KEY = 'beg_google_auth_intent';

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.length > 5 &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId.length > 0 &&
    firebaseConfig.authDomain &&
    firebaseConfig.authDomain.length > 0
  );
};

/**
 * Validate the Firebase client authDomain value itself.
 *
 * Firebase normally uses `<project-id>.firebaseapp.com` here even when the app
 * runs on a custom domain. Whether the current website host is authorized is a
 * separate Firebase Console setting and cannot be inferred from client config.
 */
export function validateFirebaseAuthDomain(): { ok: boolean; host: string; authDomain: string; hint?: string } {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const authDomain = firebaseConfig.authDomain || '';
  if (!isFirebaseConfigured() || !host) {
    return { ok: true, host, authDomain };
  }
  const normalizedAuth = authDomain.trim().toLowerCase();
  const ok =
    normalizedAuth.length > 0 &&
    !normalizedAuth.includes('://') &&
    !normalizedAuth.includes('/') &&
    (/^[a-z0-9.-]+(?::\d+)?$/.test(normalizedAuth));
  return {
    ok,
    host,
    authDomain,
    hint: ok
      ? undefined
      : `VITE_FIREBASE_AUTH_DOMAIN must contain a hostname only, usually "<project-id>.firebaseapp.com". Current value: "${authDomain}".`,
  };
}

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let domainValidated = false;

export function getClientAuth(): Auth | null {
  if (!isFirebaseConfigured()) {
    return null;
  }

  if (!appInstance) {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }

  if (!authInstance && appInstance) {
    authInstance = getAuth(appInstance);
  }

  if (!domainValidated && import.meta.env.PROD) {
    domainValidated = true;
    const check = validateFirebaseAuthDomain();
    if (!check.ok && check.hint) {
      console.warn('[BuildEcoGroup Auth]', check.hint);
    }
  }

  return authInstance;
}

export async function clientSignInWithEmail(email: string, pass: string): Promise<{ idToken: string; email: string; uid: string }> {
  const auth = getClientAuth();

  if (auth) {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, pass);
      const idToken = await userCred.user.getIdToken();
      return {
        idToken,
        email: userCred.user.email || email,
        uid: userCred.user.uid,
      };
    } catch (error) {
      throw new Error(mapFirebaseAuthError(error));
    }
  }

  if (import.meta.env.PROD) {
    throw new Error('Email sign-in is not configured. Set VITE_FIREBASE_* variables and rebuild the app.');
  }

  return {
    idToken: `dev-mock-token:${btoa(JSON.stringify({ email, uid: `uid-dev-${Date.now()}`, ts: Date.now() }))}`,
    email,
    uid: `uid-dev-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
  };
}

export async function clientSignUpWithEmail(email: string, pass: string): Promise<{ idToken: string; email: string; uid: string }> {
  const auth = getClientAuth();

  if (auth) {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, pass);
      const idToken = await userCred.user.getIdToken();
      return {
        idToken,
        email: userCred.user.email || email,
        uid: userCred.user.uid,
      };
    } catch (error) {
      throw new Error(mapFirebaseAuthError(error));
    }
  }

  if (import.meta.env.PROD) {
    throw new Error('Registration is not configured. Set VITE_FIREBASE_* variables and rebuild the app.');
  }

  return {
    idToken: `dev-mock-token:${btoa(JSON.stringify({ email, uid: `uid-dev-${Date.now()}`, ts: Date.now() }))}`,
    email,
    uid: `uid-dev-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
  };
}

/**
 * Start Google Sign-In using redirect (reliable on production / mobile).
 * Saves return path so user lands back on the correct page after redirect.
 */
export async function clientSignInWithGoogle(): Promise<{ redirecting: true }> {
  const auth = getClientAuth();

  if (auth) {
    const domainCheck = validateFirebaseAuthDomain();
    if (!domainCheck.ok && domainCheck.hint) {
      throw new Error(domainCheck.hint);
    }

    try {
      sessionStorage.setItem(AUTH_RETURN_KEY, window.location.pathname + window.location.search);
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithRedirect(auth, provider);
      return { redirecting: true };
    } catch (error) {
      throw new Error(mapFirebaseAuthError(error));
    }
  }

  if (import.meta.env.PROD) {
    throw new Error('Google sign-in is not configured. Set VITE_FIREBASE_* variables, authorize www.buildecogroup.com in Firebase, and rebuild.');
  }
  return { redirecting: true };
}

/** Read saved post-redirect return path (login page uses this). */
export function consumeAuthReturnPath(): string | null {
  const path = sessionStorage.getItem(AUTH_RETURN_KEY);
  sessionStorage.removeItem(AUTH_RETURN_KEY);
  return path;
}

export function peekGoogleAuthIntent(): 'login' | 'register' {
  return (sessionStorage.getItem(GOOGLE_INTENT_KEY) as 'login' | 'register') || 'login';
}

export function setGoogleAuthIntent(intent: 'login' | 'register'): void {
  sessionStorage.setItem(GOOGLE_INTENT_KEY, intent);
}

export function clearGoogleAuthIntent(): void {
  sessionStorage.removeItem(GOOGLE_INTENT_KEY);
}

/**
 * Complete a Google redirect after Firebase returns to the app.
 * Times out after 6s so homepage never hangs waiting for Firebase.
 */
export async function clientCompleteGoogleRedirect(): Promise<{ idToken: string; email: string; uid: string; displayName?: string } | null> {
  const auth = getClientAuth();
  if (!auth) return null;

  try {
    const result = await withTimeout(getRedirectResult(auth), REDIRECT_TIMEOUT_MS, null);
    if (!result) return null;
    const idToken = await result.user.getIdToken();
    return {
      idToken,
      email: result.user.email || '',
      uid: result.user.uid,
      displayName: result.user.displayName || undefined,
    };
  } catch (error) {
    console.warn('[BuildEcoGroup Auth] Google redirect completion failed:', mapFirebaseAuthError(error));
    return null;
  }
}

export async function clientSendPasswordReset(email: string): Promise<void> {
  const auth = getClientAuth();
  if (auth) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new Error(mapFirebaseAuthError(error));
    }
  }
}

export async function clientSignOut(): Promise<void> {
  const auth = getClientAuth();
  if (auth) {
    await signOut(auth);
  }
}

export function getFirebaseClientConfigStatus() {
  return {
    configured: isFirebaseConfigured(),
    authDomain: firebaseConfig.authDomain || null,
    projectId: firebaseConfig.projectId || null,
    domainCheck: typeof window !== 'undefined' ? validateFirebaseAuthDomain() : null,
  };
}
