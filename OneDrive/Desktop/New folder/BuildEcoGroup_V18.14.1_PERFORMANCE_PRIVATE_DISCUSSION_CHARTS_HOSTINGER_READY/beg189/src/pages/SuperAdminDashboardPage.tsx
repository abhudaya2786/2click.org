import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import { useAuth } from '../contexts/AuthContext';
import { SafeUser, UserRole, UserStatus } from '../types/auth';
import { RoleBadge } from '../components/auth/RoleBadge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { 
  Crown, 
  ShieldCheck, 
  Users, 
  Activity, 
  AlertTriangle, 
  Lock, 
  RefreshCw, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export const SuperAdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Role edit modal state
  const [selectedUser, setSelectedUser] = useState<SafeUser | null>(null);
  const [targetRole, setTargetRole] = useState<UserRole>('CUSTOMER');
  const [roleReason, setRoleReason] = useState('');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Status edit modal state
  const [targetStatus, setTargetStatus] = useState<UserStatus>('ACTIVE');
  const [statusReason, setStatusReason] = useState('');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, logsRes] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/admin/audit-logs', { credentials: 'include' }),
      ]);

      if (usersRes.ok) {
        const uData = await usersRes.json();
        if (uData.success) setUsers(uData.users);
      }

      if (logsRes.ok) {
        const lData = await logsRes.json();
        if (lData.success) setAuditLogs(lData.logs);
      }
    } catch (err) {
      console.error('Super admin fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !roleReason.trim()) return;

    setIsUpdatingRole(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          newRole: targetRole,
          reason: roleReason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({ type: 'success', message: data.message });
        setIsRoleModalOpen(false);
        fetchData();
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to update user role.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error occurred.' });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !statusReason.trim()) return;

    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          newStatus: targetStatus,
          reason: statusReason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({ type: 'success', message: data.message });
        setIsStatusModalOpen(false);
        fetchData();
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to update account status.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error occurred.' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#191C1A] to-[#2D332F] text-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#6B21A8] text-white">
              <Crown className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#D8B4FE]">
              Highest Authority Tier
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Super Admin Command Center</h1>
          <p className="text-xs text-[#A1A1AA]">
            Authoritative RBAC role assignments, cryptographic audit stream, and user lifecycle controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to={ROUTES.COMMERCIAL_SUITE}>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4 text-purple-300" />}
              className="bg-purple-900/60 text-purple-200 border-purple-700/50 hover:bg-purple-800"
            >
              Commercial Engine
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchData}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="bg-[var(--color-surface)]/10 text-white border-white/20 hover:bg-[var(--color-surface)]/20"
          >
            Refresh Audit Feed
          </Button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
          notification.type === 'success'
            ? 'bg-[var(--color-primary-subtle)] border-[#C3DCCF] text-[var(--color-primary)]'
            : 'bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]'
        }`}>
          <span>{notification.message}</span>
          <button type="button" onClick={() => setNotification(null)} className="hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-2 border-[var(--color-border)]">
          <div className="flex items-center justify-between text-[#71717A]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-[var(--color-primary)]" />
          </div>
          <div className="text-2xl font-bold text-[var(--color-text)]">{users.length}</div>
          <div className="text-[11px] text-[var(--color-text-muted)]">Across all 5 authority tiers</div>
        </Card>

        <Card className="p-5 space-y-2 border-[var(--color-border)]">
          <div className="flex items-center justify-between text-[#71717A]">
            <span className="text-xs font-bold uppercase tracking-wider">Active Admins</span>
            <ShieldCheck className="w-4 h-4 text-[#0369A1]" />
          </div>
          <div className="text-2xl font-bold text-[var(--color-text)]">
            {users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length}
          </div>
          <div className="text-[11px] text-[var(--color-text-muted)]">Privileged platform officers</div>
        </Card>

        <Card className="p-5 space-y-2 border-[var(--color-border)]">
          <div className="flex items-center justify-between text-[#71717A]">
            <span className="text-xs font-bold uppercase tracking-wider">Consultants</span>
            <Crown className="w-4 h-4 text-[#92400E]" />
          </div>
          <div className="text-2xl font-bold text-[var(--color-text)]">
            {users.filter(u => u.role === 'CONSULTANT').length}
          </div>
          <div className="text-[11px] text-[var(--color-text-muted)]">Empaneled specialists</div>
        </Card>

        <Card className="p-5 space-y-2 border-[var(--color-border)]">
          <div className="flex items-center justify-between text-[#71717A]">
            <span className="text-xs font-bold uppercase tracking-wider">Security Events</span>
            <Activity className="w-4 h-4 text-[#6B21A8]" />
          </div>
          <div className="text-2xl font-bold text-[var(--color-text)]">{auditLogs.length}</div>
          <div className="text-[11px] text-[var(--color-text-muted)]">Logged in immutable audit ledger</div>
        </Card>
      </div>

      {/* User Management Section */}
      <Card className="p-6 space-y-5 border-[var(--color-border)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">Authoritative Identity Directory</h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Inspect accounts, enforce RBAC roles, or apply compliance suspensions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Input
                placeholder="Search user or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-[#D1D5DB] bg-[var(--color-surface)] text-[#374151] font-semibold focus:ring-[#1697C4]"
            >
              <option value="ALL">All Roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="VENDOR">Vendor</option>
              <option value="CONSULTANT">Consultant</option>
              <option value="EMPLOYEE">Coordinator</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-[#71717A] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">User & Organization</th>
                <th className="py-3 px-3">Role Tier</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Registered</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-[var(--color-text)]">{u.fullName}</div>
                    <div className="text-[var(--color-text-muted)] font-mono-code text-[11px]">{u.email}</div>
                    {u.profile?.organization && (
                      <div className="text-[10px] text-[var(--color-brand-brown)]">{u.profile.organization}</div>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <RoleBadge role={u.role} size="sm" />
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      u.status === 'ACTIVE'
                        ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]'
                        : u.status === 'SUSPENDED'
                        ? 'bg-[#FEF2F2] text-[#DC2626]'
                        : 'bg-[#F3F4F6] text-[#6B7280]'
                    }`}>
                      {u.status === 'ACTIVE' && <CheckCircle2 className="w-3 h-3" />}
                      {u.status === 'SUSPENDED' && <ShieldAlert className="w-3 h-3" />}
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[var(--color-text-muted)]">
                    {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(u);
                        setTargetRole(u.role);
                        setRoleReason('');
                        setIsRoleModalOpen(true);
                      }}
                    >
                      Change Role
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/admin/users/${u.id}/password-reset`, {
                            method: 'POST',
                            credentials: 'include',
                          });
                          const data = await res.json();
                          setNotification({
                            type: res.ok && data.success ? 'success' : 'error',
                            message: data.message || data.error || 'Password reset request failed.',
                          });
                        } catch (err: unknown) {
                          setNotification({
                            type: 'error',
                            message: err instanceof Error ? err.message : 'Password reset request failed.',
                          });
                        }
                      }}
                    >
                      Reset Password
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(u);
                        setTargetStatus(u.status);
                        setStatusReason('');
                        setIsStatusModalOpen(true);
                      }}
                      className={u.status === 'SUSPENDED' ? 'text-[var(--color-primary)]' : 'text-[#DC2626]'}
                    >
                      {u.status === 'SUSPENDED' ? 'Reactivate' : 'Status'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Security Audit Log Stream */}
      <Card className="p-6 space-y-4 border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">Cryptographic Security Audit Log</h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Real-time authoritative trail of all login events, role promotions, and status modifications.
            </p>
          </div>
          <Badge variant="neutral" size="sm">
            Event Stream
          </Badge>
        </div>

        <div className="space-y-2">
          {auditLogs.slice(0, 10).map((log, idx) => (
            <div
              key={log.id || idx}
              className="p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                <span className="font-bold text-[var(--color-text)]">{log.action}</span>
                <span className="text-[var(--color-text-muted)] font-mono-code">[{log.entityType} : {log.entityId}]</span>
              </div>
              <div className="flex items-center gap-3 text-[#71717A] text-[11px]">
                {log.changes && (
                  <span className="font-mono-code text-[10px] bg-[var(--color-surface)] px-2 py-0.5 rounded border border-[#E5E7EB]">
                    {JSON.stringify(log.changes)}
                  </span>
                )}
                <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Change Role Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title={`Change Authority Role: ${selectedUser?.fullName}`}
        description="Alter the user's authoritative platform permissions. This action is permanently audited."
      >
        <form onSubmit={handleRoleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#374151]">New Authority Role</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value as UserRole)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#D1D5DB] bg-[var(--color-surface)] font-bold"
            >
              <option value="CUSTOMER">CUSTOMER (Client Member)</option>
              <option value="VENDOR">VENDOR (Assigned Partner)</option>
              <option value="CONSULTANT">CONSULTANT (Empaneled Specialist)</option>
              <option value="EMPLOYEE">EMPLOYEE (Operations Coordinator)</option>
              <option value="ADMIN">ADMIN (Platform Administrator)</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN (Platform Directorate)</option>
            </select>
          </div>

          <Input
            label="Audit Justification Reason"
            placeholder="e.g. Approved statutory empanelment elevation by Directorate..."
            value={roleReason}
            onChange={(e) => setRoleReason(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsRoleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUpdatingRole}
              rightIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Confirm Role Change
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Update Account Status: ${selectedUser?.fullName}`}
        description="Set account state to ACTIVE, SUSPENDED, or DISABLED."
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#374151]">Account Status</label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as UserStatus)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#D1D5DB] bg-[var(--color-surface)] font-bold"
            >
              <option value="ACTIVE">ACTIVE (Full access permitted)</option>
              <option value="SUSPENDED">SUSPENDED (Access blocked by security)</option>
              <option value="DISABLED">DISABLED (Account archived)</option>
            </select>
          </div>

          <Input
            label="Compliance Reason"
            placeholder="e.g. Periodic statutory review / Reactivated post document verification..."
            value={statusReason}
            onChange={(e) => setStatusReason(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsStatusModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUpdatingStatus}
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Apply Status Update
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
