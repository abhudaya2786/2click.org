import React, { useEffect, useMemo } from 'react';
import { ArrowUpRight, BarChart3, CircleAlert, FolderKanban, LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CaseRecord, CaseStatus } from '../../types/backend';
import { captureProductEvent, PRODUCT_EVENTS } from '../../lib/analytics';
import { ROUTES } from '../../lib/routes';

interface CustomerProjectInsightsProps {
  cases: CaseRecord[];
  isLoading?: boolean;
}

const PIPELINE_GROUPS: Array<{
  key: string;
  label: string;
  hint: string;
  statuses: CaseStatus[];
  color: string;
}> = [
  {
    key: 'intake',
    label: 'Intake & review',
    hint: 'Requirement received',
    statuses: ['NEW', 'QUALIFICATION_PENDING', 'QUALIFICATION', 'NEEDS_INFORMATION'],
    color: '#8F5B36',
  },
  {
    key: 'matching',
    label: 'Expert matching',
    hint: 'Coordinator and specialist',
    statuses: ['QUALIFIED', 'COORDINATOR_ASSIGNED', 'MATCHING', 'SPECIALIST_MATCHING', 'CONSULTANT_ASSIGNED', 'CONSULTANT_ACCEPTED', 'ASSIGNED'],
    color: '#2F7463',
  },
  {
    key: 'delivery',
    label: 'Scope & delivery',
    hint: 'BOQ, proposal and execution',
    statuses: ['SCOPE_DISCOVERY', 'BOQ_PREPARATION', 'PROPOSAL_PENDING', 'CUSTOMER_REVIEW', 'APPROVED', 'PROJECT_READY', 'IN_PROGRESS', 'UNDER_REVIEW'],
    color: '#173F34',
  },
  {
    key: 'closed',
    label: 'Completed',
    hint: 'Handover or closure',
    statuses: ['COMPLETED', 'CLOSED'],
    color: '#5C8A58',
  },
];

const NEEDS_ACTION = new Set<CaseStatus>(['NEEDS_INFORMATION', 'CUSTOMER_REVIEW']);

const serviceLabel = (caseRecord: CaseRecord) =>
  caseRecord.primaryDiscipline?.trim() ||
  caseRecord.serviceSlug.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export const CustomerProjectInsights: React.FC<CustomerProjectInsightsProps> = ({ cases, isLoading = false }) => {
  const pipeline = useMemo(() => PIPELINE_GROUPS.map((group) => ({
    ...group,
    count: cases.filter((item) => group.statuses.includes(item.status)).length,
  })), [cases]);

  const serviceMix = useMemo(() => {
    const counts = new Map<string, number>();
    cases.forEach((item) => {
      const label = serviceLabel(item);
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .slice(0, 5);
  }, [cases]);

  const actionCount = useMemo(
    () => cases.filter((item) => NEEDS_ACTION.has(item.status)).length,
    [cases]
  );
  const maxServiceCount = Math.max(1, ...serviceMix.map((item) => item.count));
  const total = Math.max(1, cases.length);

  useEffect(() => {
    if (isLoading) return;
    captureProductEvent(PRODUCT_EVENTS.DASHBOARD_INSIGHTS_VIEWED, {
      case_count: cases.length,
      service_count: serviceMix.length,
      action_count: actionCount,
      source: 'customer_dashboard',
    });
  }, [actionCount, cases.length, isLoading, serviceMix.length]);

  return (
    <section
      aria-labelledby="project-insights-title"
      className="overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm"
      data-testid="customer-project-insights"
    >
      <div className="flex flex-col gap-4 border-b border-[var(--color-border)] bg-[linear-gradient(120deg,#F7F2E8_0%,#EEF5F0_60%,#FBFAF6_100%)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-sm">
            <BarChart3 className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[var(--color-accent-warm)]">Live workspace insights</p>
            <h2 id="project-insights-title" className="mt-1 text-xl font-black tracking-tight text-[var(--color-text)]">My project pulse</h2>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">Calculated only from your visible Case IDs—no demo analytics mixed in.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[#C9DDD5] bg-white/80 px-3 py-2 text-xs font-bold text-[var(--color-primary)]">
          <LockKeyhole className="h-4 w-4" aria-hidden />
          Private to your account
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6" aria-label="Loading project insights">
          <div className="h-44 animate-pulse rounded-2xl bg-[var(--color-surface-muted)]" />
          <div className="h-44 animate-pulse rounded-2xl bg-[var(--color-surface-muted)]" />
        </div>
      ) : cases.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
          <FolderKanban className="h-9 w-9 text-[var(--color-primary)]" aria-hidden />
          <div>
            <p className="font-extrabold text-[var(--color-text)]">Your charts will appear after the first requirement</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">Create a Case ID to track service mix, project stage and items needing attention.</p>
          </div>
          <Link to={`${ROUTES.INITIATE_PROJECT}?source=dashboard`} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-xs font-bold text-white hover:bg-[var(--color-primary-hover)]">
            Start requirement <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--color-text)]">Project pipeline</h3>
                <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">{cases.length} active and completed requirement{cases.length === 1 ? '' : 's'}</p>
              </div>
              <span className="rounded-lg bg-[#E8F1EC] px-2.5 py-1 text-xs font-extrabold text-[var(--color-primary)]">{cases.length} total</span>
            </div>
            <div className="space-y-4">
              {pipeline.map((group) => {
                const width = group.count === 0 ? 0 : Math.max(8, Math.round((group.count / total) * 100));
                return (
                  <div key={group.key}>
                    <div className="mb-1.5 flex items-end justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-[var(--color-text)]">{group.label}</span>
                        <span className="ml-2 hidden text-[10px] text-[var(--color-text-muted)] sm:inline">{group.hint}</span>
                      </div>
                      <span className="font-mono font-extrabold text-[var(--color-text)]">{group.count}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-[#DEE7E1]" role="img" aria-label={`${group.label}: ${group.count} of ${cases.length} cases`}>
                      <div className="h-full rounded-full transition-[width] duration-700 motion-reduce:transition-none" style={{ width: `${width}%`, backgroundColor: group.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--color-text)]">Service mix</h3>
                  <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">Your top project categories</p>
                </div>
              </div>
              <div className="space-y-3">
                {serviceMix.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex justify-between gap-3 text-[11px]">
                      <span className="truncate font-semibold text-[var(--color-text)]">{item.label}</span>
                      <span className="font-mono font-bold text-[var(--color-primary)]">{item.count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#DEE7E1]" role="img" aria-label={`${item.label}: ${item.count} cases`}>
                      <div className="h-full rounded-full bg-[var(--color-primary)] transition-[width] duration-700 motion-reduce:transition-none" style={{ width: `${Math.max(10, Math.round((item.count / maxServiceCount) * 100))}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`flex items-start gap-3 rounded-2xl border p-4 ${actionCount ? 'border-[#D9B38C] bg-[#FFF7ED]' : 'border-[#C9DDD5] bg-[#F1F7F3]'}`}>
              {actionCount ? <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#9A552A]" aria-hidden /> : <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]" aria-hidden />}
              <div>
                <p className="text-sm font-extrabold text-[var(--color-text)]">{actionCount ? `${actionCount} item${actionCount === 1 ? '' : 's'} need your review` : 'No pending customer action'}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-text-muted)]">{actionCount ? 'Open My Requests to reply or approve the next step.' : 'Your coordinator will update the linked Case ID when a response is needed.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
