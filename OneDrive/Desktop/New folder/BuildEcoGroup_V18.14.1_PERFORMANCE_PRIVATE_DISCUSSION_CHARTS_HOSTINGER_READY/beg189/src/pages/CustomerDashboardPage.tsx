import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ROUTES } from '../lib/routes';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchAllCasesApi } from '../lib/api';
import { CaseRecord } from '../types/backend';
import { TrackRequestModal } from '../components/forms/TrackRequestModal';
import { DashboardSummaryCards } from '../components/dashboard/DashboardSummaryCards';
import { MyRequestsPanel } from '../components/dashboard/MyRequestsPanel';
import { CategorySelectionPanel } from '../components/dashboard/CategorySelectionPanel';
import { CustomerProjectInsights } from '../components/dashboard/CustomerProjectInsights';

export const CustomerDashboardPage: React.FC<{
  documentsFocus?: boolean;
}> = ({ documentsFocus = false }) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const highlightCaseId = searchParams.get('highlight');

  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [showCreatedBanner, setShowCreatedBanner] = useState(Boolean(highlightCaseId));

  const loadData = () => {
    setIsLoading(true);
    fetchAllCasesApi()
      .then((res) => setCases(res.cases || []))
      .catch((err) => console.error('Failed to fetch cases:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (highlightCaseId) {
      setShowCreatedBanner(true);
      const el = document.getElementById('my-requests');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [highlightCaseId]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 pb-6 border-b border-[var(--color-border)] md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)]">
              My Workspace
            </h1>
            <Badge variant="primary" size="sm">Customer</Badge>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Welcome back, <strong>{user?.fullName || 'Client'}</strong>. Submit requirements, track requests, and manage active projects.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setTrackModalOpen(true)}
          >
            Track by Case ID
          </Button>
          <Link to={ROUTES.INITIATE_PROJECT}>
            <Button
              variant="primary"
              size="md"
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] font-bold"
              rightIcon={<Plus className="w-4 h-4" />}
            >
              Start My Requirement
            </Button>
          </Link>
        </div>
      </div>

      {showCreatedBanner && highlightCaseId && (
        <div className="rounded-2xl border border-[#B9DDEA] bg-[var(--color-primary-subtle)] p-4 text-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]" />
              <div>
                <p className="font-bold text-[var(--color-text)]">Request created successfully</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Case ID: <code className="font-mono font-bold text-[var(--color-primary)]">{highlightCaseId}</code>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to={`/projects/${encodeURIComponent(highlightCaseId)}`}>
                <Button variant="primary" size="sm">View Details</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => setShowCreatedBanner(false)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {documentsFocus && (
        <div className="p-3 rounded-xl bg-[#EAF4F8] border border-[#C6DEE8] text-xs text-[#0C2939] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[var(--color-brand-brown)] shrink-0" />
          <span>BOQ reports and deliverables are attached to each request. Open a request to view documents and downloads.</span>
        </div>
      )}

      <DashboardSummaryCards cases={cases} />

      <CustomerProjectInsights cases={cases} isLoading={isLoading} />

      <CategorySelectionPanel
        savedInterests={user?.profile?.interests}
        onSave={async (interests, customCategory) => {
          const res = await fetch('/api/auth/profile-interests', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ interests, customCategory }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save');
        }}
      />

      <MyRequestsPanel cases={cases} isLoading={isLoading} highlightCaseId={highlightCaseId} />

      <TrackRequestModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        initialId=""
      />
    </div>
  );
};
