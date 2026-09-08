import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  UserCheck,
  Clock,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CaseRecord } from '../../types/backend';
import { ROUTES } from '../../lib/routes';
import {
  formatRequestStatus,
  getAssignedConsultantLabel,
  getLatestActivityLabel,
  getNextActionLabel,
  getRequestCategoryLabel,
} from '../../lib/requestDisplay';

type RequestTab =
  | 'ALL'
  | 'NEW'
  | 'IN_REVIEW'
  | 'CONSULTANT_ASSIGNED'
  | 'BOQ'
  | 'QUOTATION'
  | 'IN_PROGRESS'
  | 'WAITING'
  | 'COMPLETED'
  | 'CLOSED';

const TAB_CONFIG: { id: RequestTab; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'NEW', label: 'New' },
  { id: 'IN_REVIEW', label: 'In Review' },
  { id: 'CONSULTANT_ASSIGNED', label: 'Consultant Assigned' },
  { id: 'BOQ', label: 'BOQ / Estimate' },
  { id: 'QUOTATION', label: 'Quotation' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'WAITING', label: 'Waiting for You' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'CLOSED', label: 'Closed' },
];

function matchesTab(caseRecord: CaseRecord, tab: RequestTab): boolean {
  const s = caseRecord.status;
  switch (tab) {
    case 'ALL':
      return true;
    case 'NEW':
      return ['NEW', 'QUALIFICATION_PENDING', 'QUALIFICATION'].includes(s);
    case 'IN_REVIEW':
      return ['CUSTOMER_REVIEW', 'COORDINATOR_ASSIGNED', 'MATCHING', 'PROPOSAL_PENDING', 'NEEDS_INFORMATION'].includes(s);
    case 'CONSULTANT_ASSIGNED':
      return ['CONSULTANT_ASSIGNED', 'CONSULTANT_ACCEPTED', 'SCOPE_DISCOVERY'].includes(s);
    case 'BOQ':
      return s.includes('BOQ') || ['BOQ_PREPARATION', 'BOQ_REVIEW', 'BOQ_APPROVED'].includes(s);
    case 'QUOTATION':
      return s.includes('QUOTATION') || ['QUOTATION_PENDING', 'QUOTATION_SUBMITTED'].includes(s);
    case 'IN_PROGRESS':
      return ['IN_PROGRESS', 'EXECUTION', 'ACTIVE', 'APPROVED'].includes(s);
    case 'WAITING':
      return ['NEEDS_INFORMATION', 'ACTION_REQUIRED', 'WAITING_FOR_CUSTOMER'].includes(s);
    case 'COMPLETED':
      return s === 'COMPLETED';
    case 'CLOSED':
      return ['CLOSED', 'CANCELLED', 'REJECTED'].includes(s);
    default:
      return true;
  }
}

function statusBadge(status: string) {
  if (['COMPLETED', 'APPROVED', 'BOQ_APPROVED'].includes(status)) {
    return <Badge variant="success" size="sm">{formatRequestStatus(status)}</Badge>;
  }
  if (['NEEDS_INFORMATION', 'ACTION_REQUIRED', 'WAITING_FOR_CUSTOMER'].includes(status)) {
    return <Badge variant="warning" size="sm">Action Needed</Badge>;
  }
  if (['CONSULTANT_ASSIGNED', 'CONSULTANT_ACCEPTED', 'SCOPE_DISCOVERY'].includes(status)) {
    return <Badge variant="primary" size="sm">Consultant Assigned</Badge>;
  }
  return <Badge variant="neutral" size="sm">{formatRequestStatus(status)}</Badge>;
}

interface MyRequestsPanelProps {
  cases: CaseRecord[];
  isLoading: boolean;
  highlightCaseId?: string | null;
}

export const MyRequestsPanel: React.FC<MyRequestsPanelProps> = ({
  cases,
  isLoading,
  highlightCaseId,
}) => {
  const [activeTab, setActiveTab] = useState<RequestTab>('ALL');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = cases.filter((c) => matchesTab(c, activeTab));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.caseReference.toLowerCase().includes(q) ||
          c.projectTitle?.toLowerCase().includes(q) ||
          getRequestCategoryLabel(c).toLowerCase().includes(q) ||
          c.serviceSlug?.toLowerCase().includes(q)
      );
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [cases, activeTab, search]);

  return (
    <section id="my-requests" className="scroll-mt-4 space-y-4" data-testid="my-requests-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--color-text)]">My Requests</h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            Every requirement you submit appears here automatically — track status, consultant assignment, and next steps.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-subtle)]" />
          <input
            type="search"
            placeholder="Search by Case ID or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-9 pr-3 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
              activeTab === tab.id
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C6DEE8] border-t-[var(--color-primary)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)] p-8 text-center">
          <p className="text-sm font-semibold text-[var(--color-text)]">No requests yet</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Start a requirement to receive a Case ID and track everything here.
          </p>
          <Link to={ROUTES.INITIATE_PROJECT} className="mt-4 inline-block">
            <Button variant="primary" size="md">Start My Requirement</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const category = getRequestCategoryLabel(c);
            const consultant = getAssignedConsultantLabel(c);
            const latestActivity = getLatestActivityLabel(c);
            const nextAction = getNextActionLabel(c.status);
            const createdDate = new Date(c.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <article
                key={c.id}
                className={`rounded-xl border bg-[var(--color-surface)] p-4 sm:p-5 transition-shadow hover:shadow-sm ${
                  highlightCaseId === c.caseReference
                    ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20'
                    : 'border-[var(--color-border)]'
                }`}
                data-testid={`request-card-${c.caseReference}`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="rounded bg-[#191C1A] px-2 py-0.5 text-xs font-bold text-[#A8D4E5]">
                        {c.caseReference}
                      </code>
                      {statusBadge(c.status)}
                    </div>

                    <h3 className="text-base font-bold text-[var(--color-text)]">
                      {c.projectTitle || 'Untitled Request'}
                    </h3>

                    <div className="grid grid-cols-1 gap-2 text-[11px] sm:grid-cols-2">
                      <div>
                        <span className="font-bold uppercase text-[10px] text-[var(--color-text-subtle)]">Category</span>
                        <p className="text-[var(--color-text)]">{category}</p>
                      </div>
                      <div>
                        <span className="font-bold uppercase text-[10px] text-[var(--color-text-subtle)]">Created</span>
                        <p className="text-[var(--color-text)]">{createdDate}</p>
                      </div>
                      <div>
                        <span className="font-bold uppercase text-[10px] text-[var(--color-text-subtle)]">Assigned consultant</span>
                        <p className="flex items-center gap-1 text-[var(--color-text)]">
                          <UserCheck className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                          {consultant}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold uppercase text-[10px] text-[var(--color-text-subtle)]">Latest activity</span>
                        <p className="flex items-center gap-1 text-[var(--color-text-muted)]">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          {latestActivity}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[11px]">
                      <span className="font-bold text-[var(--color-text-subtle)]">Next action: </span>
                      <span className="text-[var(--color-text)]">{nextAction}</span>
                    </div>
                  </div>

                  <Link
                    to={`/projects/${encodeURIComponent(c.caseReference)}`}
                    className="shrink-0"
                  >
                    <Button variant="primary" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                      View Details
                    </Button>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
          <ArrowRight className="h-3 w-3" />
          Showing {filtered.length} of {cases.length} request{cases.length === 1 ? '' : 's'}
        </p>
      )}
    </section>
  );
};
