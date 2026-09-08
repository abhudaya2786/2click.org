import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, KeyRound, Mail, Phone, Loader2, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../lib/routes';

// Real account settings backed by the authenticated user's actual profile data.
// Profile-field editing (name/phone) is not wired here because no backend
// update-profile endpoint exists yet in this codebase (server/authRoutes.ts
// has no PATCH /api/auth/me) -- rather than fake a save button that silently
// does nothing, this page only exposes actions that are actually implemented:
// password reset (sendPasswordReset) and sign out (logout).
export const SettingsPage: React.FC = () => {
  const { user, logout, sendPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [resetState, setResetState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleLogout = async () => {
    setSigningOut(true);
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setResetState('sending');
    try {
      const res = await sendPasswordReset(user.email);
      setResetMessage(res.message);
      setResetState(res.success ? 'sent' : 'error');
    } catch (err: any) {
      setResetMessage(err.message || 'Failed to send reset email');
      setResetState('error');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Account & Privacy Settings</h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">Profile, security, and account controls.</p>
      </div>

      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <h2 className="text-sm font-bold text-[var(--color-text)]">Profile</h2>
          <Badge variant="primary" size="sm">{user.role.replace('_', ' ')}</Badge>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-[var(--color-text-muted)] mb-1">Full name</div>
            <div className="font-semibold text-[var(--color-text)]">{user.fullName}</div>
          </div>
          <div>
            <div className="text-[var(--color-text-muted)] mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</div>
            <div className="font-semibold text-[var(--color-text)] flex items-center gap-2">
              {user.email}
              {user.emailVerified && <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
            </div>
          </div>
          {user.phone && (
            <div>
              <div className="text-[var(--color-text-muted)] mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</div>
              <div className="font-semibold text-[var(--color-text)]">{user.phone}</div>
            </div>
          )}
          <div>
            <div className="text-[var(--color-text-muted)] mb-1">Account status</div>
            <div className="font-semibold text-[var(--color-text)]">{user.status.replace('_', ' ')}</div>
          </div>
        </div>

        <p className="text-[11px] text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]">
          Editing name/phone directly isn't available yet -- contact support to update these details.
        </p>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-4">
          <KeyRound className="w-4 h-4 text-[var(--color-primary)]" />
          <h2 className="text-sm font-bold text-[var(--color-text)]">Security</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[var(--color-text)]">Password</p>
            <p className="text-[11px] text-[var(--color-text-muted)]">Send a password reset link to your email.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePasswordReset}
            disabled={resetState === 'sending'}
            leftIcon={resetState === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
          >
            {resetState === 'sent' ? 'Email sent' : 'Send reset link'}
          </Button>
        </div>
        {resetMessage && (
          <p className={`text-[11px] ${resetState === 'error' ? 'text-red-600' : 'text-green-700'}`}>{resetMessage}</p>
        )}
      </Card>

      <Card className="p-4 bg-[#EAF4F8] border-[#C6DEE8] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[var(--color-brand-brown)] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#0C2939] leading-relaxed">
          Your account role and permissions are enforced server-side and cannot be changed from this page.
        </p>
      </Card>

      <div className="pt-2">
        <Button
          variant="danger"
          size="md"
          onClick={handleLogout}
          disabled={signingOut}
          leftIcon={signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
};
