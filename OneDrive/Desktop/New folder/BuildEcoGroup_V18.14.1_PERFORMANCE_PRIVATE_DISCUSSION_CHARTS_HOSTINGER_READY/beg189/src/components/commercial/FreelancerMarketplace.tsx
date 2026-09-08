import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  Search,
  Filter,
  Star,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  ShieldCheck,
  Award,
  ChevronRight,
  DollarSign,
  FileCheck,
  X,
  PlusCircle,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { formatINR } from '../../lib/money';
import { 
  FreelancerOpportunityRecord, 
  FreelancerProfileRecord, 
  FreelancerBidRecord 
} from '../../types/backend';

interface FreelancerMarketplaceProps {
  userRole?: string;
  currentUserId?: string;
}

export const FreelancerMarketplace: React.FC<FreelancerMarketplaceProps> = ({
  userRole = 'FREELANCER',
  currentUserId = 'fl-01',
}) => {
  const [activeTab, setActiveTab] = useState<'OPPORTUNITIES' | 'PROFILES'>('OPPORTUNITIES');
  
  // Opportunities State
  const [opportunities, setOpportunities] = useState<FreelancerOpportunityRecord[]>([]);
  const [profiles, setProfiles] = useState<FreelancerProfileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [oppDetails, setOppDetails] = useState<{ opportunity: FreelancerOpportunityRecord; bids: FreelancerBidRecord[] } | null>(null);
  
  // Bid Submission Modal State
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState(28000);
  const [bidDeliveryDays, setBidDeliveryDays] = useState(4);
  const [bidProposalText, setBidProposalText] = useState('');
  const [bidPortfolioLinks, setBidPortfolioLinks] = useState('https://portfolio.buildecogroup.com/sample-3d-sim');
  const [submittingBid, setSubmittingBid] = useState(false);
  const [bidSuccessMessage, setBidSuccessMessage] = useState<string | null>(null);

  // Filters
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      let url = '/api/freelancer/opportunities?';
      if (serviceFilter !== 'ALL') url += `service=${serviceFilter}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setOpportunities(data.opportunities);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/freelancer/profiles');
      const data = await res.json();
      if (data.success) {
        setProfiles(data.profiles);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOppDetails = async (oppId: string) => {
    try {
      const res = await fetch(`/api/freelancer/opportunities/${oppId}`);
      const data = await res.json();
      if (data.success) {
        setOppDetails({ opportunity: data.opportunity, bids: data.bids });
        setSelectedOppId(oppId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOpportunities();
    fetchProfiles();
  }, [serviceFilter, searchQuery]);

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppDetails) return;

    setSubmittingBid(true);
    setBidSuccessMessage(null);
    try {
      const payload = {
        opportunityId: oppDetails.opportunity.id,
        workPackageId: oppDetails.opportunity.workPackageId,
        proposedAmountINR: Number(bidAmount),
        proposedDeliveryDays: Number(bidDeliveryDays),
        proposalText: bidProposalText,
        portfolioLinks: bidPortfolioLinks.split('\n').map(l => l.trim()).filter(Boolean),
        milestoneBreakdown: [
          { milestoneName: 'Draft Model & Geometry Setup', percentage: 40, amountINR: Math.round(bidAmount * 0.4) },
          { milestoneName: 'Final Analysis & Deliverable Files', percentage: 60, amountINR: Math.round(bidAmount * 0.6) },
        ],
      };

      const res = await fetch('/api/freelancer/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setBidSuccessMessage('Bid submitted successfully to the case coordinator review queue.');
        setIsBidModalOpen(false);
        fetchOppDetails(oppDetails.opportunity.id);
        fetchOpportunities();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleUpdateBidStatus = async (oppId: string, bidId: string, status: 'SHORTLISTED' | 'ACCEPTED' | 'DECLINED') => {
    try {
      const res = await fetch(`/api/freelancer/opportunities/${oppId}/bids/${bidId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOppDetails(oppId);
        fetchOpportunities();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6" id="freelancer-marketplace-root">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Freelancer Marketplace & Expert Network</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Category-wise micro-tasks, competitive sealed bidding, verified specialist directory, and SLA-governed milestone delivery.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('OPPORTUNITIES')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'OPPORTUNITIES' ? 'bg-[var(--color-surface)] text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Open Tasks ({opportunities.length})
          </button>
          <button
            onClick={() => setActiveTab('PROFILES')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'PROFILES' ? 'bg-[var(--color-surface)] text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Verified Experts ({profiles.length})
          </button>
        </div>
      </div>

      {bidSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span>{bidSuccessMessage}</span>
          <button onClick={() => setBidSuccessMessage(null)} className="text-slate-400 hover:text-slate-600">
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
            placeholder="Search tasks, required skills, tools (e.g. PVsyst, AutoCAD, QGIS, Vastu)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
        >
          <option value="ALL">All Categories & Disciplines</option>
          <option value="solar-rooftop">Solar Rooftop Design</option>
          <option value="land-gis-survey">GIS & Boundary Mapping</option>
          <option value="detailed-boq-estimation">BOQ & Estimation</option>
          <option value="water-treatment-system">Water & STP Design</option>
          <option value="vastu-compliance-audit">Vastu Spatial Planning</option>
          <option value="site-cctv-iot-surveillance">CCTV & Surveillance Network</option>
        </select>
      </div>

      {/* Tab Content */}
      {activeTab === 'OPPORTUNITIES' ? (
        <div>
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading open freelance opportunities...</div>
          ) : opportunities.length === 0 ? (
            <div className="p-8 text-center bg-[var(--color-surface)] rounded-xl border border-slate-200 text-xs text-slate-500">
              No open tasks match your search filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {opportunities.map((opp) => (
                <div
                  key={opp.id}
                  onClick={() => fetchOppDetails(opp.id)}
                  className="bg-[var(--color-surface)] p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs font-mono font-bold bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                        {opp.opportunityReference}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                        opp.urgency === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                        opp.urgency === 'EXPRESS' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {opp.urgency}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mt-2 line-clamp-1">
                      {opp.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {opp.scopeSummary}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {opp.skillsRequired.map((skill, i) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">Budget Range</div>
                      <div className="text-base font-black text-slate-900">
                        ₹{formatINR(opp.budgetMin)} - ₹{formatINR(opp.budgetMax)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400">Deadline</div>
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3 text-slate-500" /> {opp.deadline}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Profiles Directory View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p) => (
            <div key={p.id} className="bg-[var(--color-surface)] p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                      {p.fullName}
                      {p.verifiedStatus === 'VERIFIED' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" /> {p.city}, {p.state} • {p.experienceYears} Yrs Exp.
                    </div>
                  </div>

                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                    p.tier === 'PREFERRED_PARTNER' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {p.tier === 'PREFERRED_PARTNER' ? 'Preferred' : 'Verified Pro'}
                  </span>
                </div>

                <div className="text-xs font-semibold text-indigo-700 mb-2">
                  {p.categories.join(', ')}
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                  {p.bio}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {p.skills.map((s, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="text-slate-400">On-time Delivery</div>
                  <div className="font-bold text-emerald-700">{p.onTimeDeliveryPercent}%</div>
                </div>
                <div>
                  <div className="text-slate-400">Rating</div>
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> {p.rating} ({p.completedAssignments})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400">Total Earned</div>
                  <div className="font-bold text-slate-900">₹{formatINR(p.totalEarnings)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Opportunity Detail & Bid Inspection Drawer */}
      {oppDetails && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-indigo-100 text-indigo-800 rounded">
                  {oppDetails.opportunity.opportunityReference}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  Budget: ₹{formatINR(oppDetails.opportunity.budgetMin)} - ₹{formatINR(oppDetails.opportunity.budgetMax)}
                </span>
              </div>
              <button onClick={() => setOppDetails(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">{oppDetails.opportunity.title}</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {oppDetails.opportunity.scopeSummary}
                </p>
              </div>

              {/* Skills & Requirements */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Required Capabilities</h4>
                <div className="flex flex-wrap gap-1.5">
                  {oppDetails.opportunity.skillsRequired.map((s, i) => (
                    <span key={i} className="text-xs bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-md font-semibold border border-indigo-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Submitted Proposals Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Submitted Proposals ({oppDetails.bids.length})
                  </h4>
                  <button
                    onClick={() => setIsBidModalOpen(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Submit Proposal
                  </button>
                </div>

                {oppDetails.bids.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                    No proposals submitted yet. Be the first specialist to submit your technical proposal.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {oppDetails.bids.map((bid) => (
                      <div key={bid.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              {bid.freelancerName}
                              <span className="text-xs text-slate-400 font-normal">({bid.freelancerCity})</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Submitted {new Date(bid.createdAt).toLocaleDateString('en-IN')}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-black text-slate-900">₹{formatINR(bid.bidAmount)}</div>
                            <div className="text-xs text-slate-500">{bid.deliveryDays} Days</div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed bg-[var(--color-surface)] p-3 rounded-lg border border-slate-100">
                          {bid.coverNote}
                        </p>

                        {/* Admin / Coordinator Actions */}
                        {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'EMPLOYEE') && (
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              bid.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                              bid.status === 'SHORTLISTED' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {bid.status}
                            </span>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateBidStatus(oppDetails.opportunity.id, bid.id, 'SHORTLISTED')}
                                className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded text-xs font-semibold"
                              >
                                Shortlist
                              </button>
                              <button
                                onClick={() => handleUpdateBidStatus(oppDetails.opportunity.id, bid.id, 'ACCEPTED')}
                                className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-xs font-bold"
                              >
                                Accept & Assign
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bid Submission Modal */}
      {isBidModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-indigo-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Submit Technical Proposal</h3>
                <p className="text-xs text-indigo-200 mt-0.5">Fixed price milestone contract with verified BuildEcoGroup escrow</p>
              </div>
              <button onClick={() => setIsBidModalOpen(false)} className="text-indigo-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBid} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Proposed Price (₹ INR)</label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg font-black text-slate-900 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Delivery Time (Days)</label>
                  <input
                    type="number"
                    value={bidDeliveryDays}
                    onChange={(e) => setBidDeliveryDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Technical Approach & Methodology</label>
                <textarea
                  rows={4}
                  value={bidProposalText}
                  onChange={(e) => setBidProposalText(e.target.value)}
                  placeholder="Detail your engineering approach, verification toolchains (e.g. PVsyst / STAAD), and assumptions..."
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Relevant Portfolio Samples</label>
                <textarea
                  rows={2}
                  value={bidPortfolioLinks}
                  onChange={(e) => setBidPortfolioLinks(e.target.value)}
                  placeholder="Paste links to completed CAD, GIS, or simulation deliverables (1 per line)"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg font-mono text-xs"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-xs border border-amber-200">
                <strong>Platform SLA Policy:</strong> 40% released on draft engineering sign-off, 60% upon final Senior Consultant QA approval.
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBidModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBid}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm"
                >
                  {submittingBid ? 'Submitting...' : 'Confirm & Submit Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
