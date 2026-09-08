import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  Users,
  Building,
  UserCheck,
  Sparkles,
  DollarSign,
  ChevronRight,
  Shield,
  FileText,
  Calendar,
  X,
} from 'lucide-react';
import { formatINR } from '../../lib/money';
import { WorkPackageRecord, WorkModelType, WorkPackageStatus } from '../../types/backend';

interface WorkPackageBuilderProps {
  userRole?: string;
  caseId?: string;
  caseReference?: string;
}

export const WorkPackageBuilder: React.FC<WorkPackageBuilderProps> = ({
  userRole = 'ADMIN',
  caseId = 'case-01',
  caseReference = 'BEG-CASE-4092',
}) => {
  const [packages, setPackages] = useState<WorkPackageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedPackageForDetail, setSelectedPackageForDetail] = useState<WorkPackageRecord | null>(null);

  // Creation Form State
  const [formTitle, setFormTitle] = useState('');
  const [formServiceSlug, setFormServiceSlug] = useState('solar-rooftop');
  const [formCategory, setFormCategory] = useState('Engineering & PVsyst CAD Design');
  const [formWorkModel, setFormWorkModel] = useState<WorkModelType>('FREELANCER');
  const [formEstimatedCost, setFormEstimatedCost] = useState(30000);
  const [formSellPrice, setFormSellPrice] = useState(42000);
  const [formScopeDescription, setFormScopeDescription] = useState('');
  const [formDeliverables, setFormDeliverables] = useState('CAD SLD (.dwg)\nPVsyst Yield Simulation (.pdf)\nBOM Schedule (.xlsx)');
  const [formDueDate, setFormDueDate] = useState('2026-09-15');
  const [formAllowsBidding, setFormAllowsBidding] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      let url = '/api/work-packages';
      if (caseId) url += `?caseId=${caseId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        const nextPackages = Array.isArray(data.packages)
          ? data.packages
          : Array.isArray(data.workPackages)
            ? data.workPackages
            : [];
        setPackages(nextPackages);
      }
    } catch (err) {
      console.error('Failed to load work packages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [caseId]);

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);

    try {
      const deliverablesList = formDeliverables
        .split('\n')
        .map((d) => d.trim())
        .filter(Boolean);

      const payload = {
        caseId: caseId || 'case-01',
        caseReference: caseReference || 'BEG-CASE-4092',
        title: formTitle,
        serviceSlug: formServiceSlug,
        packageCategory: formCategory,
        scopeDescription: formScopeDescription,
        deliverablesSummary: deliverablesList,
        workModel: formWorkModel,
        estimatedCost: Number(formEstimatedCost),
        sellPrice: Number(formSellPrice),
        budget: Number(formSellPrice),
        dueDate: formDueDate,
        allowsBidding: formAllowsBidding,
      };

      const res = await fetch('/api/work-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setNotification({
          type: 'success',
          text: `Work Package created successfully (${data.workPackage.packageReference}). Margin: ${data.workPackage.marginPercentage}%`,
        });
        setIsCreateModalOpen(false);
        fetchPackages();
        // Reset form
        setFormTitle('');
        setFormScopeDescription('');
      } else {
        setNotification({ type: 'error', text: data.error || 'Failed to create work package' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusTransition = async (packageId: string, newStatus: WorkPackageStatus) => {
    try {
      const res = await fetch(`/api/work-packages/${packageId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPackages();
        if (selectedPackageForDetail && selectedPackageForDetail.id === packageId) {
          setSelectedPackageForDetail(data.workPackage);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPackages = packages.filter((wp) => {
    if (activeFilter !== 'ALL' && wp.workModel !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        wp.title.toLowerCase().includes(q) ||
        wp.packageReference.toLowerCase().includes(q) ||
        wp.caseReference.toLowerCase().includes(q) ||
        (wp.assignedPartyName && wp.assignedPartyName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: WorkPackageStatus) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-100 text-blue-800 flex items-center gap-1"><Clock className="w-3 h-3" /> In Progress</span>;
      case 'ASSIGNED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-purple-100 text-purple-800 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Assigned</span>;
      case 'SUBMITTED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-100 text-amber-800 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Review Pending</span>;
      case 'APPROVED':
      case 'COMPLETED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case 'BIDDING_OPEN':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-teal-100 text-teal-800 flex items-center gap-1"><Sparkles className="w-3 h-3" /> In Marketplace</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getWorkModelBadge = (model: WorkModelType) => {
    const map: Record<WorkModelType, { label: string; color: string }> = {
      IN_HOUSE: { label: 'In-house Team', color: 'bg-slate-100 text-slate-700' },
      CONSULTANT: { label: 'Consultant', color: 'bg-indigo-100 text-indigo-700' },
      FREELANCER: { label: 'Freelancer', color: 'bg-purple-100 text-purple-700' },
      OUTSOURCE_AGENCY: { label: 'Agency Partner', color: 'bg-blue-100 text-blue-700' },
      VENDOR: { label: 'Product Vendor', color: 'bg-amber-100 text-amber-700' },
      EPC_PARTNER: { label: 'Turnkey EPC', color: 'bg-emerald-100 text-emerald-700' },
      HYBRID: { label: 'Hybrid Scope', color: 'bg-cyan-100 text-cyan-700' },
      REFERRAL_ONLY: { label: 'Referral Only', color: 'bg-orange-100 text-orange-700' },
    };
    const item = map[model] || { label: model, color: 'bg-slate-100 text-slate-700' };
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${item.color}`}>{item.label}</span>;
  };

  return (
    <div className="space-y-6" id="work-package-builder-root">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Category Work Package & Outsourcing Builder</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Deconstruct complex project scopes into discrete micro-deliverables, assign work models, set margin protection, and route to marketplace.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Work Package
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[var(--color-surface)] p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by package reference, title, case, or assigned specialist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'FREELANCER', 'CONSULTANT', 'OUTSOURCE_AGENCY', 'IN_HOUSE', 'VENDOR'].map((model) => (
            <button
              key={model}
              onClick={() => setActiveFilter(model)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                activeFilter === model
                  ? 'bg-purple-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {model.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading work packages...</div>
      ) : filteredPackages.length === 0 ? (
        <div className="p-8 text-center bg-[var(--color-surface)] rounded-xl border border-slate-200 text-xs text-slate-500">
          No work packages found matching current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPackages.map((wp) => (
            <div
              key={wp.id}
              onClick={() => setSelectedPackageForDetail(wp)}
              className="bg-[var(--color-surface)] p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="px-2 py-0.5 text-xs font-mono font-bold bg-purple-50 text-purple-800 rounded border border-purple-100">
                      {wp.packageReference}
                    </span>
                    <span className="text-xs font-medium text-slate-400 ml-2">
                      Linked: <strong className="text-slate-700">{wp.caseReference}</strong>
                    </span>
                  </div>
                  {getStatusBadge(wp.status)}
                </div>

                <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
                  {wp.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {wp.scopeDescription}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-3.5">
                  {getWorkModelBadge(wp.workModel)}
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" /> Due: {wp.dueDate}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Sell Price (Client)</div>
                  <div className="text-base font-black text-slate-900">
                    ₹{formatINR(wp.sellPrice)}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold">
                    Margin: {wp.marginPercentage}% (₹{formatINR(wp.marginAmount)})
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Assignee</div>
                  <div className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                    {wp.assignedPartyName || <span className="text-purple-600 font-semibold">Open in Market</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Package Detail Modal */}
      {selectedPackageForDetail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-purple-100 text-purple-800 rounded">
                  {selectedPackageForDetail.packageReference}
                </span>
                <span className="text-xs text-slate-500">
                  Case: <strong>{selectedPackageForDetail.caseReference}</strong>
                </span>
              </div>
              <button
                onClick={() => setSelectedPackageForDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-black text-slate-900">{selectedPackageForDetail.title}</h3>
                  {getStatusBadge(selectedPackageForDetail.status)}
                </div>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {selectedPackageForDetail.scopeDescription}
                </p>
              </div>

              {/* Commercials Grid */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <div className="text-slate-400 font-medium">Outsourcing Model</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedPackageForDetail.workModel}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Billed Price (Sell)</div>
                  <div className="font-bold text-emerald-700 mt-0.5 text-sm">
                    ₹{formatINR(selectedPackageForDetail.sellPrice)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Payout Status</div>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedPackageForDetail.payoutBreakdown.payoutStatus}</div>
                </div>
              </div>

              {/* Deliverables */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Mandatory Scope Deliverables
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  {selectedPackageForDetail.deliverablesSummary.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Assignee Details */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Assigned Specialist Partner
                </h4>
                {selectedPackageForDetail.assignedPartyName ? (
                  <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-purple-950 text-sm">{selectedPackageForDetail.assignedPartyName}</div>
                      <div className="text-purple-700 mt-0.5">{selectedPackageForDetail.assignedPartyRole} • {selectedPackageForDetail.assignedPartyEmail}</div>
                    </div>
                    <span className="px-2 py-1 bg-[var(--color-surface)] font-mono text-purple-800 rounded border border-purple-200">
                      ID: {selectedPackageForDetail.assignedPartyId}
                    </span>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
                    No specialist directly assigned yet. This package is listed on the Freelancer Marketplace.
                  </div>
                )}
              </div>

              {/* Lifecycle Actions */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-slate-500 font-semibold">Change Lifecycle State:</div>
                <div className="flex gap-2">
                  {selectedPackageForDetail.status === 'PENDING_ASSIGNMENT' && (
                    <button
                      onClick={() => handleStatusTransition(selectedPackageForDetail.id, 'BIDDING_OPEN')}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-bold"
                    >
                      Publish to Marketplace
                    </button>
                  )}
                  {selectedPackageForDetail.status === 'BIDDING_OPEN' && (
                    <button
                      onClick={() => handleStatusTransition(selectedPackageForDetail.id, 'ASSIGNED')}
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-bold"
                    >
                      Mark Assigned
                    </button>
                  )}
                  {selectedPackageForDetail.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleStatusTransition(selectedPackageForDetail.id, 'IN_PROGRESS')}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold"
                    >
                      Start Execution
                    </button>
                  )}
                  {selectedPackageForDetail.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleStatusTransition(selectedPackageForDetail.id, 'SUBMITTED')}
                      className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-bold"
                    >
                      Submit for QA Review
                    </button>
                  )}
                  {selectedPackageForDetail.status === 'SUBMITTED' && (
                    <button
                      onClick={() => handleStatusTransition(selectedPackageForDetail.id, 'APPROVED')}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold"
                    >
                      Approve & Release Milestone Payout
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-purple-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Create Discrete Work Package</h3>
                <p className="text-xs text-purple-200 mt-0.5">Define deliverable scope, outsourcing model, and pricing terms</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-purple-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Package Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50kW PVsyst String Layout & Yield Simulation"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Discipline</label>
                  <select
                    value={formServiceSlug}
                    onChange={(e) => setFormServiceSlug(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg font-medium"
                  >
                    <option value="solar-rooftop">Solar Rooftop EPC</option>
                    <option value="land-gis-survey">Land GIS & Geospatial</option>
                    <option value="detailed-boq-estimation">BOQ & Estimation</option>
                    <option value="water-treatment-system">Water & STP Plant</option>
                    <option value="vastu-compliance-audit">Vastu Spatial Planning</option>
                    <option value="site-cctv-iot-surveillance">Surveillance & AI</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Outsourcing Work Model</label>
                  <select
                    value={formWorkModel}
                    onChange={(e) => setFormWorkModel(e.target.value as WorkModelType)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg font-bold text-purple-900"
                  >
                    <option value="FREELANCER">Freelancer (Marketplace Task)</option>
                    <option value="CONSULTANT">Consultant (Verified Specialist)</option>
                    <option value="OUTSOURCE_AGENCY">Outsource Agency (B2B Partner)</option>
                    <option value="IN_HOUSE">In-house (Internal Team)</option>
                    <option value="VENDOR">Vendor (Supply/Fabrication)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Execution Due Date</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg font-medium"
                    required
                  />
                </div>
              </div>

              {/* Pricing & Margins */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Executor Cost (₹ INR)</label>
                  <input
                    type="number"
                    value={formEstimatedCost}
                    onChange={(e) => setFormEstimatedCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[var(--color-surface)] border rounded-lg font-black text-slate-900 text-sm"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Payable to Freelancer / Agency</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sell Price to Client (₹ INR)</label>
                  <input
                    type="number"
                    value={formSellPrice}
                    onChange={(e) => setFormSellPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[var(--color-surface)] border rounded-lg font-black text-emerald-800 text-sm"
                    required
                  />
                  <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                    Gross Margin: ₹{formatINR(formSellPrice - formEstimatedCost)} (
                    {formSellPrice > 0 ? Math.round(((formSellPrice - formEstimatedCost) / formSellPrice) * 100) : 0}%)
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scope Description & Specifications</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail explicit technical parameters, codes, software requirements..."
                  value={formScopeDescription}
                  onChange={(e) => setFormScopeDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mandatory Deliverables (1 per line)</label>
                <textarea
                  rows={3}
                  value={formDeliverables}
                  onChange={(e) => setFormDeliverables(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg font-mono text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-900 hover:bg-purple-950 text-white rounded-lg font-bold shadow-sm"
                >
                  {submitting ? 'Creating...' : 'Create & Register Work Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
