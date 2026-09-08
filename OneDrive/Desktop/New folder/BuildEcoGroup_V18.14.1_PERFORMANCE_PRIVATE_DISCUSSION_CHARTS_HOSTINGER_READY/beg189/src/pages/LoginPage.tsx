import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardRouteForRole } from '../lib/permissions';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { 
  LogIn, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Sparkles,
  Users,
  Briefcase,
  Crown,
  CheckCircle2,
  Send
} from 'lucide-react';
import { UserRole } from '../types/auth';
import { AppIcon } from '../components/ui/AppIcon';
import { consumeAuthReturnPath } from '../lib/firebase';
import { DEV_ROLE_ICON } from '../lib/iconSystem';
import { captureProductEvent, PRODUCT_EVENTS } from '../lib/analytics';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const quickSwitchRoleRef = useRef<UserRole | null>(null);

  const { user, isAuthenticated, loginWithEmail, loginWithGoogle, sendPasswordReset, switchDevAccount, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const redirectTarget = (location.state as any)?.from?.pathname || consumeAuthReturnPath();

  // Surface Google redirect / bootstrap errors on the login form.
  useEffect(() => {
    if (authError) {
      setLocalError(authError);
    }
  }, [authError]);

  useEffect(() => {
    if (searchParams.get('forgot') === '1') {
      setForgotEmail(email);
      setForgotSubmitted(false);
      setIsForgotModalOpen(true);
    }
  }, [searchParams]);

  // After Firebase redirect completes, AuthContext restores the session here.
  useEffect(() => {
    if (isAuthenticated && user) {
      const quickSwitchRole = quickSwitchRoleRef.current;
      quickSwitchRoleRef.current = null;
      const dest = quickSwitchRole
        ? getDashboardRouteForRole(quickSwitchRole)
        : redirectTarget || getDashboardRouteForRole(user.role);
      navigate(dest, { replace: true, state: null });
    }
  }, [isAuthenticated, user, redirectTarget, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    setLocalError(null);
    setIsSubmitting(true);

    try {
      const res = await loginWithEmail(email.trim(), password, rememberMe);
      if (res.success && res.user) {
        captureProductEvent(PRODUCT_EVENTS.LOGIN_SUCCEEDED, { method: 'email' });
        const dest = redirectTarget || getDashboardRouteForRole(res.user.role);
        navigate(dest);
      } else {
        captureProductEvent(PRODUCT_EVENTS.LOGIN_FAILED, { error_code: 'LOGIN_FAILED' });
        setLocalError(res.error || 'Invalid credentials or account is not active.');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError(null);
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle('login');
      if (res.success && res.user) {
        const dest = redirectTarget || getDashboardRouteForRole(res.user.role);
        navigate(dest);
      } else if (res.redirecting) {
        // Browser is leaving for Google; no local error should be shown.
        return;
      } else {
        setLocalError(res.error || 'Google sign-in could not be completed.');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Google sign-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSwitch = async (role: UserRole | 'SUSPENDED') => {
    setIsSubmitting(true);
    setLocalError(null);
    quickSwitchRoleRef.current = role === 'SUSPENDED' ? null : role;
    try {
      await switchDevAccount(role);
      if (role === 'SUSPENDED') {
        setLocalError('Account is SUSPENDED. The security layer blocked session creation.');
      } else {
        navigate(getDashboardRouteForRole(role as UserRole), { replace: true, state: null });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setIsForgotLoading(true);
    try {
      await sendPasswordReset(forgotEmail.trim());
      captureProductEvent(PRODUCT_EVENTS.PASSWORD_RESET_REQUESTED, { source: 'login_modal' });
      setForgotSubmitted(true);
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card variant="default" className="p-6 sm:p-8 space-y-6 shadow-xs border-[var(--color-border)]">
        
        {/* Header Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 mx-auto">
            <Badge variant="primary" size="sm">
              Phase 3 Production Auth & RBAC
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">
            Sign In to BuildEcoGroup
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
            Authoritative session security for Clients, Consultants, and Directorate.
          </p>
        </div>

        {/* Error Alert Box */}
        {localError && (
          <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-start gap-3 text-xs text-[#991B1B]">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{localError}</div>
          </div>
        )}

        {/* Google Sign-In Primary Trigger */}
        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-[#D1D5DB] bg-[var(--color-surface)] hover:bg-[#F9FAFB] text-sm font-semibold text-[#1F2937] transition-all shadow-2xs hover:border-[#9CA3AF] disabled:opacity-50 touch-target"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#E5E7EB] w-full" />
          <span className="bg-[var(--color-surface)] px-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider absolute">
            Or with email
          </span>
        </div>

        {/* Standard Email + Password Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. aditya.vardhan@ecoventures.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <div className="space-y-1.5">
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-[#6B7280] hover:text-[#111827] focus:outline-hidden"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-[#4B5563] cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#D1D5DB] text-[var(--color-primary)] focus:ring-[#1697C4]"
              />
              <span>Remember session (7 days)</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setForgotEmail(email);
                setForgotSubmitted(false);
                setIsForgotModalOpen(true);
              }}
              className="rounded-md px-1.5 py-1 font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-primary-subtle)] hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Authenticate & Enter
          </Button>
        </form>

        {/* Quick Role Switcher is development-only; never expose seeded/admin shortcuts in production. */}
        {import.meta.env.DEV && (
        <div className="p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
              Test Pre-Seeded Identities (RBAC Matrix)
            </span>
            <span className="text-[10px] text-[var(--color-primary)] font-semibold bg-[var(--color-primary-subtle)] px-2 py-0.5 rounded-full">
              PostgreSQL Verified
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
            {(
              [
                ['CUSTOMER', 'Client', 'Aditya', 'aditya.vardhan@ecoventures.in'],
                ['CONSULTANT', 'Consultant', 'Elena', 'elena.rostova@beg-partner.in'],
                ['EMPLOYEE', 'Coordinator', 'Rohan', 'coordinator@buildecogroup.in'],
                ['ADMIN', 'Admin Ops', 'Priya', 'admin@buildecogroup.in'],
                ['SUPER_ADMIN', 'Super Admin', '', 'superadmin@buildecogroup.in'],
                ['SUSPENDED', 'Suspended User', '', 'suspended.user@example.com'],
              ] as const
            ).map(([role, label, name, demoId]) => (
            <button
              key={role}
              type="button"
              onClick={() => handleQuickSwitch(role)}
              title={`Demo ID: ${demoId}`}
              className={`min-w-0 px-2.5 py-2 rounded-lg border text-left font-medium transition-colors flex items-start gap-1.5 ${
                role === 'SUSPENDED'
                  ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626] hover:bg-[#FEE2E2]'
                  : 'bg-[var(--color-surface)] border-[#E5E7EB] text-[#374151] hover:border-[#1697C4] hover:text-[var(--color-primary)]'
              }`}
            >
              <AppIcon name={DEV_ROLE_ICON[role]} size="sm" decorative className="mt-0.5 shrink-0" />
              <span className="min-w-0">
                <span className="block"><strong>{label}</strong>{name ? ` (${name})` : ''}</span>
                <span className="mt-0.5 block truncate font-mono-code text-[9px] font-normal opacity-70">{demoId}</span>
              </span>
            </button>
            ))}
          </div>
        </div>
        )}

        {/* Registration CTA Footer */}
        <div className="pt-2 text-center text-xs text-[var(--color-text-muted)] space-y-1">
          <div>
            <span>New project owner or developer? </span>
            <Link to={ROUTES.REGISTER} className="font-bold text-[var(--color-primary)] hover:underline">
              Create Customer Account
            </Link>
          </div>
          <div>
            <span>Statutory specialist or engineer? </span>
            <Link to={ROUTES.CONSULTANTS_JOIN} className="font-bold text-[var(--color-brand-brown)] hover:underline">
              Apply for Consultant Empanelment
            </Link>
          </div>
        </div>

      </Card>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Account Password"
        description="Enter your verified email address to receive password reset instructions."
      >
        {forgotSubmitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary-subtle)] border border-[#C3DCCF] text-[var(--color-primary)] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-text)]">Instructions Dispatched</h3>
            <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
              If an active account exists for <strong>{forgotEmail}</strong>, an encrypted reset link has been dispatched.
            </p>
            <Button variant="primary" size="sm" onClick={() => setIsForgotModalOpen(false)}>
              Back to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 pt-2">
            <Input
              label="Account Email"
              type="email"
              placeholder="e.g. aditya.vardhan@ecoventures.in"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsForgotModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isForgotLoading}
                rightIcon={<Send className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
