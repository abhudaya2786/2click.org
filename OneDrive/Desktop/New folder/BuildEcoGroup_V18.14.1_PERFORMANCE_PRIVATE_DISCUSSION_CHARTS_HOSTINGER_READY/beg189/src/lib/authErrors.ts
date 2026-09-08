/** Maps Firebase / server auth errors to actionable user-facing messages. */

const FIREBASE_CODE_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Contact BuildEcoGroup support.',
  'auth/user-not-found': 'No account found with this email. Please register first.',
  'auth/wrong-password': 'Incorrect password. Try again or use Forgot password.',
  'auth/invalid-credential': 'Incorrect email or password. If you signed up with Google, use Continue with Google instead.',
  'auth/too-many-requests': 'Too many attempts. Wait a few minutes, then try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/popup-blocked': 'Sign-in popup was blocked. We use redirect mode — please try again.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled before completion.',
  'auth/cancelled-popup-request': 'Google sign-in was interrupted. Please try again.',
  'auth/unauthorized-domain': 'Firebase has not authorized this website yet. Add the root website domain and its www subdomain in Firebase Console → Authentication → Settings → Authorized domains, then try again.',
  'auth/operation-not-allowed': 'This sign-in method is disabled in Firebase. Enable Google provider in Firebase Console.',
  'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method. Try email/password or the original Google account.',
  'auth/email-already-in-use': 'This email is already registered. Sign in instead.',
  'auth/weak-password': 'Choose a stronger password (8+ characters, uppercase letter, number).',
  'auth/missing-password': 'Please enter your password.',
  'auth/internal-error': 'Authentication service error. Try again in a moment.',
  'auth/invalid-api-key': 'Firebase client is misconfigured (invalid API key). Rebuild after setting VITE_FIREBASE_API_KEY.',
};

export function mapFirebaseAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (code && FIREBASE_CODE_MESSAGES[code]) {
    return FIREBASE_CODE_MESSAGES[code];
  }
  const message = (error as { message?: string })?.message || '';
  if (message.includes('Firebase Admin SDK is not configured')) {
    return 'Server authentication is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY on Hostinger, then restart the app.';
  }
  if (message.includes('token verification failed')) {
    return 'Your sign-in session expired or is invalid. Please sign in again.';
  }
  if (message.includes('not configured')) {
    return 'Sign-in is temporarily unavailable. Firebase environment variables are missing on this deployment.';
  }
  return message || 'Sign-in failed. Please try again or contact support.';
}

export function mapServerAuthError(error: string, status?: number, code?: string): string {
  if (code === 'FIREBASE_ADMIN_MISSING' || error.includes('Firebase Admin SDK is not configured') || error.includes('Server authentication is not configured')) {
    return 'Server authentication is temporarily unavailable. Your sign-up may have created a login identity — try signing in again shortly, or contact support if this continues.';
  }
  if (code === 'DUPLICATE_EMAIL' || error.toLowerCase().includes('email address already exists')) {
    return 'An account with this email address already exists. Please sign in instead.';
  }
  if (code === 'DUPLICATE_MOBILE' || error.toLowerCase().includes('mobile number already exists')) {
    return 'An account with this mobile number already exists. Please sign in instead.';
  }
  if (code === 'PROFILE_NEEDS_RESET') {
    return error;
  }
  if (error.toLowerCase().includes('suspended')) {
    return 'Your account is suspended. Contact BuildEcoGroup Platform Support.';
  }
  if (error.toLowerCase().includes('disabled')) {
    return 'Your account has been disabled.';
  }
  if (status === 401 && error.includes('Firebase')) {
    return 'Sign-in could not be verified on the server. Ensure Firebase Admin credentials are set on Hostinger and restart the app.';
  }
  if (status === 409) {
    return error;
  }
  return error || 'Authentication failed. Please verify your credentials.';
}

export function formatRegistrationFieldErrors(details?: Record<string, string[] | undefined>): string | null {
  if (!details) return null;
  const messages: string[] = [];
  for (const [field, list] of Object.entries(details)) {
    if (list?.[0]) messages.push(`${field}: ${list[0]}`);
  }
  return messages.length ? messages.join(' · ') : null;
}
