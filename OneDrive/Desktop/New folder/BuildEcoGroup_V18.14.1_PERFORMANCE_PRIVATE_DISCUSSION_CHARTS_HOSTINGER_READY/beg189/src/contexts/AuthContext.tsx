import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SafeUser,
  UserRole,
  Permission,
  CustomerRegistrationInput,
} from '../types/auth';
import {
  clientSignInWithEmail,
  clientSignUpWithEmail,
  clientSignInWithGoogle,
  clientCompleteGoogleRedirect,
  clientSendPasswordReset,
  clientSignOut,
  setGoogleAuthIntent,
  clearGoogleAuthIntent,
  peekGoogleAuthIntent,
} from '../lib/firebase';
import { hasPermission, getDashboardRouteForRole } from '../lib/permissions';
import { fetchWithTimeout } from '../lib/fetchWithTimeout';
import { mapFirebaseAuthError, mapServerAuthError, formatRegistrationFieldErrors } from '../lib/authErrors';

type GoogleRegistrationIdentity = { idToken: string; email: string; uid: string; displayName?: string };

interface AuthContextType {
  user: SafeUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** True until first background session bootstrap completes (protected routes only). */
  sessionReady: boolean;
  error: string | null;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  loginWithEmail: (email: string, pass: string, rememberMe?: boolean) => Promise<{ success: boolean; user?: SafeUser; error?: string }>;
  loginWithGoogle: (intent?: 'login' | 'register') => Promise<{ success: boolean; user?: SafeUser; error?: string; redirecting?: boolean }>;
  googleRegistrationIdentity: GoogleRegistrationIdentity | null;
  clearGoogleRegistrationIdentity: () => void;
  registerCustomer: (data: CustomerRegistrationInput) => Promise<{ success: boolean; user?: SafeUser; error?: string }>;
  registerConsultant: (data: any) => Promise<{ success: boolean; user?: SafeUser; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  switchDevAccount: (role: UserRole | 'SUSPENDED') => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BOOTSTRAP_TIMEOUT_MS = 10000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [googleRegistrationIdentity, setGoogleRegistrationIdentity] = useState<GoogleRegistrationIdentity | null>(null);

  const clearError = () => setError(null);
  const clearGoogleRegistrationIdentity = () => setGoogleRegistrationIdentity(null);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetchWithTimeout('/api/auth/me', {
        headers: { Accept: 'application/json' },
        credentials: 'include',
      }, 8000);

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setPermissions(data.permissions || []);
          return;
        }
      }
      setUser(null);
      setPermissions([]);
    } catch (err) {
      console.warn('[BuildEcoGroup Auth] Session verification skipped:', err);
      setUser(null);
      setPermissions([]);
    }
  }, []);

  const exchangeGoogleToken = useCallback(async (googleRes: GoogleRegistrationIdentity) => {
    const serverRes = await fetchWithTimeout('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ idToken: googleRes.idToken, email: googleRes.email }),
    }, 12000);
    const data = await serverRes.json();
    if (!serverRes.ok || !data.success) {
      throw new Error(mapServerAuthError(data.error || 'Google authentication failed on server', serverRes.status));
    }
    setUser(data.user);
    setPermissions(data.permissions || []);
    setError(null);
    return data.user as SafeUser;
  }, []);

  // Background bootstrap — NEVER blocks public page render (children mount immediately).
  useEffect(() => {
    let cancelled = false;

    const bootstrapAuth = async () => {
      try {
        const googleRes = await clientCompleteGoogleRedirect();
        if (cancelled) return;

        if (googleRes) {
          const googleIntent = peekGoogleAuthIntent();
          clearGoogleAuthIntent();

          if (googleIntent === 'register') {
            setGoogleRegistrationIdentity(googleRes);
            setUser(null);
            setPermissions([]);
            setError(null);
            return;
          }

          await exchangeGoogleToken(googleRes);
          return;
        }

        await checkSession();
      } catch (err: unknown) {
        if (!cancelled) {
          const msg =
            (err as { name?: string })?.name === 'AbortError'
              ? 'Sign-in timed out. You can continue browsing — please try signing in again.'
              : mapFirebaseAuthError(err);
          setError(msg);
          await checkSession();
        }
      } finally {
        if (!cancelled) setSessionReady(true);
      }
    };

    const timer = setTimeout(() => {
      if (!cancelled) {
        console.warn('[BuildEcoGroup Auth] Bootstrap timeout — continuing as guest.');
        setSessionReady(true);
      }
    }, BOOTSTRAP_TIMEOUT_MS);

    bootstrapAuth().finally(() => clearTimeout(timer));
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [checkSession, exchangeGoogleToken]);

  const loginWithEmail = async (email: string, pass: string, rememberMe: boolean = false) => {
    setError(null);
    setIsLoading(true);
    try {
      const firebaseRes = await clientSignInWithEmail(email, pass);

      const serverRes = await fetchWithTimeout('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          idToken: firebaseRes.idToken,
          email: firebaseRes.email,
          rememberMe,
        }),
      }, 12000);

      const data = await serverRes.json();
      if (!serverRes.ok || !data.success) {
        throw new Error(mapServerAuthError(data.error || 'Authentication failed', serverRes.status, data.code));
      }

      setUser(data.user);
      setPermissions(data.permissions || []);
      return { success: true, user: data.user };
    } catch (err: unknown) {
      const msg = mapFirebaseAuthError(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (intent: 'login' | 'register' = 'login') => {
    setError(null);
    try {
      setGoogleAuthIntent(intent);
      await clientSignInWithGoogle();
      return { success: true, redirecting: true };
    } catch (err: unknown) {
      clearGoogleAuthIntent();
      const msg = mapFirebaseAuthError(err);
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const registerCustomer = async (input: CustomerRegistrationInput) => {
    setError(null);
    setIsLoading(true);
    try {
      const fb = googleRegistrationIdentity
        ? googleRegistrationIdentity
        : await clientSignUpWithEmail(input.email, input.password || '');

      const res = await fetchWithTimeout('/api/auth/register-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...input,
          idToken: fb.idToken,
        }),
      }, 15000);

      const data = await res.json();
      if (!res.ok || !data.success) {
        const fieldMsg = formatRegistrationFieldErrors(data.details);
        throw new Error(
          fieldMsg ||
          mapServerAuthError(data.error || 'Customer registration failed.', res.status, data.code)
        );
      }

      setUser(data.user);
      setPermissions(data.permissions || []);
      setGoogleRegistrationIdentity(null);
      return { success: true, user: data.user };
    } catch (err: unknown) {
      const msg = mapFirebaseAuthError(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const registerConsultant = async (input: any) => {
    setError(null);
    setIsLoading(true);
    try {
      let idToken: string | undefined;
      if (input.password) {
        const fb = await clientSignUpWithEmail(input.email, input.password);
        idToken = fb.idToken;
      }

      const res = await fetchWithTimeout('/api/auth/register-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...input, idToken }),
      }, 15000);

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(mapServerAuthError(data.error || 'Consultant registration failed.', res.status));
      }

      setUser(data.user);
      setPermissions(data.permissions || []);
      return { success: true, user: data.user };
    } catch (err: unknown) {
      const msg = mapFirebaseAuthError(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await clientSendPasswordReset(email);
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {
      // generic confirmation for security
    }
    return {
      success: true,
      message: 'Password reset instructions dispatched if an account exists for this address.',
    };
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      await clientSignOut();
    } catch (e) {
      console.warn('Logout error', e);
    } finally {
      setUser(null);
      setPermissions([]);
    }
  };

  const switchDevAccount = async (target: UserRole | 'SUSPENDED') => {
    if (import.meta.env.PROD) {
      setError('Demo account switching is disabled in production.');
      return;
    }
    setIsLoading(true);
    let devEmail = 'aditya.vardhan@ecoventures.in';

    if (target === 'SUPER_ADMIN') devEmail = 'superadmin@buildecogroup.in';
    else if (target === 'ADMIN') devEmail = 'admin@buildecogroup.in';
    else if (target === 'EMPLOYEE') devEmail = 'coordinator@buildecogroup.in';
    else if (target === 'CONSULTANT') devEmail = 'elena.rostova@beg-partner.in';
    else if (target === 'SUSPENDED') devEmail = 'suspended.user@example.com';

    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: devEmail }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setPermissions(data.permissions || []);
      } else if (data.status === 'SUSPENDED') {
        setError('Suspended Account: Access blocked server-side by security policy.');
      }
    } catch (e) {
      console.error('Dev account switch error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserPermission = (perm: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, perm);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: Boolean(user && user.status === 'ACTIVE'),
        isLoading,
        sessionReady,
        error,
        permissions,
        hasPermission: checkUserPermission,
        loginWithEmail,
        loginWithGoogle,
        googleRegistrationIdentity,
        clearGoogleRegistrationIdentity,
        registerCustomer,
        registerConsultant,
        sendPasswordReset,
        logout,
        switchDevAccount,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
