import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/ui/PageContainer';
import { PageHeroMedia } from '../components/ui/ResponsiveMedia';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ROUTES } from '../lib/routes';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ArrowRight,
  Phone,
  MessageSquare,
  ShieldCheck,
  Copy,
  Check,
  HardHat,
  Send,
  X,
  ChevronRight,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { PublicTrackRecord } from '../types/backend';
import { trackRequestApi, sendCaseMessageApi } from '../lib/api';
import { captureProductEvent, PRODUCT_EVENTS } from '../lib/analytics';
import { useLanguage } from '../contexts/LanguageContext';

function getCaseStepIndex(status: string): number {
  if (status === 'NEW') return 0;
  if (['QUALIFICATION_PENDING', 'QUALIFICATION', 'QUALIFIED', 'CUSTOMER_REVIEW', 'UNDER_REVIEW'].includes(status)) return 1;
  if (['COORDINATOR_ASSIGNED', 'MATCHING', 'SPECIALIST_MATCHING', 'CONSULTANT_ASSIGNED', 'ASSIGNED'].includes(status)) return 2;
  if (status === 'NEEDS_INFORMATION') return 3;
  if (['APPROVED', 'PROJECT_READY', 'SCOPE_DISCOVERY', 'IN_PROGRESS', 'PROPOSAL_PENDING'].includes(status)) return 4;
  if (['COMPLETED', 'CLOSED'].includes(status)) return 5;
  return 0;
}

function getEnrollmentStepIndex(status: string): number {
  if (status === 'PENDING_VERIFICATION') return 0;
  if (status === 'UNDER_REVIEW') return 1;
  if (status === 'REJECTED') return 2;
  if (status === 'APPROVED') return 3;
  return 0;
}

export const TrackRequestPage: React.FC = () => {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryParamId = searchParams.get('q') || searchParams.get('id') || id || '';

  const [searchInput, setSearchInput] = useState(queryParamId);
  const [activeRecord, setActiveRecord] = useState<PublicTrackRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [correctionMsg, setCorrectionMsg] = useState('');
  const [isSubmittingCorrection, setIsSubmittingCorrection] = useState(false);
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const lookupTrack = useCallback(async (term: string) => {
    const trimmed = term.trim();
    setHasSearched(true);
    setError(null);
    setActiveRecord(null);

    if (!trimmed) {
      setError(t('Please enter a Case ID or Enrollment ID.', 'कृपया Case ID या Enrollment ID दर्ज करें।'));
      return;
    }

    setIsLoading(true);
    try {
      const res = await trackRequestApi(trimmed);
      setActiveRecord(res.track);
      captureProductEvent(PRODUCT_EVENTS.CASE_TRACKED, {
        status: res.track.status,
        display_status: res.track.displayStatus,
        record_type: res.track.type,
      });
      if (res.track.reference !== id) {
        navigate(`/track/${encodeURIComponent(res.track.reference)}`, { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || t('No record found for this tracking ID.', 'इस tracking ID के लिए record नहीं मिला।'));
      setActiveRecord(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, t]);

  useEffect(() => {
    if (queryParamId) {
      setSearchInput(queryParamId);
      lookupTrack(queryParamId);
    }
  }, [queryParamId, lookupTrack]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const term = searchInput.trim();
    if (term) {
      navigate(`/track/${encodeURIComponent(term)}`);
    } else {
      lookupTrack('');
    }
  };

  const copyId = (recId: string) => {
    navigator.clipboard.writeText(recId);
    setCopied(true);
    showToast(`Tracking ID ${recId} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionMsg.trim() || !activeRecord) return;

    if (!activeRecord.isFullAccess) {
      showToast('Sign in with the account that submitted this request to send messages.');
      return;
    }

    if (activeRecord.type !== 'CASE') {
      showToast('Messaging is available for project cases. Contact the empanelment desk for enrollment queries.');
      return;
    }

    setIsSubmittingCorrection(true);
    try {
      await sendCaseMessageApi(activeRecord.reference, correctionMsg.trim());
      setCorrectionMsg('');
      setShowCorrectionForm(false);
      showToast('Message sent to your case coordinator.');
      await lookupTrack(activeRecord.reference);
    } catch (err: any) {
      showToast(err?.message || 'Failed to send message.');
    } finally {
      setIsSubmittingCorrection(false);
    }
  };

  const getStatusBadge = (record: PublicTrackRecord) => {
    const variant =
      record.status === 'APPROVED' || record.status === 'COMPLETED' || record.status === 'CLOSED'
        ? 'success'
        : record.status === 'REJECTED' || record.status === 'NEEDS_INFORMATION'
        ? 'danger'
        : record.status === 'UNDER_REVIEW' || record.status === 'PENDING_VERIFICATION'
        ? 'warning'
        : 'primary';
    return <Badge variant={variant} size="sm">{record.displayStatus}</Badge>;
  };

  const renderLifecycleStepper = (record: PublicTrackRecord) => {
    const isEnrollment = record.type === 'ENROLLMENT';

    const generalSteps = [
      { label: '1. Submitted', desc: 'Logged in queue' },
      { label: '2. Under Review', desc: 'Feasibility check' },
      { label: '3. Assigned', desc: 'Specialist allocated' },
      { label: '4. Action Required', desc: 'Clarification needed' },
      { label: '5. Approved', desc: 'Case & Project' },
    ];

    const enrollmentSteps = [
      { label: '1. Submitted', desc: 'Application received' },
      { label: '2. KYC Review', desc: 'License & CoA check' },
      { label: '3. Decision', desc: 'Approval / Rejection' },
      { label: '4. Active', desc: 'Empaneled roster' },
    ];

    const steps = isEnrollment ? enrollmentSteps : generalSteps;
    const activeIndex = isEnrollment
      ? getEnrollmentStepIndex(record.status)
      : getCaseStepIndex(record.status);

    return (
      <div className="bg-[var(--color-background)] p-5 rounded-2xl border border-[var(--color-border)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">
            Live Lifecycle Timeline (Authoritative Backend)
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">
            Last updated: {new Date(record.updatedAt).toLocaleString()}
          </span>
        </div>

        <div className={`flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1`} role="list" aria-label={t('Lifecycle steps', 'लाइफसाइकल चरण')}>
          {steps.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            return (
              <div
                key={step.label}
                role="listitem"
                className={`min-w-[8.75rem] shrink-0 snap-start p-3 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-[var(--color-primary)] text-white border-[#1697C4] shadow-sm'
                    : isCompleted
                    ? 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)]'
                    : 'bg-[#F4F6F2] text-[#8C958E] border-[var(--color-border)] opacity-70'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-[#85FFC7] animate-ping" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#B7D2DE]" />
                  )}
                  <span className={`text-xs font-bold truncate ${isCurrent ? 'text-white' : 'text-[var(--color-text)]'}`}>
                    {step.label}
                  </span>
                </div>
                <div className={`text-[10px] leading-tight ${isCurrent ? 'text-emerald-100' : 'text-[var(--color-text-muted)]'}`}>
                  {step.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="py-8 sm:py-12 bg-[var(--color-background)] min-h-screen">
      <PageContainer>
        <div className="max-w-4xl mx-auto mb-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <PageHeroMedia assetKey="track_case_dashboard" className="rounded-3xl" />
          </div>
          <div className="lg:col-span-7 space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2">
            <Badge variant="primary" size="md" icon={<Search className="w-3.5 h-3.5" />}>
              {t('Authoritative Request Tracker', 'प्रामाणिक Request Tracker')}
            </Badge>
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">{t('Live Backend Status', 'Live Backend Status')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] tracking-tight">
            {t('Track Your Case or Enrollment ID', 'अपना Case या Enrollment ID ट्रैक करें')}
          </h1>

          <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed max-w-3xl">
            {t(
              'Enter your server-issued Case ID (BEG-2026-XXXXXXXX) or Enrollment ID (BEG-ENR-2026-XXXXX). Status loads from the platform backend.',
              'Server-issued Case ID (BEG-2026-XXXXXXXX) या Enrollment ID दर्ज करें। Status platform backend से लोड होता है।'
            )}
          </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)] shadow-xs">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t('Case ID or Enrollment ID', 'Case ID या Enrollment ID')}
                  aria-label={t('Tracking ID', 'Tracking ID')}
                  leftIcon={<Search className="w-4 h-4 text-[#7A837C]" />}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isLoading}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] font-bold min-h-12"
                rightIcon={isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : undefined}
              >
                {isLoading ? t('Looking up…', 'खोज रहे हैं…') : t('Track Request', 'Track Request')}
              </Button>
            </form>

            {!activeRecord && !error && (
              <p className="pt-3 text-xs text-[#7A837C]">
                Submit a new requirement first, then use the Case ID shown on the confirmation screen.
              </p>
            )}
          </div>

          {toast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between animate-fadeIn" role="status" aria-live="polite">
              <span>{toast}</span>
              <button type="button" onClick={() => setToast(null)} aria-label={t('Dismiss notification', 'सूचना बंद करें')} className="min-h-11 min-w-11 inline-flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
          )}

          {error && hasSearched && !isLoading && (
            <div role="alert" aria-live="assertive" className="p-10 text-center bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] shadow-xs space-y-4">
              <AlertCircle className="w-12 h-12 text-[var(--color-brand-brown)] mx-auto" aria-hidden />
              <div className="text-lg font-bold text-[var(--color-text)]">{t('Record not found', 'Record नहीं मिला')}</div>
              <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">{error}</p>
              <div className="pt-2 flex justify-center gap-3">
                <Link to={ROUTES.INITIATE_PROJECT}>
                  <Button variant="primary" size="md" className="bg-[var(--color-primary)]">
                    Submit New Requirement
                  </Button>
                </Link>
                <Link to={ROUTES.ONBOARDING}>
                  <Button variant="outline" size="md">Provider Enrollment</Button>
                </Link>
              </div>
            </div>
          )}

          {activeRecord && (
            <div className="bg-[var(--color-surface)] p-6 sm:p-8 rounded-3xl border border-[var(--color-border)] shadow-xs space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0F2EC]">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-sm font-extrabold text-[var(--color-primary)] bg-[#E8EFE9] px-3 py-1 rounded-lg">
                      {activeRecord.reference}
                    </span>
                    {getStatusBadge(activeRecord)}
                    <Badge variant="neutral" size="sm">
                      {activeRecord.type === 'CASE' ? 'Project Case' : 'Provider Enrollment'}
                    </Badge>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--color-text)]">{activeRecord.title}</h2>
                  <div className="text-xs text-[var(--color-text-muted)] flex flex-wrap items-center gap-2 mt-1">
                    {activeRecord.city && <span>City: <strong>{activeRecord.city}</strong></span>}
                    {activeRecord.primaryDiscipline && (
                      <>
                        <span>•</span>
                        <span>Discipline: <strong>{activeRecord.primaryDiscipline}</strong></span>
                      </>
                    )}
                    {activeRecord.role && (
                      <>
                        <span>•</span>
                        <span>Role: <strong>{activeRecord.role.replace(/_/g, ' ')}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyId(activeRecord.reference)}
                    className="px-3 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border-strong)] hover:bg-[#EAEFE8] text-xs font-bold text-[var(--color-text)] transition-colors flex items-center gap-1.5"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copied ? 'Copied' : 'Copy ID'}</span>
                  </button>
                  <Button variant="ghost" size="sm" onClick={() => lookupTrack(activeRecord.reference)} aria-label={t('Refresh status', 'स्थिति रिफ्रेश करें')} className="min-h-11 min-w-11">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {!activeRecord.isFullAccess && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Public tracking view.</strong> Status and timeline are from the authoritative backend.
                    Contact details are hidden.{' '}
                    <Link to={ROUTES.LOGIN} className="font-bold text-[var(--color-primary)] underline">Sign in</Link>
                    {' '}with the submitting account to see full details and send messages.
                  </div>
                </div>
              )}

              {renderLifecycleStepper(activeRecord)}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#7A837C]">
                    Assigned Desk
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0">
                      <HardHat className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--color-text)]">{activeRecord.assignedDesk}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">BuildEcoGroup Operations</div>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/917007254932?text=Hello%20BuildEcoGroup,%20tracking%20${activeRecord.reference}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp Desk
                  </a>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] space-y-2 text-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#7A837C]">
                    {activeRecord.isFullAccess ? 'Submitter Details' : 'Record Summary'}
                  </div>
                  {activeRecord.isFullAccess ? (
                    <div className="space-y-1.5 text-[var(--color-text)]">
                      {activeRecord.clientName && <div><strong>Name:</strong> {activeRecord.clientName}</div>}
                      {activeRecord.clientPhone && <div><strong>Phone:</strong> {activeRecord.clientPhone}</div>}
                      {activeRecord.clientEmail && <div><strong>Email:</strong> {activeRecord.clientEmail}</div>}
                      {activeRecord.location && <div><strong>Site:</strong> {activeRecord.location}</div>}
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-[var(--color-text-muted)]">
                      <div>Submitted: {new Date(activeRecord.createdAt).toLocaleDateString()}</div>
                      {activeRecord.kycStatus && <div>KYC: {activeRecord.kycStatus}</div>}
                      {activeRecord.profileCompletion != null && (
                        <div>Profile: {activeRecord.profileCompletion}% complete</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {activeRecord.milestones.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[var(--color-primary)]" />
                    Project Milestones
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeRecord.milestones.map((m, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs">
                        <div className="font-bold text-[var(--color-text)]">{m.title}</div>
                        <div className="text-[var(--color-text-muted)]">{m.status}{m.date ? ` • ${m.date}` : ''}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[var(--color-primary)]" />
                    Status History
                  </div>
                  {activeRecord.isFullAccess && activeRecord.type === 'CASE' && (
                    <button
                      type="button"
                      onClick={() => setShowCorrectionForm(!showCorrectionForm)}
                      className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Send Message
                    </button>
                  )}
                </div>

                {showCorrectionForm && (
                  <form onSubmit={handleSendCorrection} className="p-4 rounded-2xl bg-[#F4F6F2] border border-[var(--color-border-strong)] space-y-3">
                    <textarea
                      value={correctionMsg}
                      onChange={(e) => setCorrectionMsg(e.target.value)}
                      placeholder="Message to your case coordinator..."
                      rows={3}
                      className="w-full text-xs p-3 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] focus:outline-hidden focus:ring-1 focus:ring-[#1697C4]"
                      required
                    />
                    <div className="flex justify-end gap-2">
                      <Button type="button" size="sm" variant="secondary" onClick={() => setShowCorrectionForm(false)}>Cancel</Button>
                      <Button type="submit" size="sm" variant="primary" className="bg-[var(--color-primary)] font-bold" disabled={isSubmittingCorrection} rightIcon={<Send className="w-3.5 h-3.5" />}>
                        {isSubmittingCorrection ? 'Sending...' : 'Send'}
                      </Button>
                    </div>
                  </form>
                )}

                <div className="space-y-2.5">
                  {activeRecord.statusHistory.map((log, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[var(--color-primary)]">
                          {log.fromStatus} → {log.toStatus}
                          {log.actorRole && <span className="ml-2 text-[#7A837C]">({log.actorRole})</span>}
                        </span>
                        <span className="text-[#7A837C]">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-[var(--color-text)] leading-relaxed">{log.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {activeRecord.type === 'CASE' && activeRecord.isFullAccess && (
                <div className="pt-2 border-t border-[#F0F2EC]">
                  <Link to={`/projects/${activeRecord.id}`}>
                    <Button variant="primary" size="md" className="bg-[var(--color-primary)] font-bold" rightIcon={<ChevronRight className="w-4 h-4" />}>
                      Open Full Project Workspace
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
};
