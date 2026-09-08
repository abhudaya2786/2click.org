import React, { useState, useEffect } from 'react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ROUTES } from '../lib/routes';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  Users, 
  DollarSign, 
  Search, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Download,
  Activity,
  Sparkles,
  ShieldCheck,
  Tag,
  MapPin,
  AlertCircle,
  Eye,
  Zap,
  Edit3,
  HardHat,
  Compass,
  RefreshCw,
  X,
  FileText
} from 'lucide-react';
import { fetchAllCasesApi, fetchMetricsApi, fetchAllEnrollmentsApi, approveEnrollmentApi, rejectEnrollmentApi } from '../lib/api';
import { CaseRecord, EnrollmentRecord } from '../types/backend';
import { TrackRequestModal } from '../components/forms/TrackRequestModal';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CASES' | 'ENROLLMENTS'>('CASES');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Tracker modal
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [trackTargetId, setTrackTargetId] = useState('');

  const loadData = () => {
    setIsLoading(true);

    Promise.all([
      fetchAllCasesApi(),
      fetchMetricsApi(),
      fetchAllEnrollmentsApi(),
    ])
      .then(([casesRes, metricsRes, enrollmentsRes]) => {
        setCases(casesRes.cases || []);
        setMetrics(metricsRes.metrics || null);
        setEnrollments(enrollmentsRes.enrollments || []);
      })
      .catch((err) => {
        console.error('Failed to load admin telemetry:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveEnrollment = async (idOrRef: string) => {
    try {
      await approveEnrollmentApi(idOrRef, 'Approved by admin operations desk');
      setToastMessage(`Enrollment ${idOrRef} approved`);
      loadData();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to approve enrollment');
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleRejectEnrollment = async (idOrRef: string) => {
    try {
      await rejectEnrollmentApi(idOrRef, 'Rejected after KYC review');
      setToastMessage(`Enrollment ${idOrRef} rejected`);
      loadData();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to reject enrollment');
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const filteredEnrollments = enrollments.filter((e) => {
    const matchesStatus = filterStatus === 'All' || e.status === filterStatus || (filterStatus === 'SUBMITTED' && e.status === 'PENDING_VERIFICATION');
    const matchesSearch =
      e.enrollmentReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const topConsultants = [
    { name: 'Dr. Elena Rostova', specialty: 'Structural Engineering', rating: 4.98, activeCases: 8, load: 92 },
    { name: 'Marcus Chen', specialty: 'Bioclimatic Design', rating: 4.95, activeCases: 6, load: 84 },
    { name: 'Sarah Jenkins, PE', specialty: 'Geospatial & Land', rating: 4.92, activeCases: 5, load: 75 },
    { name: 'David Kalu', specialty: 'MEP & Systems', rating: 4.99, activeCases: 9, load: 96 },
  ];

  const pillarDistribution = [
    { name: 'Construction Services', count: 480, percentage: 38 },
    { name: 'Surveillance & Site Tech', count: 240, percentage: 19 },
    { name: 'Land & Property Assistance', count: 215, percentage: 17 },
    { name: 'Consultants Discovery', count: 190, percentage: 15 },
    { name: 'Innovation & Products', count: 140, percentage: 11 },
  ];

  const filteredCases = cases.filter((c) => {
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchesSearch =
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.primaryDiscipline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.projectTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const newIntakeCount = cases.filter((c) => c.status === 'NEW').length;

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)]">
              Platform Operations Center
            </h1>
            <Badge variant="primary" size="sm">System Administrator</Badge>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Authoritative backend case intake, KYC review audits, coordinator dispatch, and project lifecycles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              setTrackTargetId('');
              setTrackModalOpen(true);
            }}
            leftIcon={<Compass className="w-4 h-4 text-[var(--color-primary)]" />}
          >
            Track by ID
          </Button>
          <Link to={ROUTES.COMMERCIAL_SUITE}>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Sparkles className="w-4 h-4 text-purple-600" />}
            >
              Commercial Suite
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              setToastMessage('Exporting Universal Form Records and Audit Logs (CSV)...');
              setTimeout(() => setToastMessage(null), 3000);
            }}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Telemetry
          </Button>
          <Link to={ROUTES.INITIATE_PROJECT}>
            <Button variant="primary" size="md">
              Create Manual Case
            </Button>
          </Link>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-[var(--color-primary-subtle)] border border-[#B9DDEA] text-[var(--color-primary)] text-sm font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{toastMessage}</span>
          </div>
          <button type="button" onClick={() => setToastMessage(null)} className="text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-subtle)]">
              Total Intake Submissions
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-primary)]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--color-text)] font-mono">
            {newIntakeCount}
          </div>
          <div className="text-xs text-[var(--color-primary)] font-semibold flex items-center gap-1">
            <span>New Backend Intake (Status NEW)</span>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-subtle)]">
              Active Project Cases
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-primary)]">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--color-text)] font-mono">
            {metrics?.totalCases ?? cases.length}
          </div>
          <div className="text-xs text-[var(--color-primary)] font-semibold flex items-center gap-1">
            <span>Canonical Server Authority</span>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-subtle)]">
              Empaneled Specialists & KYC
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-primary)]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--color-text)] font-mono">
            {enrollments.filter((e) => e.status === 'APPROVED').length}
          </div>
          <div className="text-xs text-[var(--color-primary)] font-semibold flex items-center gap-1">
            <span>Vetted Providers Roster</span>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-subtle)]">
              System Health
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-primary)]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--color-primary)] font-mono">
            100% OK
          </div>
          <div className="text-xs text-[var(--color-primary)] font-semibold flex items-center gap-1">
            <span>Universal Audit Engine Live</span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-xs space-y-5">
        
        {/* Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('CASES'); setFilterStatus('All'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'CASES'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]'
              }`}
            >
              Active Project Cases ({cases.length})
            </button>
            <button
              onClick={() => { setActiveTab('ENROLLMENTS'); setFilterStatus('All'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ENROLLMENTS'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]'
              }`}
            >
              Provider Enrollments & KYC ({enrollments.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--color-text-subtle)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, name, location..."
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-hidden focus:ring-2 focus:ring-[#1697C4]"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-hidden focus:ring-2 focus:ring-[#1697C4]"
            >
              <option value="All">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="KYC_REVIEW">KYC Review</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="ACTION_REQUIRED">Action Required</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="APPROVED_CONVERTED">Approved / Converted</option>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {/* ENROLLMENTS TABLE (backend API) */}
        {activeTab === 'ENROLLMENTS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-text-subtle)] uppercase tracking-wider font-bold">
                  <th className="py-3 px-3">Enrollment ID</th>
                  <th className="py-3 px-3">Role / Category</th>
                  <th className="py-3 px-3">Applicant</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">KYC Status</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6E8F0]">
                {filteredEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[var(--color-text-muted)]">
                      No provider enrollments matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredEnrollments.map((enr) => (
                    <tr key={enr.id} className="hover:bg-[var(--color-background)] transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-[var(--color-primary)]">{enr.enrollmentReference}</td>
                      <td className="py-3.5 px-3 font-semibold text-[var(--color-text)]">{enr.role.replace(/_/g, ' ')}</td>
                      <td className="py-3.5 px-3">
                        <div>{enr.fullName}</div>
                        <div className="text-[10px] text-[#7A837C]">{enr.email}</div>
                      </td>
                      <td className="py-3.5 px-3 text-[var(--color-text-muted)]">{enr.city} ({enr.pincode})</td>
                      <td className="py-3.5 px-3">
                        <Badge variant={enr.kycStatus === 'VERIFIED' ? 'success' : 'warning'} size="sm">{enr.kycStatus}</Badge>
                      </td>
                      <td className="py-3.5 px-3">
                        <Badge variant={enr.status === 'APPROVED' ? 'success' : enr.status === 'REJECTED' ? 'danger' : 'primary'} size="sm">{enr.status}</Badge>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {enr.status === 'PENDING_VERIFICATION' || enr.status === 'UNDER_REVIEW' ? (
                            <>
                              <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApproveEnrollment(enr.enrollmentReference)}>
                                Approve
                              </Button>
                              <Button variant="secondary" size="sm" onClick={() => handleRejectEnrollment(enr.enrollmentReference)}>
                                Reject
                              </Button>
                            </>
                          ) : (
                            <span className="text-[10px] text-[#7A837C]">Reviewed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ACTIVE CASES TABLE */}
        {activeTab === 'CASES' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-text-subtle)] uppercase tracking-wider font-bold">
                  <th className="py-3 px-3">Case Reference</th>
                  <th className="py-3 px-3">Customer Entity</th>
                  <th className="py-3 px-3">Discipline</th>
                  <th className="py-3 px-3">Lead Specialist</th>
                  <th className="py-3 px-3">Budget Range</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6E8F0]">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[var(--color-text-muted)]">
                      No active cases matching query.
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((row) => (
                    <tr key={row.id} className="hover:bg-[var(--color-background)] transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-[var(--color-primary)]">
                        <Link to={`/projects/${row.caseReference}`} className="hover:underline">
                          {row.caseReference}
                        </Link>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-[var(--color-text)]">
                        {row.clientName} ({row.clientOrg})
                      </td>
                      <td className="py-3.5 px-3 text-[var(--color-text-muted)]">
                        {row.primaryDiscipline}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[var(--color-text)]">
                        {row.leadSpecialistName || row.targetSpecialist || 'Coordinator Dispatch'}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[var(--color-text)]">
                        {row.budgetRange}
                      </td>
                      <td className="py-3.5 px-3">
                        <Badge
                          variant={
                            row.status === 'COMPLETED' ? 'success' :
                            row.status === 'IN_PROGRESS' ? 'primary' :
                            'neutral'
                          }
                          size="sm"
                        >
                          {row.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <Link to={`/projects/${row.caseReference}`}>
                          <Button variant="ghost" size="sm">
                            Inspect
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Specialist Utilization & Volume Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--color-primary)]" />
              <span>Specialist Utilization & Capacity</span>
            </h3>
            <span className="text-xs text-[var(--color-text-subtle)]">Quality Audited</span>
          </div>

          <div className="space-y-3.5">
            {topConsultants.map((c) => (
              <div key={c.name} className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[var(--color-text)]">{c.name}</span>
                    <span className="text-[var(--color-text-subtle)] ml-2">({c.specialty})</span>
                  </div>
                  <span className="font-mono font-bold text-[var(--color-primary)]">{c.load}% Capacity</span>
                </div>
                <div className="w-full bg-[#D6E8F0] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      c.load > 90 ? 'bg-amber-600' : 'bg-[var(--color-primary)]'
                    }`}
                    style={{ width: `${c.load}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--color-primary)]" />
              <span>Volume by Strategic Pillar</span>
            </h3>
            <span className="text-xs text-[var(--color-text-subtle)]">Baseline Distribution</span>
          </div>

          <div className="space-y-3">
            {pillarDistribution.map((p) => (
              <div key={p.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[var(--color-text)]">{p.name}</span>
                  <span className="text-[var(--color-text-muted)] font-mono">{p.count} cases ({p.percentage}%)</span>
                </div>
                <div className="w-full bg-[var(--color-surface-muted)] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[var(--color-primary)] h-full rounded-full"
                    style={{ width: `${p.percentage * 2}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Track Modal */}
      <TrackRequestModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        initialId={trackTargetId}
      />

    </div>
  );
};
