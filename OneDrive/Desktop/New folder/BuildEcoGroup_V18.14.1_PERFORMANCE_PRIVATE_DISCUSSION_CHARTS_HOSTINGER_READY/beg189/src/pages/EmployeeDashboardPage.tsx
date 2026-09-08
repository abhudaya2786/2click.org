import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { 
  Users, 
  FolderKanban, 
  FileCheck, 
  Clock, 
  Search, 
  ArrowRight, 
  Send, 
  ShieldCheck, 
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Zap,
  Check,
  X,
  UserPlus,
  Compass,
  Building2,
  MapPin,
  ChevronRight,
  Filter,
  Eye,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  CaseRecord, 
  ConsultantMatchResult, 
  QualificationChecklist, 
  SafeUser 
} from '../types/backend';
import { 
  fetchQualificationQueueApi,
  fetchMatchingQueueApi,
  fetchActiveCoordinationQueueApi,
  qualifyCaseApi,
  assignCoordinatorApi,
  fetchConsultantMatchesApi,
  assignConsultantApi,
  createInformationRequestApi
} from '../lib/api';

export const EmployeeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  
  // Tab states: 'qualification' | 'matching' | 'active'
  const [activeTab, setActiveTab] = useState<'qualification' | 'matching' | 'active'>('qualification');
  
  // Data Queues
  const [qualificationQueue, setQualificationQueue] = useState<CaseRecord[]>([]);
  const [matchingQueue, setMatchingQueue] = useState<CaseRecord[]>([]);
  const [activeQueue, setActiveQueue] = useState<CaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [selectedCaseForQualify, setSelectedCaseForQualify] = useState<CaseRecord | null>(null);
  const [checklist, setChecklist] = useState<QualificationChecklist>({
    requirementUnderstood: true,
    locationVerified: true,
    serviceCategoryConfirmed: true,
    contactUsable: true,
    criticalDocsIdentified: true,
  });
  const [qualifyNotes, setQualifyNotes] = useState('');
  const [isQualifying, setIsQualifying] = useState(false);

  // Matching Drawer / Modal
  const [selectedCaseForMatching, setSelectedCaseForMatching] = useState<CaseRecord | null>(null);
  const [matches, setMatches] = useState<ConsultantMatchResult[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [selectedConsultantForAssign, setSelectedConsultantForAssign] = useState<string | null>(null);
  const [feeEstimate, setFeeEstimate] = useState('₹4.5L - ₹6.0L Fee');
  const [responseDueHours, setResponseDueHours] = useState('48');
  const [assignNotes, setAssignNotes] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Info Request Modal
  const [selectedCaseForInfo, setSelectedCaseForInfo] = useState<CaseRecord | null>(null);
  const [infoQuestion, setInfoQuestion] = useState('');
  const [isSendingInfo, setIsSendingInfo] = useState(false);

  const fetchAllQueues = async () => {
    setIsLoading(true);
    try {
      const [qRes, mRes, aRes] = await Promise.all([
        fetchQualificationQueueApi(),
        fetchMatchingQueueApi(),
        fetchActiveCoordinationQueueApi(),
      ]);

      setQualificationQueue(qRes.queue || []);
      setMatchingQueue(mRes.queue || []);
      setActiveQueue(aRes.queue || []);
    } catch (e: any) {
      console.error('Coordinator fetch error', e);
      setToastMessage('Failed to refresh operational queues.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllQueues();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Handle Qualify Submission
  const handleQualifySubmit = async () => {
    if (!selectedCaseForQualify) return;
    setIsQualifying(true);
    try {
      const res = await qualifyCaseApi(selectedCaseForQualify.id, checklist, qualifyNotes);
      showToast(`Case ${res.case.caseReference} successfully qualified! Moved to Matching Queue.`);
      setSelectedCaseForQualify(null);
      setQualifyNotes('');
      fetchAllQueues();
    } catch (err: any) {
      showToast(err.message || 'Qualification submission failed.');
    } finally {
      setIsQualifying(false);
    }
  };

  // 2. Open Matching Modal & Fetch Deterministic Matches
  const handleOpenMatching = async (c: CaseRecord) => {
    setSelectedCaseForMatching(c);
    setIsLoadingMatches(true);
    setSelectedConsultantForAssign(null);
    try {
      const res = await fetchConsultantMatchesApi(c.id);
      setMatches(res.matches || []);
      if (res.matches && res.matches.length > 0) {
        setSelectedConsultantForAssign(res.matches[0].consultant.userId || res.matches[0].consultant.id);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to calculate deterministic matches.');
    } finally {
      setIsLoadingMatches(false);
    }
  };

  // 3. Dispatch Consultant Assignment
  const handleDispatchAssignment = async () => {
    if (!selectedCaseForMatching || !selectedConsultantForAssign) return;
    setIsAssigning(true);
    try {
      const res = await assignConsultantApi(selectedCaseForMatching.id, {
        consultantUserId: selectedConsultantForAssign,
        feeEstimate,
        responseDueHours: parseInt(responseDueHours, 10),
        notes: assignNotes,
        overrideJustification: overrideReason || undefined,
      });

      showToast(`Assignment dispatched to specialist! Response due in ${responseDueHours}h.`);
      setSelectedCaseForMatching(null);
      fetchAllQueues();
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch assignment.');
    } finally {
      setIsAssigning(false);
    }
  };

  // 4. Send Information Request
  const handleSendInfoRequest = async () => {
    if (!selectedCaseForInfo || !infoQuestion.trim()) return;
    setIsSendingInfo(true);
    try {
      await createInformationRequestApi(selectedCaseForInfo.id, infoQuestion.trim());
      showToast(`Clarification request sent to ${selectedCaseForInfo.clientName}.`);
      setSelectedCaseForInfo(null);
      setInfoQuestion('');
      fetchAllQueues();
    } catch (err: any) {
      showToast(err.message || 'Failed to send information request.');
    } finally {
      setIsSendingInfo(false);
    }
  };

  // Filter queues by search query
  const filterList = (list: CaseRecord[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(c => 
      c.caseReference.toLowerCase().includes(q) ||
      c.projectTitle.toLowerCase().includes(q) ||
      c.primaryDiscipline.toLowerCase().includes(q) ||
      c.clientName.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  };

  const currentList = activeTab === 'qualification' 
    ? filterList(qualificationQueue) 
    : activeTab === 'matching' 
    ? filterList(matchingQueue) 
    : filterList(activeQueue);

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0369A1] to-[#075985] text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[var(--color-surface)]/20 text-white">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#BAE6FD]">
              Platform Operations & Dispatch Cockpit
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Technical Case Coordination Engine</h1>
          <p className="text-xs text-[#E0F2FE]">
            Logged in as <strong>{user?.fullName}</strong>. Managing authoritative state transitions, qualification checklists & consultant matching.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchAllQueues}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-4 h-4" />}
          className="bg-[var(--color-surface)]/10 text-white border-white/20 hover:bg-[var(--color-surface)]/20"
        >
          Sync Queues
        </Button>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-[var(--color-primary-subtle)] border border-[#B9DDEA] text-[var(--color-primary)] text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)]" />
            <span>{toastMessage}</span>
          </div>
          <button type="button" onClick={() => setToastMessage(null)} className="hover:underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* 3 Metric Cards for the 3 Pipelines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card 
          onClick={() => setActiveTab('qualification')}
          className={`p-5 space-y-2 cursor-pointer transition-all border ${
            activeTab === 'qualification' ? 'ring-2 ring-[#0369A1] bg-[#F0F9FF]' : 'border-[var(--color-border)] hover:bg-[var(--color-background)]'
          }`}
        >
          <div className="flex items-center justify-between text-[#71717A]">
            <span className="text-xs font-bold uppercase tracking-wider">1. Qualification Queue</span>
            <FileCheck className="w-4 h-4 text-[#0369A1]" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--color-text)]">{qualificationQueue.length}</div>
          <div className="text-[11px] text-[var(--color-text-muted)]">New briefs & clarification pending</div>
        </Card>

        <Card 
          onClick={() => setActiveTab('matching')}
          className={`p-5 space-y-2 cursor-pointer transition-all border ${
            activeTab === 'matching' ? 'ring-2 ring-[#D97706] bg-[#FFFBEB]' : 'border-[var(--color-border)] hover:bg-[var(--color-background)]'
          }`}
        >
          <div className="flex items-center justify-between text-[#71717A]">
            <span className="text-xs font-bold uppercase tracking-wider">2. Specialist Matching</span>
            <Users className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--color-text)]">{matchingQueue.length}</div>
          <div className="text-[11px] text-[var(--color-text-muted)]">Qualified cases awaiting specialist assignment</div>
        </Card>

        <Card 
          onClick={() => setActiveTab('active')}
          className={`p-5 space-y-2 cursor-pointer transition-all border ${
            activeTab === 'active' ? 'ring-2 ring-[#1697C4] bg-[var(--color-primary-subtle)]' : 'border-[var(--color-border)] hover:bg-[var(--color-background)]'
          }`}
        >
          <div className="flex items-center justify-between text-[#71717A]">
            <span className="text-xs font-bold uppercase tracking-wider">3. Active Coordination</span>
            <FolderKanban className="w-4 h-4 text-[var(--color-primary)]" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--color-text)]">{activeQueue.length}</div>
          <div className="text-[11px] text-[var(--color-text-muted)]">In scope discovery, proposal & delivery</div>
        </Card>
      </div>

      {/* Main Queue Table Card */}
      <Card className="p-6 space-y-5 border-[var(--color-border)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
              {activeTab === 'qualification' && 'Technical Qualification Queue'}
              {activeTab === 'matching' && 'Empaneled Specialist Matching Queue'}
              {activeTab === 'active' && 'Active Case Delivery Pipeline'}
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#D6E8F0] text-[var(--color-text-muted)] font-bold">
                {currentList.length}
              </span>
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              {activeTab === 'qualification' && 'Verify technical requirements, validate location bylaws, and request customer clarifications.'}
              {activeTab === 'matching' && 'Review deterministic match scores, select empaneled specialists, and dispatch lead assignments.'}
              {activeTab === 'active' && 'Track consultant acceptance response SLAs, scope discovery proposals, and milestone sign-offs.'}
            </p>
          </div>

          <div className="w-full sm:w-64">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--color-text-subtle)]" />
              <input
                type="text"
                placeholder="Search reference, client, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] focus:bg-[var(--color-surface)] focus:outline-hidden focus:ring-2 focus:ring-[#0369A1]"
              />
            </div>
          </div>
        </div>

        {/* Cases List */}
        {currentList.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--color-text-muted)] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[var(--color-primary)] mx-auto" />
            <p className="font-semibold text-sm text-[var(--color-text)]">Queue is fully triaged!</p>
            <p>No cases currently waiting in this operational stage.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentList.map((c) => {
              const isNeedsInfo = c.status === 'NEEDS_INFORMATION';
              const isDeclined = c.status === 'CONSULTANT_DECLINED';

              return (
                <div
                  key={c.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs ${
                    isNeedsInfo
                      ? 'bg-amber-50/50 border-amber-200'
                      : isDeclined
                      ? 'bg-red-50/40 border-red-200'
                      : 'bg-[var(--color-background)] border-[var(--color-border)] hover:bg-[var(--color-surface)] hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-[var(--color-primary)] bg-[var(--color-surface)] px-2 py-0.5 rounded border border-[#B9DDEA]">
                        {c.caseReference}
                      </span>
                      <Badge variant={isNeedsInfo ? 'warning' : 'primary'} size="sm">
                        {c.status.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-[11px] font-bold text-[var(--color-text-muted)]">
                        {c.pillar?.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[var(--color-text-subtle)]">•</span>
                      <span className="text-[var(--color-text-muted)] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {c.city}, {c.stateRegion}
                      </span>
                    </div>

                    <div className="font-bold text-sm text-[var(--color-text)]">
                      {c.projectTitle}
                    </div>

                    <div className="text-[11px] text-[var(--color-text-muted)] line-clamp-1">
                      <strong>Client:</strong> {c.clientName} ({c.clientEmail}) • <strong>Discipline:</strong> {c.primaryDiscipline} • <strong>Budget:</strong> {c.budgetRange}
                    </div>

                    {c.qualificationNotes && (
                      <div className="text-[11px] text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-1 rounded-md inline-block">
                        <strong>Qualification Note:</strong> {c.qualificationNotes}
                      </div>
                    )}
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Link to={`/projects/${c.caseReference}`}>
                      <Button variant="secondary" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                        Workspace
                      </Button>
                    </Link>

                    {activeTab === 'qualification' && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedCaseForInfo(c)}
                          leftIcon={<HelpCircle className="w-3.5 h-3.5" />}
                        >
                          Request Clarification
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedCaseForQualify(c);
                            setChecklist({
                              requirementUnderstood: true,
                              locationVerified: true,
                              serviceCategoryConfirmed: true,
                              contactUsable: true,
                              criticalDocsIdentified: true,
                            });
                          }}
                          leftIcon={<FileCheck className="w-3.5 h-3.5" />}
                        >
                          Qualify Case
                        </Button>
                      </>
                    )}

                    {activeTab === 'matching' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenMatching(c)}
                        leftIcon={<Users className="w-3.5 h-3.5" />}
                      >
                        Match Specialist
                      </Button>
                    )}

                    {activeTab === 'active' && (
                      <div className="text-right">
                        <span className="text-[11px] text-[var(--color-text-muted)] block">Assigned Lead:</span>
                        <span className="font-bold text-[var(--color-primary)] text-xs">
                          {c.leadSpecialistName || 'Empaneled Specialist'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* MODAL 1: QUALIFY CASE CHECKLIST */}
      <Modal
        isOpen={selectedCaseForQualify !== null}
        onClose={() => setSelectedCaseForQualify(null)}
        title={`Technical Qualification: ${selectedCaseForQualify?.caseReference}`}
      >
        <div className="space-y-5 text-xs">
          <div className="p-3.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] space-y-1">
            <div className="font-bold text-sm text-[var(--color-text)]">{selectedCaseForQualify?.projectTitle}</div>
            <div className="text-[var(--color-text-muted)]">
              {selectedCaseForQualify?.primaryDiscipline} • {selectedCaseForQualify?.city}, {selectedCaseForQualify?.stateRegion}
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)] pt-1 italic">"{selectedCaseForQualify?.scopeDescription}"</p>
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] block">
              Mandatory Qualification Checklist (All 5 required)
            </label>

            {[
              { key: 'requirementUnderstood', label: '1. Requirement scope understood and technically feasible' },
              { key: 'locationVerified', label: '2. Location, municipal jurisdiction & terrain profile verified' },
              { key: 'serviceCategoryConfirmed', label: '3. Service classification strictly aligned to 5 Pillars' },
              { key: 'contactUsable', label: '4. Client identity, email & phone authentic and reachable' },
              { key: 'criticalDocsIdentified', label: '5. Critical intake documents & site parameters logged' },
            ].map(({ key, label }) => {
              const checked = checklist[key as keyof QualificationChecklist];
              return (
                <div
                  key={key}
                  onClick={() => setChecklist(prev => ({ ...prev, [key]: !prev[key as keyof QualificationChecklist] }))}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    checked ? 'bg-[var(--color-primary-subtle)] border-[#B9DDEA]' : 'bg-[var(--color-background)] border-[var(--color-border)]'
                  }`}
                >
                  <span className={`font-semibold ${checked ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                    {label}
                  </span>
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                    checked ? 'bg-[var(--color-primary)] border-[#1697C4] text-white' : 'border-[#CDD0C7]'
                  }`}>
                    {checked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">
              Coordinator Qualification Notes
            </label>
            <textarea
              rows={3}
              value={qualifyNotes}
              onChange={(e) => setQualifyNotes(e.target.value)}
              placeholder="E.g. Verified local authority zoning. Clear title confirmed. Client urgently requires foundation calculations."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] focus:bg-[var(--color-surface)] focus:outline-hidden focus:ring-2 focus:ring-[#0369A1]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSelectedCaseForQualify(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleQualifySubmit}
              isLoading={isQualifying}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Approve & Qualify Case
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: DETERMINISTIC MATCHING DRAWER */}
      <Modal
        isOpen={selectedCaseForMatching !== null}
        onClose={() => setSelectedCaseForMatching(null)}
        title={`Specialist Matching Engine: ${selectedCaseForMatching?.caseReference}`}
      >
        <div className="space-y-5 text-xs">
          <div className="p-3.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm text-[var(--color-text)]">{selectedCaseForMatching?.projectTitle}</span>
              <Badge variant="primary" size="sm">{selectedCaseForMatching?.pillar?.replace(/_/g, ' ')}</Badge>
            </div>
            <div className="text-[var(--color-text-muted)]">
              {selectedCaseForMatching?.primaryDiscipline} • {selectedCaseForMatching?.city} • Budget: {selectedCaseForMatching?.budgetRange}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text)] mb-2">
              Ranked Empaneled Specialists (Deterministic Algorithm)
            </h4>

            {isLoadingMatches ? (
              <div className="p-8 text-center text-[var(--color-text-muted)]">
                <Clock className="w-6 h-6 animate-spin mx-auto text-[#0369A1] mb-2" />
                <span>Evaluating specialization, location proximity, and active capacity...</span>
              </div>
            ) : matches.length === 0 ? (
              <div className="p-6 text-center text-[var(--color-text-muted)] bg-[var(--color-background)] rounded-xl">
                No matching verified consultants found. Please onboard specialists into this domain pillar.
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {matches.map(({ consultant, matchScore, matchReasons, activeCasesCount }) => {
                  const consultantUserId = consultant.userId || consultant.id;
                  const isSelected = selectedConsultantForAssign === consultantUserId;

                  return (
                    <div
                      key={consultant.id}
                      onClick={() => setSelectedConsultantForAssign(consultantUserId)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[var(--color-primary-subtle)] border-[#1697C4] ring-2 ring-[#1697C4]'
                          : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-background)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[var(--color-text)]">{consultant.name}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-primary)] text-white">
                              {matchScore}% Match
                            </span>
                            {activeCasesCount > 0 && (
                              <span className="text-[10px] text-[var(--color-text-muted)] bg-[#D6E8F0] px-1.5 py-0.5 rounded">
                                {activeCasesCount} active cases
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--color-text-muted)]">
                            {consultant.title} • {consultant.firmName} ({consultant.city})
                          </div>
                          <div className="space-y-0.5 pt-1">
                            {matchReasons.map((r, i) => (
                              <div key={i} className="text-[10px] text-[var(--color-primary)] flex items-center gap-1">
                                <Check className="w-2.5 h-2.5 stroke-[3] shrink-0" />
                                <span>{r}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[var(--color-primary)] border-[#1697C4] text-white' : 'border-[#CDD0C7]'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[11px] font-bold uppercase text-[var(--color-text-muted)] block mb-1">
                Estimated Fee Range
              </label>
              <input
                type="text"
                value={feeEstimate}
                onChange={(e) => setFeeEstimate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]"
                placeholder="₹4.5L - ₹6.0L Fee"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-[var(--color-text-muted)] block mb-1">
                Response SLA Window
              </label>
              <select
                value={responseDueHours}
                onChange={(e) => setResponseDueHours(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]"
              >
                <option value="24">24 Hours (Urgent)</option>
                <option value="48">48 Hours (Standard)</option>
                <option value="72">72 Hours (Relaxed)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSelectedCaseForMatching(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleDispatchAssignment}
              disabled={!selectedConsultantForAssign || isLoadingMatches}
              isLoading={isAssigning}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Dispatch Assignment Lead
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: REQUEST CLARIFICATION */}
      <Modal
        isOpen={selectedCaseForInfo !== null}
        onClose={() => setSelectedCaseForInfo(null)}
        title={`Request Clarification from ${selectedCaseForInfo?.clientName}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-[var(--color-text-muted)]">
            This will place Case <strong>{selectedCaseForInfo?.caseReference}</strong> into <code>NEEDS_INFORMATION</code> status and alert the client to reply in their customer console.
          </p>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] block mb-1">
              Clarification Question
            </label>
            <textarea
              rows={4}
              value={infoQuestion}
              onChange={(e) => setInfoQuestion(e.target.value)}
              placeholder="E.g. Please upload the latest boundary survey CAD file or confirm whether soil test bore logs are available."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] focus:bg-[var(--color-surface)] focus:outline-hidden focus:ring-2 focus:ring-[#0369A1]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSelectedCaseForInfo(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSendInfoRequest}
              disabled={!infoQuestion.trim()}
              isLoading={isSendingInfo}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Send Request
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
