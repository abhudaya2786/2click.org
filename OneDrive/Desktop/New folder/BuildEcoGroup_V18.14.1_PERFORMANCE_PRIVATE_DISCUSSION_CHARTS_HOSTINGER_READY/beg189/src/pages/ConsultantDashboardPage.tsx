import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ROUTES } from '../lib/routes';
import {
  Clock,
  CheckCircle2,
  FolderKanban,
  MapPin,
  Check,
  ArrowRight,
  Eye,
  MessageSquare,
  Calendar,
  FileSpreadsheet,
  User,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
} from 'lucide-react';
import {
  fetchConsultantAssignmentsApi,
  respondToAssignmentApi,
  fetchAllCasesApi,
} from '../lib/api';
import { AssignmentRecord } from '../types/backend';
import { useAuth } from '../contexts/AuthContext';
import {
  CONSULTANT_TABS,
  ConsultantDashboardTab,
  filterAssignmentsByTab,
  tabCount,
  mergeCasesIntoAssignments,
  getCaseStatus,
} from '../lib/consultantDashboard';

function AssignmentCard({
  assign,
  onAccept,
  onDecline,
  isSubmitting,
}: {
  assign: AssignmentRecord;
  onAccept?: (a: AssignmentRecord) => void;
  onDecline?: (a: AssignmentRecord) => void;
  isSubmitting?: boolean;
}) {
  const c = assign.caseSummary || assign.case;
  const caseRef = c?.caseReference || assign.caseReference;
  const status = getCaseStatus(assign);

  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <code className="rounded bg-[#191C1A] px-2 py-0.5 text-xs font-bold text-[#A8D4E5]">{caseRef}</code>
          <h3 className="mt-1 text-base font-bold text-[var(--color-text)]">{c?.projectTitle}</h3>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
            <MapPin className="h-3.5 w-3.5" />
            {c?.city}, {c?.stateRegion}
          </p>
        </div>
        <Badge variant="neutral" size="sm">{status.replace(/_/g, ' ') || assign.status}</Badge>
      </div>
      {c?.scopeDescription && (
        <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">{c.scopeDescription}</p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-border)] pt-3">
        {c?.budgetRange && (
          <span className="text-[11px] text-[var(--color-text-muted)]">Budget: <strong>{c.budgetRange}</strong></span>
        )}
        <div className="flex gap-2">
          {onDecline && (assign.status === 'PENDING' || assign.status === 'OFFERED') && (
            <Button variant="secondary" size="sm" onClick={() => onDecline(assign)}>Decline</Button>
          )}
          {onAccept && (assign.status === 'PENDING' || assign.status === 'OFFERED') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAccept(assign)}
              disabled={isSubmitting}
              leftIcon={<Check className="h-4 w-4" />}
            >
              Accept
            </Button>
          )}
          {caseRef && (
            <Link to={`/projects/${encodeURIComponent(caseRef)}`}>
              <Button variant="secondary" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                Open Workspace
              </Button>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export const ConsultantDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ConsultantDashboardTab>('new-assignments');
  const [availableForWork, setAvailableForWork] = useState(true);

  const [selectedAssignmentForDecline, setSelectedAssignmentForDecline] = useState<AssignmentRecord | null>(null);
  const [declineReason, setDeclineReason] = useState('Capacity / Schedule constraint');
  const [declineNotes, setDeclineNotes] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [assignRes, casesRes] = await Promise.all([
        fetchConsultantAssignmentsApi(),
        fetchAllCasesApi().catch(() => ({ cases: [] })),
      ]);
      const merged = mergeCasesIntoAssignments(assignRes.assignments || [], casesRes.cases || []);
      setAssignments(merged);
    } catch (err) {
      console.error('Failed to fetch consultant data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcceptAssignment = async (assignment: AssignmentRecord) => {
    setIsSubmittingResponse(true);
    try {
      const res = await respondToAssignmentApi(assignment.id, {
        action: 'accept',
        responseNotes: 'Accepted specialist assignment. Initiating scope discovery.',
      });
      setNotification(`Case ${res.case.caseReference} accepted.`);
      await loadData();
      setActiveTab('accepted');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to accept assignment.';
      setNotification(message);
    } finally {
      setIsSubmittingResponse(false);
      setTimeout(() => setNotification(null), 4500);
    }
  };

  const handleDeclineSubmit = async () => {
    if (!selectedAssignmentForDecline) return;
    setIsSubmittingResponse(true);
    try {
      await respondToAssignmentApi(selectedAssignmentForDecline.id, {
        action: 'decline',
        reason: declineReason,
        responseNotes: declineNotes,
      });
      setNotification('Assignment declined. Case returned to coordinator.');
      setSelectedAssignmentForDecline(null);
      setDeclineNotes('');
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to decline assignment.';
      setNotification(message);
    } finally {
      setIsSubmittingResponse(false);
      setTimeout(() => setNotification(null), 4500);
    }
  };

  const filtered = useMemo(
    () => filterAssignmentsByTab(assignments, activeTab),
    [assignments, activeTab]
  );

  const pendingCount = tabCount(assignments, 'new-assignments');

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[var(--color-text)] sm:text-3xl">Consultant Dashboard</h1>
            <Badge variant="primary" size="sm">Empaneled Partner</Badge>
          </div>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Welcome, <strong>{user?.fullName}</strong>. Manage assignments, deliverables, and client coordination.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={availableForWork ? 'success' : 'neutral'} size="sm">
            {availableForWork ? 'Available for assignments' : 'Unavailable'}
          </Badge>
          {pendingCount > 0 && (
            <Badge variant="warning" size="sm">{pendingCount} new offer{pendingCount === 1 ? '' : 's'}</Badge>
          )}
        </div>
      </div>

      {notification && (
        <div className="flex items-center justify-between rounded-xl border border-[#B9DDEA] bg-[var(--color-primary-subtle)] p-4 text-sm font-semibold text-[var(--color-primary)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <span>{notification}</span>
          </div>
          <button type="button" onClick={() => setNotification(null)} className="text-xs hover:underline">Dismiss</button>
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none" data-testid="consultant-dashboard-tabs">
        {CONSULTANT_TABS.map((tab) => {
          const count = tabCount(assignments, tab.id);
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
                isActive
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] ${isActive ? 'bg-white/20' : 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C6DEE8] border-t-[var(--color-primary)]" />
        </div>
      ) : (
        <>
          {['new-assignments', 'assigned', 'accepted', 'in-progress', 'waiting-customer', 'documents', 'completed'].includes(activeTab) && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--color-text)]">
                {CONSULTANT_TABS.find((t) => t.id === activeTab)?.label}
              </h2>
              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)] p-8 text-center text-sm text-[var(--color-text-muted)]">
                  No items in this section right now.
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((assign) => (
                    <AssignmentCard
                      key={assign.id}
                      assign={assign}
                      onAccept={activeTab === 'new-assignments' ? handleAcceptAssignment : undefined}
                      onDecline={activeTab === 'new-assignments' ? setSelectedAssignmentForDecline : undefined}
                      isSubmitting={isSubmittingResponse}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'messages' && (
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center space-y-4">
              <MessageSquare className="mx-auto h-10 w-10 text-[var(--color-primary)]" />
              <h2 className="text-lg font-bold text-[var(--color-text)]">Messages & Updates</h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                Case conversations and coordinator updates are in your message centre.
              </p>
              <Link to={ROUTES.MESSAGES}>
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Open Messages
                </Button>
              </Link>
            </section>
          )}

          {activeTab === 'appointments' && (
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--color-text)]">
                <Calendar className="h-5 w-5 text-[var(--color-primary)]" />
                Appointments
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                Site visits and client calls are coordinated through your case workspaces. Upcoming items appear on assigned cases.
              </p>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-xs text-[var(--color-text-muted)]">
                No standalone appointments scheduled. Open an active case workspace to propose a site visit or review call.
              </div>
            </section>
          )}

          {activeTab === 'profile' && (
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--color-text)]">
                <User className="h-5 w-5 text-[var(--color-primary)]" />
                Profile
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                  <span className="text-[10px] font-bold uppercase text-[var(--color-text-subtle)]">Name</span>
                  <p className="font-bold text-[var(--color-text)]">{user?.fullName}</p>
                </div>
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                  <span className="text-[10px] font-bold uppercase text-[var(--color-text-subtle)]">Designation</span>
                  <p className="font-bold text-[var(--color-text)]">{user?.profile?.designation || 'Consultant'}</p>
                </div>
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                  <span className="text-[10px] font-bold uppercase text-[var(--color-text-subtle)]">Organization</span>
                  <p className="font-bold text-[var(--color-text)]">{user?.profile?.organization || '—'}</p>
                </div>
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                  <span className="text-[10px] font-bold uppercase text-[var(--color-text-subtle)]">Location</span>
                  <p className="font-bold text-[var(--color-text)]">
                    {[user?.profile?.city, user?.profile?.stateRegion].filter(Boolean).join(', ') || '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--color-primary)]">
                <ShieldCheck className="h-4 w-4" />
                <span>Verified empanelment — contact details are managed by BuildEcoGroup desk, not shown publicly.</span>
              </div>
              <Link to={ROUTES.ONBOARDING}>
                <Button variant="secondary" size="sm">Update Credentials / Portfolio</Button>
              </Link>
            </section>
          )}

          {activeTab === 'availability' && (
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
              <h2 className="text-lg font-bold text-[var(--color-text)]">Availability</h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                Toggle whether you are open to receive new assignment offers from coordinators.
              </p>
              <button
                type="button"
                onClick={() => {
                  setAvailableForWork((v) => !v);
                  setNotification(availableForWork ? 'Marked unavailable for new assignments.' : 'You are now available for new assignments.');
                  setTimeout(() => setNotification(null), 3000);
                }}
                className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm font-bold text-[var(--color-text)]"
              >
                {availableForWork ? (
                  <ToggleRight className="h-8 w-8 text-[var(--color-primary)]" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-[var(--color-text-muted)]" />
                )}
                {availableForWork ? 'Available — accepting new assignments' : 'Unavailable — not accepting new assignments'}
              </button>
            </section>
          )}
        </>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <FolderKanban className="mb-2 h-5 w-5 text-[var(--color-primary)]" />
          <p className="text-2xl font-extrabold">{tabCount(assignments, 'in-progress')}</p>
          <p className="text-[10px] font-bold uppercase text-[var(--color-text-muted)]">In Progress</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <Clock className="mb-2 h-5 w-5 text-amber-600" />
          <p className="text-2xl font-extrabold">{pendingCount}</p>
          <p className="text-[10px] font-bold uppercase text-[var(--color-text-muted)]">New Offers</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <FileSpreadsheet className="mb-2 h-5 w-5 text-[var(--color-brand-brown)]" />
          <p className="text-2xl font-extrabold">{tabCount(assignments, 'documents')}</p>
          <p className="text-[10px] font-bold uppercase text-[var(--color-text-muted)]">BOQ Tasks</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <CheckCircle2 className="mb-2 h-5 w-5 text-green-600" />
          <p className="text-2xl font-extrabold">{tabCount(assignments, 'completed')}</p>
          <p className="text-[10px] font-bold uppercase text-[var(--color-text-muted)]">Completed</p>
        </div>
      </div>

      {selectedAssignmentForDecline && (
        <Modal isOpen={true} onClose={() => setSelectedAssignmentForDecline(null)} title="Decline Assignment">
          <div className="space-y-4 text-xs">
            <p className="text-[var(--color-text-muted)]">
              This case will be returned to the coordinator matching queue.
            </p>
            <div>
              <label className="mb-1 block font-bold">Reason</label>
              <select
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-2.5"
              >
                <option value="Capacity / Schedule constraint">Capacity / Schedule constraint</option>
                <option value="Outside geographic coverage">Outside geographic coverage</option>
                <option value="Domain specialization mismatch">Domain specialization mismatch</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block font-bold">Notes</label>
              <textarea
                rows={3}
                value={declineNotes}
                onChange={(e) => setDeclineNotes(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border-strong)] p-2.5"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedAssignmentForDecline(null)}>Cancel</Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDeclineSubmit}
                disabled={isSubmittingResponse}
              >
                Confirm Decline
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
