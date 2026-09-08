import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageContainer } from '../components/ui/PageContainer';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ROUTES } from '../lib/routes';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Download, 
  MessageSquare, 
  MapPin, 
  ShieldCheck, 
  FileText, 
  Send,
  AlertCircle,
  HelpCircle,
  Check,
  Building2,
  Calendar,
  DollarSign,
  User,
  Users,
  Layers,
  History,
  Lock,
  Eye,
  Plus,
  FileSpreadsheet,
  TrendingDown,
  Printer,
  FileCheck2,
  RefreshCw,
  Camera,
  Navigation
} from 'lucide-react';
import { 
  fetchCaseByIdApi,
  createCaseNoteApi,
  respondToInformationRequestApi,
  createInformationRequestApi,
  sendCaseMessageApi,
  fetchBOQsForCaseApi,
  fetchBOQByIdApi,
  createBOQRequestApi,
  updateBOQRevisionApi,
  submitBOQForReviewApi,
  requestBOQChangesApi,
  approveBOQApi,
  fetchQuotationsForBOQApi,
  createQuotationApi,
  acceptQuotationApi,
  fetchQuotationComparisonApi,
  fetchTaxCodesApi
} from '../lib/api';
import { 
  CaseRecord, 
  ProjectMilestoneRecord, 
  DocumentRecord, 
  CaseEvent,
  CaseStatusHistoryRecord,
  AssignmentRecord,
  CaseInformationRequestRecord,
  CaseNoteRecord,
  CaseMessageRecord,
  CaseStatus,
  BOQRecord,
  BOQRevisionRecord,
  QuotationRecord,
  QuotationComparisonMatrix,
  TaxCodeRecord
} from '../types/backend';
import { useAuth } from '../contexts/AuthContext';
import { formatINR } from '../lib/money';
import { BOQSummaryCard } from '../components/commercial/BOQSummaryCard';
import { BOQItemTable } from '../components/commercial/BOQItemTable';
import { BOQApprovalBanner } from '../components/commercial/BOQApprovalBanner';
import { QuotationComparisonView } from '../components/commercial/QuotationComparisonView';
import { captureProductEvent, PRODUCT_EVENTS } from '../lib/analytics';
import { BOQDocumentView } from '../components/commercial/BOQDocumentView';
import { BOQEditorModal } from '../components/commercial/BOQEditorModal';
import { SubmitQuotationModal } from '../components/commercial/SubmitQuotationModal';
import { CreateBOQModal } from '../components/commercial/CreateBOQModal';
import { isSafeSitePhotoDataUrl, MAX_SITE_PHOTOS, SiteCoordinates, SitePhotoAttachment } from '../lib/siteMedia';
import { SiteMeasurementEntry } from '../lib/serviceEvidenceConfig';

const LIFECYCLE_STAGES: { id: string; label: string; statuses: CaseStatus[] }[] = [
  { id: '1', label: '1. Requirement Intake', statuses: ['NEW', 'QUALIFICATION_PENDING', 'NEEDS_INFORMATION'] },
  { id: '2', label: '2. Qualification & Match', statuses: ['QUALIFIED', 'COORDINATOR_ASSIGNED', 'MATCHING', 'CONSULTANT_DECLINED'] },
  { id: '3', label: '3. Specialist Assigned', statuses: ['CONSULTANT_ASSIGNED', 'CONSULTANT_ACCEPTED'] },
  { id: '4', label: '4. Scope Discovery', statuses: ['SCOPE_DISCOVERY', 'PROPOSAL_PENDING'] },
  { id: '5', label: '5. Proposal & Ready', statuses: ['CUSTOMER_REVIEW', 'APPROVED', 'PROJECT_READY', 'REJECTED', 'CANCELLED', 'CLOSED'] },
];

export const ProjectDetailPage: React.FC = () => {
  const { id = 'BEG-4092' } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'commercial' | 'info-requests' | 'history' | 'notes' | 'milestones' | 'documents' | 'chat'>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Loaded Data
  const [caseData, setCaseData] = useState<CaseRecord | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestoneRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [events, setEvents] = useState<CaseEvent[]>([]);
  const [statusHistory, setStatusHistory] = useState<CaseStatusHistoryRecord[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [infoRequests, setInfoRequests] = useState<CaseInformationRequestRecord[]>([]);
  const [notes, setNotes] = useState<CaseNoteRecord[]>([]);
  const [messages, setMessages] = useState<CaseMessageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Phase 6 Commercial Engine State
  const [boqs, setBoqs] = useState<BOQRecord[]>([]);
  const [selectedBoq, setSelectedBoq] = useState<BOQRecord | null>(null);
  const [comparisonMatrix, setComparisonMatrix] = useState<QuotationComparisonMatrix | null>(null);
  const [taxCodes, setTaxCodes] = useState<TaxCodeRecord[]>([]);
  const [commercialSubTab, setCommercialSubTab] = useState<'boq' | 'quotations'>('boq');
  const [isCreateBoqOpen, setIsCreateBoqOpen] = useState(false);
  const [isEditBoqOpen, setIsEditBoqOpen] = useState(false);
  const [isSubmitQuoteOpen, setIsSubmitQuoteOpen] = useState(false);
  const [isPrintDocOpen, setIsPrintDocOpen] = useState(false);

  // Modal / Input Forms
  const [selectedInfoReqForAnswer, setSelectedInfoReqForAnswer] = useState<CaseInformationRequestRecord | null>(null);
  const [infoAnswerText, setInfoAnswerText] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteVisibility, setNewNoteVisibility] = useState<'INTERNAL' | 'CUSTOMER_VISIBLE'>('CUSTOMER_VISIBLE');
  const [isSavingNote, setIsSavingNote] = useState(false);

  const [newChatMessage, setNewChatMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const loadCaseDetails = () => {
    setIsLoading(true);
    setFetchError(null);
    fetchCaseByIdApi(id)
      .then((res) => {
        if (res.case) {
          setCaseData(res.case);
          setMilestones(res.milestones || []);
          setDocuments(res.documents || []);
          setEvents(res.events || []);
          setStatusHistory(res.statusHistory || []);
          setAssignments(res.assignments || []);
          setInfoRequests(res.infoRequests || []);
          setNotes(res.notes || []);
          setMessages(res.messages || []);
        }
      })
      .catch((err) => {
        setFetchError(err.message || 'Failed to load case');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const loadCommercialData = () => {
    fetchBOQsForCaseApi(id)
      .then((res) => {
        if (res.boqs && res.boqs.length > 0) {
          setBoqs(res.boqs);
          if (!selectedBoq || !res.boqs.some(b => b.id === selectedBoq.id)) {
            setSelectedBoq(res.boqs[0]);
          }
        }
      })
      .catch(() => {});

    fetchTaxCodesApi()
      .then((res) => {
        if (res.taxCodes) setTaxCodes(res.taxCodes);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadCaseDetails();
    loadCommercialData();
  }, [id]);

  useEffect(() => {
    if (selectedBoq) {
      fetchQuotationComparisonApi(selectedBoq.id)
        .then((res) => {
          if (res.comparison) setComparisonMatrix(res.comparison);
        })
        .catch(() => {});
    }
  }, [selectedBoq?.id]);

  useEffect(() => {
    if (commercialSubTab === 'boq' && selectedBoq?.currentRevision) {
      captureProductEvent(PRODUCT_EVENTS.BOQ_VIEWED, {
        revision_status: selectedBoq.currentRevision.status,
        item_count: selectedBoq.currentRevision.items?.length ?? 0,
      });
    }
  }, [commercialSubTab, selectedBoq?.id, selectedBoq?.currentRevision?.status]);

  useEffect(() => {
    if (commercialSubTab === 'quotations' && comparisonMatrix) {
      captureProductEvent(PRODUCT_EVENTS.QUOTATION_COMPARED, {
        quote_count: comparisonMatrix.quotations.length,
        item_count: comparisonMatrix.itemsComparison.length,
      });
    }
  }, [commercialSubTab, comparisonMatrix?.quotations.length, comparisonMatrix?.itemsComparison.length]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Phase 6 Commercial Handlers
  const handleCreateBOQ = async (input: any) => {
    if (!caseData) return;
    const res = await createBOQRequestApi(caseData.id, input);
    showToast('BOQ Schedule initialized.');
    loadCommercialData();
    setSelectedBoq(res.boq);
  };

  const handleSaveBOQRevision = async (data: any) => {
    if (!selectedBoq || !selectedBoq.currentRevision) return;
    await updateBOQRevisionApi(selectedBoq.id, selectedBoq.currentRevision.id, data);
    showToast('BOQ Revision lines recalculated and updated.');
    loadCommercialData();
    const refreshed = await fetchBOQByIdApi(selectedBoq.id);
    if (refreshed.boq) setSelectedBoq(refreshed.boq);
  };

  const handleSubmitBOQForReview = async (notes?: string) => {
    if (!selectedBoq || !selectedBoq.currentRevision) return;
    const res = await submitBOQForReviewApi(selectedBoq.id, selectedBoq.currentRevision.id, notes);
    showToast('BOQ submitted for customer commercial review.');
    setSelectedBoq(res.boq);
    loadCommercialData();
  };

  const handleApproveBOQ = async (comment?: string) => {
    if (!selectedBoq || !selectedBoq.currentRevision) return;
    const res = await approveBOQApi(selectedBoq.id, selectedBoq.currentRevision.id, comment);
    captureProductEvent(PRODUCT_EVENTS.BOQ_APPROVED, {
      revision_status: res.boq.currentRevision?.status ?? 'approved',
      item_count: res.boq.currentRevision?.items?.length ?? 0,
    });
    showToast('Commercial baseline formally approved & locked.');
    setSelectedBoq(res.boq);
    loadCommercialData();
    loadCaseDetails();
  };

  const handleRequestBOQChanges = async (comment: string, reasonCategory?: string) => {
    if (!selectedBoq || !selectedBoq.currentRevision) return;
    const res = await requestBOQChangesApi(selectedBoq.id, selectedBoq.currentRevision.id, comment, reasonCategory);
    showToast('Change request logged with specialist.');
    setSelectedBoq(res.boq);
    loadCommercialData();
  };

  const handleSubmitQuotation = async (data: any) => {
    if (!selectedBoq) return;
    await createQuotationApi(selectedBoq.id, data);
    showToast('Supplier quotation submitted successfully.');
    if (selectedBoq) {
      const refreshedComp = await fetchQuotationComparisonApi(selectedBoq.id);
      if (refreshedComp.comparison) setComparisonMatrix(refreshedComp.comparison);
    }
  };

  const handleAcceptQuotation = async (quotationId: string, notes?: string) => {
    const res = await acceptQuotationApi(quotationId, notes);
    showToast(`Quotation ${res.quotation.quotationReference} accepted! Execution procurement initialized.`);
    if (selectedBoq) {
      const refreshed = await fetchBOQByIdApi(selectedBoq.id);
      if (refreshed.boq) setSelectedBoq(refreshed.boq);
      const refreshedComp = await fetchQuotationComparisonApi(selectedBoq.id);
      if (refreshedComp.comparison) setComparisonMatrix(refreshedComp.comparison);
    }
    loadCaseDetails();
  };

  // Submit Answer to Information Request
  const handleAnswerInfoRequest = async () => {
    if (!selectedInfoReqForAnswer || !infoAnswerText.trim()) return;
    setIsSubmittingAnswer(true);
    try {
      await respondToInformationRequestApi(selectedInfoReqForAnswer.id, infoAnswerText.trim());
      showToast('Response submitted! Case status updated.');
      setSelectedInfoReqForAnswer(null);
      setInfoAnswerText('');
      loadCaseDetails();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit response.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Add Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !caseData) return;
    setIsSavingNote(true);
    try {
      await createCaseNoteApi(caseData.id, newNoteText.trim(), newNoteVisibility);
      showToast('Case note recorded.');
      setNewNoteText('');
      loadCaseDetails();
    } catch (err: any) {
      showToast(err.message || 'Failed to save note.');
    } finally {
      setIsSavingNote(false);
    }
  };

  // Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim() || !caseData) return;
    setIsSendingMessage(true);
    try {
      await sendCaseMessageApi(caseData.id, newChatMessage.trim());
      setNewChatMessage('');
      loadCaseDetails();
    } catch (err: any) {
      showToast(err.message || 'Failed to send message.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 bg-[var(--color-background)] min-h-screen">
        <PageContainer>
          <div className="bg-[var(--color-surface)] rounded-2xl p-12 text-center border border-[var(--color-border)]">
            <Clock className="w-8 h-8 text-[var(--color-primary)] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-[var(--color-text)]">Loading Case Workspace from Database...</p>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (fetchError || !caseData) {
    return (
      <div className="py-12 bg-[var(--color-background)] min-h-screen">
        <PageContainer>
          <div className="bg-[var(--color-surface)] rounded-2xl p-12 text-center border border-[var(--color-border)] space-y-4">
            <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
            <h2 className="text-xl font-bold text-[var(--color-text)]">Case Record Not Found</h2>
            <p className="text-xs text-[var(--color-text-muted)]">The requested reference "{id}" does not exist in the database.</p>
            <Link to={ROUTES.CUSTOMER_DASHBOARD}>
              <Button variant="primary" size="sm">Back to Console</Button>
            </Link>
          </div>
        </PageContainer>
      </div>
    );
  }

  // Determine current lifecycle stage index (0 to 4)
  const currentStageIndex = LIFECYCLE_STAGES.findIndex(s => s.statuses.includes(caseData.status as CaseStatus));
  const activeStage = currentStageIndex === -1 ? 0 : currentStageIndex;

  const pendingInfoRequests = infoRequests.filter(r => r.status === 'PENDING');
  const sitePhotos = Array.isArray(caseData.scopeDetails?.sitePhotos)
    ? (caseData.scopeDetails.sitePhotos as SitePhotoAttachment[]).filter((photo) => isSafeSitePhotoDataUrl(photo?.dataUrl)).slice(0, MAX_SITE_PHOTOS)
    : [];
  const siteMeasurements = Array.isArray(caseData.scopeDetails?.siteMeasurements)
    ? (caseData.scopeDetails.siteMeasurements as SiteMeasurementEntry[]).filter((item) => item?.key && item?.value).slice(0, 8)
    : [];
  const rawSiteCoordinates = caseData.scopeDetails?.siteCoordinates as SiteCoordinates | undefined;
  const siteCoordinates = rawSiteCoordinates
    && Number.isFinite(rawSiteCoordinates.latitude)
    && Number.isFinite(rawSiteCoordinates.longitude)
    ? rawSiteCoordinates
    : null;

  return (
    <div className="py-8 sm:py-12 bg-[var(--color-background)] min-h-screen">
      <PageContainer>
        
        {/* Breadcrumb & Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to={user?.role === 'CUSTOMER' ? ROUTES.CUSTOMER_DASHBOARD : user?.role === 'CONSULTANT' ? ROUTES.CONSULTANT_DASHBOARD : ROUTES.EMPLOYEE_DASHBOARD}
            className="text-xs font-bold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-[var(--color-primary-subtle)] text-[var(--color-primary)] px-2.5 py-1 rounded-md border border-[#B9DDEA]">
              Ref: {caseData.caseReference}
            </span>
            <Badge variant="primary" size="sm">
              {caseData.status.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>

        {toastMessage && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--color-primary-subtle)] border border-[#B9DDEA] text-[var(--color-primary)] text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)]" />
              <span>{toastMessage}</span>
            </div>
            <button type="button" onClick={() => setToastMessage(null)} className="hover:underline text-[11px]">
              Dismiss
            </button>
          </div>
        )}

        {/* Case Header Card */}
        <div className="bg-[var(--color-surface)] rounded-2xl p-6 sm:p-8 border border-[var(--color-border)] shadow-xs mb-8 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-brand-brown)]">
                <MapPin className="w-3.5 h-3.5" />
                <span>{caseData.address}, {caseData.city}, {caseData.stateRegion}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)]">
                {caseData.projectTitle}
              </h1>
              <p className="text-sm text-[var(--color-text-muted)]">
                Client: <strong>{caseData.clientName}</strong> ({caseData.clientOrg || 'Private'}) • Discipline: <strong>{caseData.primaryDiscipline}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="primary" size="md">
                {caseData.pillar?.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>

          {/* AUTHORITATIVE LIFECYCLE PROGRESSION STEPPER */}
          <div className="pt-4 border-t border-[var(--color-border)]">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {LIFECYCLE_STAGES.map((st, idx) => {
                const isPassed = idx < activeStage;
                const isCurrent = idx === activeStage;

                return (
                  <div
                    key={st.id}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isCurrent
                        ? 'bg-[var(--color-primary)] text-white border-[#1697C4] shadow-xs'
                        : isPassed
                        ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] border-[#B9DDEA]'
                        : 'bg-[var(--color-background)] text-[var(--color-text-subtle)] border-[var(--color-border)]'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {isPassed ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <span className={`w-3.5 h-3.5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                          isCurrent ? 'bg-[var(--color-surface)] text-[var(--color-primary)]' : 'bg-[#D6E8F0] text-[var(--color-text-muted)]'
                        }`}>
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-bold truncate">{st.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {(sitePhotos.length > 0 || siteCoordinates || siteMeasurements.length > 0) && (
            <div className="grid gap-4 border-t border-[var(--color-border)] pt-5 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="space-y-4">
                {siteMeasurements.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-subtle)]">
                      <Layers className="h-4 w-4 text-[var(--color-primary)]" />
                      Site measurements ({siteMeasurements.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {siteMeasurements.map((item) => (
                        <span key={item.key} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
                          <strong className="text-[var(--color-text)]">{item.label}:</strong> {item.value} {item.unit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {sitePhotos.length > 0 && (
                  <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-subtle)]">
                    <Camera className="h-4 w-4 text-[var(--color-primary)]" />
                    Site photos ({sitePhotos.length})
                  </div>
                  <div className="grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-3">
                    {sitePhotos.map((photo) => (
                      <a
                        key={photo.id}
                        href={photo.dataUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]"
                      >
                        <img
                          src={photo.dataUrl}
                          alt={photo.shotLabel || photo.name || 'Site photograph'}
                          className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                        <div className="px-2.5 py-2">
                          <p className="truncate text-[10px] font-bold text-[var(--color-text)]">{photo.shotLabel || 'Site photo'}</p>
                          <p className="truncate text-[9px] text-[var(--color-text-muted)]">{(photo.captureMethod || 'UPLOAD').replace(/_/g, ' ').toLowerCase()} · {photo.sizeLabel}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
                )}
              </div>
              {siteCoordinates && (
                <div className="lg:min-w-56">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-subtle)]">
                    <Navigation className="h-4 w-4 text-[var(--color-primary)]" />
                    Exact site location
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${siteCoordinates.latitude},${siteCoordinates.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-primary)] px-4 py-2.5 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)]"
                  >
                    <MapPin className="h-4 w-4" />
                    Open in Maps
                  </a>
                  <p className="mt-2 font-mono text-[10px] text-[var(--color-text-muted)]">
                    {siteCoordinates.latitude.toFixed(6)}, {siteCoordinates.longitude.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pending Information Request Alert (if any) */}
          {pendingInfoRequests.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <strong>Technical Clarification Requested:</strong>
                  <p>"{pendingInfoRequests[0].question}"</p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedInfoReqForAnswer(pendingInfoRequests[0]);
                  setActiveTab('info-requests');
                }}
              >
                Provide Answer
              </Button>
            </div>
          )}
        </div>

        {/* Workspace Tab Bar */}
        <div className="flex border-b border-[var(--color-border)] mb-6 overflow-x-auto gap-2 text-xs font-bold">
          {[
            { id: 'overview', label: 'Case Brief & Scope', icon: FileText },
            { id: 'commercial', label: `Commercial & BOQ (${boqs.length})`, icon: FileSpreadsheet, highlight: true },
            { id: 'info-requests', label: `Clarifications (${infoRequests.length})`, icon: HelpCircle },
            { id: 'history', label: `Audit Trail (${statusHistory.length})`, icon: History },
            { id: 'notes', label: `Coordination Notes (${notes.length})`, icon: Layers },
            { id: 'milestones', label: `Milestones (${milestones.length})`, icon: CheckCircle2 },
            { id: 'documents', label: `Documents (${documents.length})`, icon: Download },
            { id: 'chat', label: `Team Messages (${messages.length})`, icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-all ${
                  isTabActive
                    ? 'border-[#1697C4] text-[var(--color-primary)] bg-[var(--color-surface)] rounded-t-xl shadow-xs font-extrabold'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                } ${tab.highlight && !isTabActive ? 'text-emerald-700 font-semibold' : ''}`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB: COMMERCIAL & BOQ ENGINE (PHASE 6) */}
        {activeTab === 'commercial' && (
          <div id="commercial-engine-panel" className="space-y-6">
            {/* Top Commercial Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)] shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--color-text)]">
                    Commercial Estimation & Procurement Engine
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Authoritative Schedule of Quantities, Multi-Provider Quotations & Locked Baselines
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {selectedBoq && (
                  <>
                    <Button
                      id="btn-open-print-charter"
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsPrintDocOpen(true)}
                      className="gap-1.5 text-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Estimate Charter
                    </Button>
                    <Button
                      id="btn-edit-boq"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditBoqOpen(true)}
                      disabled={selectedBoq.status === 'APPROVED'}
                      className="gap-1.5 text-xs"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      {selectedBoq.status === 'APPROVED' ? 'Locked (Approved)' : 'Edit BOQ Revision'}
                    </Button>
                  </>
                )}
                <Button
                  id="btn-init-new-boq"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCreateBoqOpen(true)}
                  className="gap-1.5 text-xs bg-[var(--color-primary)] hover:bg-[#123e29]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New BOQ Schedule
                </Button>
              </div>
            </div>

            {boqs.length === 0 ? (
              <div className="bg-[var(--color-surface)] rounded-2xl p-12 border border-[var(--color-border)] text-center space-y-4 shadow-xs">
                <FileSpreadsheet className="w-12 h-12 text-[var(--color-text-subtle)] mx-auto" />
                <div className="max-w-md mx-auto">
                  <h4 className="font-bold text-base text-[var(--color-text)]">No Commercial Schedules Initialized</h4>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Create the first Bill of Quantities schedule to begin itemized specifications, rate estimation, and supplier quotation comparisons.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCreateBoqOpen(true)}
                  className="gap-1.5 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Initialize BOQ Schedule
                </Button>
              </div>
            ) : selectedBoq ? (
              <div className="space-y-6">
                {/* BOQ Selection Bar if multiple BOQs exist */}
                {boqs.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-xs font-bold text-[var(--color-text-subtle)] uppercase shrink-0">BOQ Schedules:</span>
                    {boqs.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBoq(b)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 border ${
                          selectedBoq.id === b.id
                            ? 'bg-[var(--color-primary)] text-white border-[#1697C4] font-bold'
                            : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-stone-50'
                        }`}
                      >
                        {b.boqReference} ({b.title})
                      </button>
                    ))}
                  </div>
                )}

                {/* BOQ Summary Card */}
                <BOQSummaryCard 
                  boq={selectedBoq} 
                  onSelect={(b) => setSelectedBoq(b)}
                  onOpenComparison={() => setCommercialSubTab('quotations')}
                  onOpenPrintView={() => setIsPrintDocOpen(true)}
                />

                {/* Sub-Navigation: BOQ Items vs Quotation Comparison */}
                <div className="flex border-b border-[var(--color-border)] gap-4 text-xs font-bold">
                  <button
                    id="subtab-boq-items"
                    type="button"
                    onClick={() => setCommercialSubTab('boq')}
                    className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
                      commercialSubTab === 'boq'
                        ? 'border-[#1697C4] text-[var(--color-primary)] font-bold'
                        : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    BOQ Line Items & Technical Specification
                  </button>
                  <button
                    id="subtab-quotations"
                    type="button"
                    onClick={() => setCommercialSubTab('quotations')}
                    className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
                      commercialSubTab === 'quotations'
                        ? 'border-[#1697C4] text-[var(--color-primary)] font-bold'
                        : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Supplier Quotation Comparison Matrix ({comparisonMatrix?.quotations.length || 0})
                  </button>
                </div>

                {/* Subtab 1: BOQ Items & Approval Workflow */}
                {commercialSubTab === 'boq' && selectedBoq.currentRevision && (
                  <div className="space-y-6">
                    <BOQApprovalBanner
                      boq={selectedBoq}
                      revision={selectedBoq.currentRevision}
                      onApprove={handleApproveBOQ}
                      onRequestChanges={handleRequestBOQChanges}
                      onSubmitForReview={handleSubmitBOQForReview}
                    />

                    <BOQItemTable
                      items={selectedBoq.currentRevision.items || []}
                      adjustments={selectedBoq.currentRevision.adjustments || []}
                      subtotal={selectedBoq.currentRevision.subtotal}
                      taxTotal={selectedBoq.currentRevision.taxTotal}
                      adjustmentTotal={selectedBoq.currentRevision.adjustmentTotal}
                      grandTotal={selectedBoq.currentRevision.grandTotal}
                    />
                  </div>
                )}

                {/* Subtab 2: Supplier Quotations & Normalized Matrix */}
                {commercialSubTab === 'quotations' && (
                  <div>
                    {comparisonMatrix ? (
                      <QuotationComparisonView
                        comparison={comparisonMatrix}
                        boq={selectedBoq}
                        onAcceptQuotation={handleAcceptQuotation}
                        onOpenSubmitModal={() => setIsSubmitQuoteOpen(true)}
                        canAccept={true}
                      />
                    ) : (
                      <div className="p-8 text-center bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
                        Loading quotation comparison matrix...
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-xs space-y-4">
                <h3 className="font-bold text-base text-[var(--color-text)]">Technical Scope Summary</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {caseData.scopeDescription}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border)] text-xs">
                  <div>
                    <span className="text-[var(--color-text-subtle)] block font-bold uppercase text-[10px]">Building Typology</span>
                    <span className="text-[var(--color-text)] font-semibold">{caseData.buildingType}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-subtle)] block font-bold uppercase text-[10px]">Plot Dimensions / Soil</span>
                    <span className="text-[var(--color-text)] font-semibold">{caseData.plotSizeSqFt} sq ft • {caseData.terrainType}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-subtle)] block font-bold uppercase text-[10px]">Budget & Financing</span>
                    <span className="text-[var(--color-text)] font-semibold">{caseData.budgetRange} ({caseData.financingStatus})</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-subtle)] block font-bold uppercase text-[10px]">Urgency / SLA</span>
                    <span className="text-[var(--color-text)] font-semibold">{caseData.startDateUrgency}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Team Card */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-xs space-y-4 text-xs">
                <h4 className="font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--color-primary)]" />
                  Assigned Project Team
                </h4>

                <div className="p-3.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] space-y-1">
                  <div className="font-bold text-[var(--color-text)] flex items-center justify-between">
                    <span>Lead Specialist</span>
                    <Badge variant="primary" size="sm">Empaneled</Badge>
                  </div>
                  <div className="text-sm font-bold text-[var(--color-primary)]">
                    {caseData.leadSpecialistName || 'Matching in Progress'}
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">
                    {caseData.leadSpecialistName ? 'Primary domain consultant for calculations & vetting.' : 'Deterministic ranking algorithm currently allocating.'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] space-y-1">
                  <div className="font-bold text-[var(--color-text)]">Technical Case Coordinator</div>
                  <div className="text-sm font-bold text-[var(--color-text)]">BuildEcoGroup Central Desk</div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">
                    Ensuring platform milestone QA and delivery SLAs.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CLARIFICATIONS & INFO REQUESTS */}
        {activeTab === 'info-requests' && (
          <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[var(--color-text)]">Technical Information & Clarification Requests</h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Official questions logged between client and coordinator to ensure complete feasibility.
                </p>
              </div>
            </div>

            {infoRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-background)] rounded-xl">
                No active information requests logged for this case.
              </div>
            ) : (
              <div className="space-y-4">
                {infoRequests.map((req) => (
                  <div key={req.id} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-bold text-sm text-[var(--color-text)]">Q: {req.question}</div>
                        <div className="text-[11px] text-[var(--color-text-muted)]">
                          Asked by {req.requestedByName || 'Case Coordinator'} • {new Date(req.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant={req.status === 'RESPONDED' || req.status === 'RESOLVED' ? 'success' : 'warning'} size="sm">
                        {req.status}
                      </Badge>
                    </div>

                    {req.response ? (
                      <div className="p-3 bg-[var(--color-surface)] rounded-lg border border-[#B9DDEA] text-[var(--color-primary)] space-y-1">
                        <strong>Response:</strong>
                        <p>{req.response}</p>
                        <span className="text-[10px] text-[var(--color-text-muted)] block">
                          Answered on {req.respondedAt ? new Date(req.respondedAt).toLocaleString() : 'Recently'}
                        </span>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedInfoReqForAnswer(req)}
                        leftIcon={<Send className="w-3.5 h-3.5" />}
                      >
                        Submit Response
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUDIT TRAIL / STATUS HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-xs space-y-5">
            <div>
              <h3 className="font-bold text-base text-[var(--color-text)]">Authoritative State Machine Audit Trail</h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                Tamper-evident log of every canonical case status transition and operational reason.
              </p>
            </div>

            {statusHistory.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-background)] rounded-xl">
                No status transitions recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {statusHistory.map((h, idx) => (
                  <div key={h.id || idx} className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] flex items-start gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      {statusHistory.length - idx}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[var(--color-text)]">
                          {h.fromStatus ? `${h.fromStatus} → ` : ''}{h.toStatus}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-subtle)]">•</span>
                        <span className="text-[11px] text-[var(--color-text-muted)]">
                          By {h.changedByName || h.actorName || 'System Coordinator'} ({h.changedByRole || h.actorRole})
                        </span>
                        <span className="text-[10px] text-[var(--color-text-subtle)]">•</span>
                        <span className="text-[11px] text-[var(--color-text-subtle)]">
                          {new Date(h.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[var(--color-text-muted)] italic">"{h.reason}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: COORDINATION NOTES */}
        {activeTab === 'notes' && (
          <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[var(--color-text)]">Case Coordination & Technical Notes</h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Structured logs for internal technical coordination and customer-facing updates.
                </p>
              </div>
            </div>

            {/* Note creation box */}
            <form onSubmit={handleAddNote} className="p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] space-y-3 text-xs">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--color-text)] block">
                Add Coordination Note
              </label>
              <textarea
                rows={3}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Log a technical observation, phone briefing summary, or next milestone goal..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-hidden focus:ring-2 focus:ring-[#1697C4]"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      checked={newNoteVisibility === 'CUSTOMER_VISIBLE'}
                      onChange={() => setNewNoteVisibility('CUSTOMER_VISIBLE')}
                    />
                    <span>Customer Visible</span>
                  </label>
                  {user?.role !== 'CUSTOMER' && (
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        checked={newNoteVisibility === 'INTERNAL'}
                        onChange={() => setNewNoteVisibility('INTERNAL')}
                      />
                      <span className="text-amber-800 font-bold">Internal Staff Only</span>
                    </label>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!newNoteText.trim()}
                  isLoading={isSavingNote}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Save Note
                </Button>
              </div>
            </form>

            <div className="space-y-3">
              {notes.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                    n.visibility === 'INTERNAL'
                      ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm">{n.authorName}</strong>
                      <span className="text-[10px] text-[var(--color-text-muted)]">({n.authorRole})</span>
                      {n.visibility === 'INTERNAL' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Internal
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--color-text-subtle)]">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="leading-relaxed">{n.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: MILESTONES */}
        {activeTab === 'milestones' && (
          <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-xs space-y-4">
            <h3 className="font-bold text-base text-[var(--color-text)]">Structured Engineering Milestones</h3>
            <div className="space-y-3">
              {milestones.map((m) => (
                <div key={m.id} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-[var(--color-text)]">{m.title}</div>
                    <p className="text-[var(--color-text-muted)]">{m.deliverables?.join(', ') || m.description || 'Milestone deliverables pending'}</p>
                    <div className="text-[11px] text-[var(--color-text-subtle)]">Target: {m.date || m.targetDate || 'Scheduled'}</div>
                  </div>
                  <Badge variant={m.status === 'COMPLETED' ? 'success' : 'primary'} size="sm">
                    {m.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-xs space-y-4">
            <h3 className="font-bold text-base text-[var(--color-text)]">Case Documents & Deliverables</h3>
            <div className="space-y-3">
              {documents.map((d) => (
                <div key={d.id} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-[var(--color-text)]">{d.name}</div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">
                      {d.type || d.category || 'Dossier'} • {d.size || d.fileSize || 'PDF'} • Uploaded by {d.author || d.uploadedByName || 'Team'}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => showToast(`Downloading: ${d.name}`)}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: TEAM CHAT / MESSAGES */}
        {activeTab === 'chat' && (
          <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-xs space-y-5">
            <h3 className="font-bold text-base text-[var(--color-text)]">Case Communication Stream</h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {messages.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-background)] rounded-xl">
                  No messages yet. Start the conversation below.
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <strong className="text-[var(--color-text)]">{msg.senderName} ({msg.senderRole})</strong>
                      <span className="text-[10px] text-[var(--color-text-subtle)]">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[var(--color-text-muted)]">{msg.message}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
                placeholder="Type a message to project team..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] focus:bg-[var(--color-surface)] focus:outline-hidden"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!newChatMessage.trim()}
                isLoading={isSendingMessage}
                rightIcon={<Send className="w-3.5 h-3.5" />}
              >
                Send
              </Button>
            </form>
          </div>
        )}

      </PageContainer>

      {/* MODAL: SUBMIT INFO REQUEST ANSWER */}
      <Modal
        isOpen={selectedInfoReqForAnswer !== null}
        onClose={() => setSelectedInfoReqForAnswer(null)}
        title="Clarification Response"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
            <strong>Question from Technical Coordinator:</strong>
            <p>"{selectedInfoReqForAnswer?.question}"</p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] block mb-1">
              Your Answer / Clarification
            </label>
            <textarea
              rows={4}
              value={infoAnswerText}
              onChange={(e) => setInfoAnswerText(e.target.value)}
              placeholder="Provide technical clarification details or links to site records..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] focus:bg-[var(--color-surface)] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSelectedInfoReqForAnswer(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAnswerInfoRequest}
              disabled={!infoAnswerText.trim()}
              isLoading={isSubmittingAnswer}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Submit Clarification
            </Button>
          </div>
        </div>
      </Modal>

      {/* PHASE 6 COMMERCIAL MODALS */}
      {caseData && (
        <CreateBOQModal
          caseId={caseData.id}
          isOpen={isCreateBoqOpen}
          onClose={() => setIsCreateBoqOpen(false)}
          onSubmit={handleCreateBOQ}
        />
      )}

      {selectedBoq && (
        <>
          <BOQEditorModal
            boq={selectedBoq}
            taxCodes={taxCodes}
            isOpen={isEditBoqOpen}
            onClose={() => setIsEditBoqOpen(false)}
            onSaveRevision={handleSaveBOQRevision}
          />

          <SubmitQuotationModal
            boq={selectedBoq}
            isOpen={isSubmitQuoteOpen}
            onClose={() => setIsSubmitQuoteOpen(false)}
            onSubmit={handleSubmitQuotation}
          />

          {isPrintDocOpen && (
            <BOQDocumentView
              boq={selectedBoq}
              onClose={() => setIsPrintDocOpen(false)}
            />
          )}
        </>
      )}

    </div>
  );
};
