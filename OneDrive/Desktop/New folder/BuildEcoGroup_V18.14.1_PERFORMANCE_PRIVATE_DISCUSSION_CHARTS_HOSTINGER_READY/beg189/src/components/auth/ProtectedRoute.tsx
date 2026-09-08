import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, Permission } from '../../types/auth';
import { getDashboardRouteForRole } from '../../lib/permissions';
import { RoleBadge } from './RoleBadge';
import { ShieldAlert, Lock, ArrowRight, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: Permission;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermission,
}) => {
  const { user, isAuthenticated, sessionReady, hasPermission, logout } = useAuth();
  const location = useLocation();

  // 1. Wait for background session bootstrap (protected routes only — public pages never hit this).
  if (!sessionReady) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-subtle)] border border-[#C3DCCF] flex items-center justify-center mb-4 animate-pulse">
          <RefreshCw className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
        </div>
        <h3 className="text-base font-bold text-[var(--color-text)]">Verifying BuildEcoGroup Session</h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">Validating server-authoritative role and cryptographic credentials...</p>
      </div>
    );
  }

  // 2. Unauthenticated -> Redirect to Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Suspended Account Block
  if (user.status === 'SUSPENDED') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[var(--color-surface)] border border-[#FCA5A5] shadow-xs text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] border border-[#F87171] text-[#DC2626] flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text)]">Account Suspended</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-2 leading-relaxed">
            Your BuildEcoGroup account has been temporarily suspended pending platform compliance review. Access to project workspaces and sensitive telemetry is restricted.
          </p>
          <div className="mt-6 pt-4 border-t border-[#F3F4F6] flex justify-center">
            <Button variant="secondary" size="sm" onClick={() => logout()} leftIcon={<LogOut className="w-4 h-4" />}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Role Authorization Check
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const authorizedRoute = getDashboardRouteForRole(user.role);

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-lg w-full p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FFFBEB] border border-[#FCD34D] text-[#D97706] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text)]">Access Restricted (RBAC Policy)</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            Your active role does not have authorization to view this workspace partition.
          </p>

          <div className="my-6 p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-between">
            <div className="text-left">
              <div className="text-xs text-[var(--color-text-subtle)] uppercase font-bold">Your Active Role</div>
              <div className="text-sm font-bold text-[var(--color-text)] mt-0.5">{user.fullName}</div>
            </div>
            <RoleBadge role={user.role} size="md" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={authorizedRoute}>
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Go to Authorized Workspace
              </Button>
            </Link>
            <Button variant="secondary" size="md" onClick={() => logout()} leftIcon={<LogOut className="w-4 h-4" />}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Permission Authorization Check
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text)]">Missing Permission</h2>
          <p className="text-xs font-mono-code bg-[#F3F4F6] p-2 rounded-lg text-[#374151] my-4">
            {requiredPermission}
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            This operation requires explicit administrative privileges.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
