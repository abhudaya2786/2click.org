import React, { useState } from 'react';
import { 
  Inbox, 
  MessageSquare, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Building2, 
  Plus, 
  Eye, 
  TrendingUp, 
  AlertCircle, 
  Wrench, 
  DollarSign, 
  Send, 
  Check, 
  MoreVertical, 
  ExternalLink,
  ShieldCheck,
  User,
  ArrowRight,
  FileText
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { 
  PropertyLead, 
  PropertyListing, 
  PMSTicket, 
  RentalPayoutLog, 
  LeadStatus, 
  PMSTicketStatus 
} from '../../types/property';

interface OwnerInquiryDashboardProps {
  listings: PropertyListing[];
  leads: PropertyLead[];
  tickets: PMSTicket[];
  payouts: RentalPayoutLog[];
  onOpenPublishWizard: () => void;
  onUpdateLeadStatus: (leadId: string, newStatus: LeadStatus, note?: string) => void;
  onUpdateTicketStatus: (ticketId: string, newStatus: PMSTicketStatus) => void;
  onCreateNewTicket: (newTicket: PMSTicket) => void;
  className?: string;
}

export const OwnerInquiryDashboard: React.FC<OwnerInquiryDashboardProps> = ({
  listings,
  leads,
  tickets,
  payouts,
  onOpenPublishWizard,
  onUpdateLeadStatus,
  onUpdateTicketStatus,
  onCreateNewTicket,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'LEADS' | 'LISTINGS' | 'PMS_TICKETS' | 'PAYOUTS'>('LEADS');
  const [leadStatusFilter, setLeadStatusFilter] = useState<LeadStatus | 'ALL'>('ALL');
  
  // Quick Response Modal / Inline state
  const [activeLeadForResponse, setActiveLeadForResponse] = useState<string | null>(null);
  const [customResponseText, setCustomResponseText] = useState<string>('');
  const [managedListing, setManagedListing] = useState<PropertyListing | null>(null);

  // New Maintenance Ticket Modal state
  const [showNewTicketModal, setShowNewTicketModal] = useState<boolean>(false);
  const [newTicketUnit, setNewTicketUnit] = useState<string>('Tower Emerald #904');
  const [newTicketCategory, setNewTicketCategory] = useState<any>('HVAC_AC');
  const [newTicketPriority, setNewTicketPriority] = useState<any>('HIGH');
  const [newTicketDesc, setNewTicketDesc] = useState<string>('');

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    if (leadStatusFilter !== 'ALL' && lead.status !== leadStatusFilter) {
      return false;
    }
    return true;
  });

  const totalInquiries = leads.length;
  const newInquiries = leads.filter(l => l.status === 'NEW').length;
  const visitsScheduled = leads.filter(l => l.status === 'SITE_VISIT_SCHEDULED').length;
  const activeListingsCount = listings.filter(l => l.status === 'ACTIVE').length;

  const handleSendResponse = (leadId: string) => {
    if (!customResponseText.trim()) return;
    onUpdateLeadStatus(leadId, 'CONTACTED', customResponseText);
    setActiveLeadForResponse(null);
    setCustomResponseText('');
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketDesc) return;

    const tkt: PMSTicket = {
      id: `tkt-${Date.now()}`,
      propertyId: listings[0]?.id || 'prop-custom',
      propertyTitle: 'Shalimar Grand #904',
      unitNumber: newTicketUnit,
      tenantName: 'Resident Tenant',
      tenantPhone: '+91 94150 99881',
      category: newTicketCategory,
      priority: newTicketPriority,
      description: newTicketDesc,
      status: 'NEW',
      costEstimateINR: 2500,
      createdAt: new Date().toISOString()
    };

    onCreateNewTicket(tkt);
    setShowNewTicketModal(false);
    setNewTicketDesc('');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-[var(--color-surface)] border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#10B981] flex items-center justify-center font-black">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Active Inquiries
            </span>
            <div className="text-xl font-black text-slate-900">
              {totalInquiries} Leads
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--color-surface)] border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Site Visits Booked
            </span>
            <div className="text-xl font-black text-slate-900">
              {visitsScheduled} Scheduled
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--color-surface)] border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-black">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Live Listings
            </span>
            <div className="text-xl font-black text-slate-900">
              {activeListingsCount} Published
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#0F172A] text-white shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#10B981] font-mono font-bold uppercase tracking-widest block">
              PMS Escrow Payout
            </span>
            <div className="text-lg font-black text-white">
              ₹3.07 Lakh Disbursed
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenPublishWizard}
            className="bg-[#10B981] hover:bg-[#0EA5E9] text-slate-950 font-extrabold text-xs"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Post Property
          </Button>
        </div>
      </div>

      {/* Main Dashboard Navigation Bar */}
      <div className="bg-[var(--color-surface)] rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'LEADS', label: 'Lead & Inquiry Inbox', count: newInquiries > 0 ? `${newInquiries} New` : undefined },
              { id: 'LISTINGS', label: 'Managed Listings', count: `${listings.length}` },
              { id: 'PMS_TICKETS', label: 'Tenant Ticket Desk', count: `${tickets.length}` },
              { id: 'PAYOUTS', label: 'Rental Payouts & Escrow', count: 'Escrow Ready' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    activeTab === tab.id ? 'bg-[#10B981] text-slate-950 font-black' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'LEADS' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-bold">Status:</span>
              <select
                value={leadStatusFilter}
                onChange={(e) => setLeadStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-[var(--color-surface)] focus:outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">New Leads</option>
                <option value="SITE_VISIT_SCHEDULED">Site Visit Scheduled</option>
                <option value="CONTACTED">Contacted</option>
                <option value="NEGOTIATION">In Negotiation</option>
                <option value="CLOSED">Closed / Transacted</option>
              </select>
            </div>
          )}

          {activeTab === 'PMS_TICKETS' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowNewTicketModal(true)}
              className="bg-[#0F172A] text-white text-xs font-bold"
              leftIcon={<Plus className="w-3.5 h-3.5 text-[#10B981]" />}
            >
              Raise Repair Ticket
            </Button>
          )}
        </div>

        {/* =========================================================================
            TAB 1: LEAD & INQUIRY INBOX
           ========================================================================= */}
        {activeTab === 'LEADS' && (
          <div className="space-y-4 animate-fadeIn">
            {filteredLeads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No inquiries matching this status filter.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLeads.map((lead) => {
                  const isResponding = activeLeadForResponse === lead.id;

                  return (
                    <Card
                      key={lead.id}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-[var(--color-surface)] hover:border-[#10B981]/50 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs">
                            <User className="w-4 h-4 text-[#10B981]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-slate-900">
                                {lead.leadName}
                              </span>
                              {lead.isPhoneVerified && (
                                <span className="text-[10px] font-bold bg-[#EBF7F2] text-[#065F46] px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                                  <span>Verified Phone</span>
                                </span>
                              )}
                              <Badge variant="outline" className="text-[10px] font-bold">
                                {lead.leadType}
                              </Badge>
                            </div>
                            <span className="text-xs text-slate-500 font-medium">
                              Inquiry on: <strong className="text-slate-800">{lead.propertyTitle}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                            lead.status === 'NEW' ? 'bg-amber-100 text-amber-800' :
                            lead.status === 'SITE_VISIT_SCHEDULED' ? 'bg-sky-100 text-sky-800' :
                            lead.status === 'NEGOTIATION' ? 'bg-purple-100 text-purple-800' :
                            'bg-emerald-100 text-[#065F46]'
                          }`}>
                            {lead.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Lead Narrative & Visit Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="sm:col-span-2 space-y-1">
                          <span className="text-slate-400 font-bold block text-[10px] uppercase">Lead Message:</span>
                          <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                            "{lead.message}"
                          </p>
                          {lead.lastResponse && (
                            <div className="text-[11px] text-[#065F46] font-semibold flex items-center gap-1.5 pt-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                              <span>Last Action: {lead.lastResponse}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-slate-400 font-bold block text-[10px] uppercase">Phone / WhatsApp:</span>
                            <span className="font-bold text-slate-900">{lead.leadPhone}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold block text-[10px] uppercase">Requested Inspection:</span>
                            <span className="font-bold text-sky-700">{lead.requestedVisitDate || 'Flexible'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold block text-[10px] uppercase">Budget Target:</span>
                            <span className="font-bold text-slate-900">{lead.budgetDisplay || 'Standard Listing Price'}</span>
                          </div>
                        </div>
                      </div>

                      {/* One-Click Action Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${lead.leadPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${lead.leadName}, regarding your inquiry on ${lead.propertyTitle} with BuildEcoGroup...`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] text-slate-950 font-extrabold text-xs hover:bg-[#20bd5a] transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp Lead</span>
                          </a>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateLeadStatus(lead.id, 'SITE_VISIT_SCHEDULED', 'Site visit confirmed with building security pass issued.')}
                            className="text-xs font-bold border-slate-200 text-slate-800 hover:border-[#10B981]"
                            leftIcon={<Calendar className="w-3.5 h-3.5 text-[#10B981]" />}
                          >
                            Confirm Visit
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveLeadForResponse(isResponding ? null : lead.id)}
                            className="text-xs font-bold border-slate-200 text-slate-800"
                          >
                            {isResponding ? 'Cancel' : 'Add Response'}
                          </Button>
                        </div>

                        <div className="flex items-center gap-1 text-xs">
                          <button
                            type="button"
                            onClick={() => onUpdateLeadStatus(lead.id, 'NEGOTIATION')}
                            className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-semibold"
                          >
                            Move to Negotiation
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateLeadStatus(lead.id, 'CLOSED', 'Deal closed and registered.')}
                            className="px-2.5 py-1 rounded-lg text-emerald-700 hover:text-[#065F46] hover:bg-emerald-50 font-bold"
                          >
                            Mark Closed
                          </button>
                        </div>
                      </div>

                      {/* Inline Response Form */}
                      {isResponding && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 mt-2">
                          <label className="block text-[11px] font-bold text-slate-700">
                            Log Response / Status Note for {lead.leadName}:
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={customResponseText}
                              onChange={(e) => setCustomResponseText(e.target.value)}
                              placeholder="e.g. Sent digital brochure and verified KYC documents."
                              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-[var(--color-surface)] text-xs focus:border-[#10B981] focus:outline-hidden"
                            />
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleSendResponse(lead.id)}
                              className="bg-[#0F172A] text-white text-xs font-bold"
                            >
                              Save Note
                            </Button>
                          </div>
                        </div>
                      )}

                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: MANAGED LISTINGS TABLE
           ========================================================================= */}
        {activeTab === 'LISTINGS' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Property</th>
                    <th className="p-3">Purpose / Type</th>
                    <th className="p-3">Pricing / Rent</th>
                    <th className="p-3">Yield %</th>
                    <th className="p-3">Views & Leads</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listings.map((prop) => (
                    <tr key={prop.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-extrabold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={prop.images[0]?.url}
                            alt={prop.title || 'Property thumbnail'}
                            className="w-10 h-10 rounded-xl object-cover shrink-0"
                          />
                          <div>
                            <div className="line-clamp-1">{prop.title}</div>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {prop.sku} • {prop.location.city}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="font-bold text-slate-800">{prop.purpose}</span>
                        <span className="text-[10px] text-slate-500 block">{prop.subtype}</span>
                      </td>

                      <td className="p-3 font-extrabold text-slate-900">
                        {prop.priceDisplay || prop.monthlyRentDisplay}
                      </td>

                      <td className="p-3">
                        {prop.rentalYieldPct ? (
                          <span className="font-bold text-[#065F46] bg-emerald-50 px-2 py-0.5 rounded">
                            {prop.rentalYieldPct}% Net
                          </span>
                        ) : 'N/A'}
                      </td>

                      <td className="p-3 font-semibold text-slate-700">
                        <div>{prop.viewsCount} Views</div>
                        <div className="text-[#065F46] font-bold">{prop.leadsCount} Inquiries</div>
                      </td>

                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          prop.status === 'ACTIVE' ? 'bg-emerald-100 text-[#065F46]' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {prop.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setManagedListing(prop)}
                          className="text-[11px] border-slate-200"
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {managedListing && (
          <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#071C27]/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="listing-manager-title">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] border border-[#C6DEE8] bg-[var(--color-surface)] shadow-2xl sm:rounded-[28px]">
              <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-background)] p-5 sm:p-6">
                <div className="flex min-w-0 items-center gap-4">
                  <img src={managedListing.images[0]?.url} alt={managedListing.title} className="h-14 w-14 rounded-2xl object-cover ring-1 ring-[#C6DEE8]" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[var(--color-primary)]">Listing control</p>
                    <h3 id="listing-manager-title" className="truncate text-lg font-black text-[#071C27]">{managedListing.title}</h3>
                    <p className="font-mono text-xs text-[var(--color-text-muted)]">{managedListing.sku} · {managedListing.location.city}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setManagedListing(null)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#C6DEE8] text-xl text-[var(--color-brand-brown)] hover:bg-[var(--color-surface)]" aria-label="Close listing manager">×</button>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[#F8FCFE] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Status</span>
                  <strong className="mt-1 block text-sm text-[#065F46]">{managedListing.status}</strong>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[#F8FCFE] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Engagement</span>
                  <strong className="mt-1 block text-sm text-[#071C27]">{managedListing.viewsCount} views · {managedListing.leadsCount} leads</strong>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[#F8FCFE] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Commercial</span>
                  <strong className="mt-1 block text-sm text-[#071C27]">{managedListing.priceDisplay || managedListing.monthlyRentDisplay}</strong>
                </div>
              </div>

              <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                <div className="rounded-2xl border border-[var(--color-border)] p-4">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-[#071C27]"><ShieldCheck className="h-4 w-4 text-[var(--color-primary)]" /> Publishing controls</div>
                  <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">Review inquiries from this property, update its verified information through the publishing workflow, or create a fresh listing. Public contact details remain protected.</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <Button variant="primary" size="sm" onClick={() => { setActiveTab('LEADS'); setManagedListing(null); }} leftIcon={<Inbox className="h-4 w-4" />}>Review inquiries</Button>
                    <Button variant="outline" size="sm" onClick={() => { setManagedListing(null); onOpenPublishWizard(); }} leftIcon={<FileText className="h-4 w-4" />}>Open publishing workflow</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: PMS TENANT TICKET DESK
           ========================================================================= */}
        {activeTab === 'PMS_TICKETS' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tickets.map((tkt) => (
                <Card key={tkt.id} className="p-4 rounded-2xl border border-slate-200 bg-[var(--color-surface)] space-y-3 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-400">{tkt.id}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      tkt.priority === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tkt.priority} Priority
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{tkt.category.replace('_', ' ')}</h4>
                    <span className="text-xs text-slate-500">{tkt.propertyTitle} ({tkt.unitNumber})</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl">
                    "{tkt.description}"
                  </p>

                  <div className="text-xs space-y-1 pt-1 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assigned Vendor:</span>
                      <span className="font-bold text-slate-800">{tkt.assignedVendorName || 'BuildEco MEP Team'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimate:</span>
                      <span className="font-bold text-slate-900">₹{tkt.costEstimateINR.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="font-bold text-[#065F46]">{tkt.status.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {tkt.status !== 'RESOLVED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateTicketStatus(tkt.id, 'RESOLVED')}
                      className="w-full text-xs font-bold border-slate-300 text-emerald-800 hover:border-[#10B981]"
                      leftIcon={<Check className="w-3.5 h-3.5 text-[#10B981]" />}
                    >
                      Mark Work Order Resolved
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: RENTAL PAYOUTS & ESCROW
           ========================================================================= */}
        {activeTab === 'PAYOUTS' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Month</th>
                    <th className="p-3">Property Asset</th>
                    <th className="p-3">Gross Collected</th>
                    <th className="p-3">PMS Fee (8%)</th>
                    <th className="p-3">Maintenance Deductions</th>
                    <th className="p-3">Net Disbursed Payout</th>
                    <th className="p-3">Status / Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payouts.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-extrabold text-slate-900">{pay.month}</td>
                      <td className="p-3 font-semibold text-slate-700">{pay.propertyTitle}</td>
                      <td className="p-3 font-bold text-slate-900">₹{pay.grossRentCollected.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-slate-500">₹{pay.pmsCommissionFee.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-rose-600 font-semibold">₹{pay.maintenanceDeduction.toLocaleString('en-IN')}</td>
                      <td className="p-3 font-black text-emerald-800 bg-emerald-50/50">₹{pay.netPayoutToOwner.toLocaleString('en-IN')}</td>
                      <td className="p-3">
                        <span className="font-bold text-[#065F46] bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                          {pay.payoutStatus}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                          {pay.transactionRef}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* New Maintenance Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[var(--color-surface)] rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Raise Tenant Repair Ticket</h3>
              <button onClick={() => setShowNewTicketModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Unit Number</label>
                <input
                  type="text"
                  value={newTicketUnit}
                  onChange={(e) => setNewTicketUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newTicketCategory}
                  onChange={(e) => setNewTicketCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                >
                  <option value="HVAC_AC">HVAC / Air Conditioning</option>
                  <option value="ELECTRICAL">Electrical & UPS</option>
                  <option value="PLUMBING">Plumbing & Water Tanks</option>
                  <option value="CIVIL_REPAIR">Civil & Waterproofing</option>
                  <option value="DEEP_CLEANING">Deep Cleaning & Glass Wash</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Issue Narrative</label>
                <textarea
                  rows={3}
                  required
                  value={newTicketDesc}
                  onChange={(e) => setNewTicketDesc(e.target.value)}
                  placeholder="Describe tenant issue (e.g. Master bedroom AC compressor trip)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowNewTicketModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" className="bg-[#10B981] text-slate-950 font-bold">
                  Dispatch Vendor Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
