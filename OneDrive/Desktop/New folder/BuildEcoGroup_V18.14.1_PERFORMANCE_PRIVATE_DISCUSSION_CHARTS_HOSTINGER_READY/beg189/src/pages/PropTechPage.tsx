import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Search, 
  Plus, 
  ShieldCheck, 
  Calculator, 
  Handshake, 
  Globe, 
  Inbox, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Phone, 
  MessageSquare,
  ArrowRight,
  User
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

import { 
  INITIAL_PROPERTY_LISTINGS, 
  INITIAL_PROPERTY_LEADS, 
  INITIAL_PROPERTY_LEADS as INITIAL_LEADS,
  INITIAL_PMS_TICKETS, 
  INITIAL_RENTAL_PAYOUTS 
} from '../lib/propertyData';
import { 
  PropertyListing, 
  PropertyLead, 
  PMSTicket, 
  RentalPayoutLog, 
  LeadStatus, 
  PMSTicketStatus 
} from '../types/property';

import { PropertyMarketplace } from '../components/property/PropertyMarketplace';
import { PropertyPublishingWizard } from '../components/property/PropertyPublishingWizard';
import { PropertyDetailModal } from '../components/property/PropertyDetailModal';
import { OwnerInquiryDashboard } from '../components/property/OwnerInquiryDashboard';
import { FitOutCapexCalculator } from '../components/property/FitOutCapexCalculator';
import { LandownerJVSection } from '../components/property/LandownerJVSection';
import { PropertyManagementSection } from '../components/property/PropertyManagementSection';

type PropTechActiveTab = 'MARKETPLACE' | 'LANDOWNER_JV' | 'PMS_CARE' | 'CAPEX_CALCULATOR' | 'OWNER_DASHBOARD';

export const PropTechPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PropTechActiveTab>('MARKETPLACE');
  
  // Core Dynamic Application State
  const [listings, setListings] = useState<PropertyListing[]>(INITIAL_PROPERTY_LISTINGS);
  const [leads, setLeads] = useState<PropertyLead[]>(INITIAL_LEADS);
  const [tickets, setTickets] = useState<PMSTicket[]>(INITIAL_PMS_TICKETS);
  const [payouts, setPayouts] = useState<RentalPayoutLog[]>(INITIAL_RENTAL_PAYOUTS);

  // Modals State
  const [showPublishWizard, setShowPublishWizard] = useState<boolean>(false);
  const [selectedPropertyForModal, setSelectedPropertyForModal] = useState<PropertyListing | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Handlers
  const handlePublishSuccess = (newListing: PropertyListing) => {
    setListings([newListing, ...listings]);
    setShowPublishWizard(false);
    showToast(`Property "${newListing.title}" successfully published to the live marketplace!`);
  };

  const handleLeadInquirySubmit = (inquiryData: {
    leadName: string;
    leadPhone: string;
    leadEmail: string;
    requestedDate: string;
    message: string;
    leadType: 'BUYER' | 'TENANT' | 'INVESTOR' | 'JV_PARTNER';
  }) => {
    if (!selectedPropertyForModal) return;

    const newLead: PropertyLead = {
      id: `lead-${Date.now()}`,
      propertyId: selectedPropertyForModal.id,
      propertyTitle: selectedPropertyForModal.title,
      propertySubtype: selectedPropertyForModal.subtype,
      leadName: inquiryData.leadName,
      leadPhone: inquiryData.leadPhone,
      leadEmail: inquiryData.leadEmail || undefined,
      isPhoneVerified: true,
      leadType: inquiryData.leadType,
      budgetDisplay: selectedPropertyForModal.priceDisplay || selectedPropertyForModal.monthlyRentDisplay,
      requestedVisitDate: inquiryData.requestedDate,
      message: inquiryData.message,
      status: 'NEW',
      createdAt: new Date().toISOString()
    };

    setLeads([newLead, ...leads]);
    
    // Increment leads count on the listing
    setListings(listings.map(p => p.id === selectedPropertyForModal.id ? { ...p, leadsCount: p.leadsCount + 1 } : p));
    
    showToast(`Inquiry from ${inquiryData.leadName} dispatched to Owner Dashboard!`);
  };

  const handleUpdateLeadStatus = (leadId: string, newStatus: LeadStatus, note?: string) => {
    setLeads(leads.map(lead => {
      if (lead.id === leadId) {
        return {
          ...lead,
          status: newStatus,
          lastResponse: note || lead.lastResponse
        };
      }
      return lead;
    }));
    showToast(`Lead status updated to ${newStatus.replace(/_/g, ' ')}`);
  };

  const handleUpdateTicketStatus = (ticketId: string, newStatus: PMSTicketStatus) => {
    setTickets(tickets.map(tkt => {
      if (tkt.id === ticketId) {
        return {
          ...tkt,
          status: newStatus,
          resolvedAt: newStatus === 'RESOLVED' ? new Date().toISOString() : tkt.resolvedAt
        };
      }
      return tkt;
    }));
    showToast(`Ticket status updated to ${newStatus.replace(/_/g, ' ')}`);
  };

  const handleCreateNewTicket = (newTicket: PMSTicket) => {
    setTickets([newTicket, ...tickets]);
    showToast(`Maintenance repair ticket logged with technician dispatch!`);
  };

  const jvListings = listings.filter(l => l.purpose === 'JV' || l.category === 'LAND_PLOT');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#10B981] flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Global PropTech Hero & Brand Header */}
      <div className="bg-[var(--color-surface)] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#10B981] bg-[#EBF7F2] px-2.5 py-0.5 rounded-full">
                  PropTech & Asset Management Ecosystem
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  Unified Marketplace • PMS • JV
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                BuildEcoGroup Real Estate & Asset Governance
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                Unifying Property Owners, NRI Landlords, Tenants, and Real Estate Investors with high-conversion listing tools, automated PMS escrow rent collection, and landowner joint venture monetization.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowPublishWizard(true)}
                className="bg-[#10B981] hover:bg-[#0EA5E9] text-slate-950 font-black text-xs shadow-md"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Post Your Property
              </Button>
            </div>
          </div>

          {/* Master Navigation Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto border-t border-slate-100 pt-4 pb-1">
            {[
              { id: 'MARKETPLACE', label: 'Explore Marketplace (Buy / Rent)', icon: Building2 },
              { id: 'LANDOWNER_JV', label: 'For Landowners (JV & Profit Share)', icon: Handshake },
              { id: 'PMS_CARE', label: 'NRI Property Management (PMS)', icon: Globe },
              { id: 'CAPEX_CALCULATOR', label: 'Interactive ROI & Yield Calculator', icon: Calculator },
              { id: 'OWNER_DASHBOARD', label: 'Owner & Inquiry Dashboard', icon: Inbox, badge: leads.filter(l => l.status === 'NEW').length > 0 ? `${leads.filter(l => l.status === 'NEW').length} New` : undefined },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as PropTechActiveTab)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
                    isActive
                      ? 'bg-[#0F172A] text-white shadow-md'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-950 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#10B981]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="bg-[#10B981] text-slate-950 px-1.5 py-0.5 rounded text-[10px] font-black">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Main Container Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'MARKETPLACE' && (
          <PropertyMarketplace
            listings={listings}
            onSelectProperty={(prop) => setSelectedPropertyForModal(prop)}
            onOpenPublishWizard={() => setShowPublishWizard(true)}
            onOpenInquiryModal={(prop) => setSelectedPropertyForModal(prop)}
          />
        )}

        {activeTab === 'LANDOWNER_JV' && (
          <LandownerJVSection
            jvListings={jvListings}
            onSelectProperty={(prop) => setSelectedPropertyForModal(prop)}
            onOpenPublishWizard={() => setShowPublishWizard(true)}
          />
        )}

        {activeTab === 'PMS_CARE' && (
          <PropertyManagementSection
            onOpenPublishWizard={() => setShowPublishWizard(true)}
          />
        )}

        {activeTab === 'CAPEX_CALCULATOR' && (
          <FitOutCapexCalculator
            onOpenJvInquiry={() => setActiveTab('LANDOWNER_JV')}
          />
        )}

        {activeTab === 'OWNER_DASHBOARD' && (
          <OwnerInquiryDashboard
            listings={listings}
            leads={leads}
            tickets={tickets}
            payouts={payouts}
            onOpenPublishWizard={() => setShowPublishWizard(true)}
            onUpdateLeadStatus={handleUpdateLeadStatus}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onCreateNewTicket={handleCreateNewTicket}
          />
        )}

      </div>

      {/* =========================================================================
          MODALS
         ========================================================================= */}
      
      {/* 5-Step Property Publishing Wizard */}
      {showPublishWizard && (
        <PropertyPublishingWizard
          onClose={() => setShowPublishWizard(false)}
          onPublishSuccess={handlePublishSuccess}
        />
      )}

      {/* Property Full Dossier Detail Modal */}
      {selectedPropertyForModal && (
        <PropertyDetailModal
          property={selectedPropertyForModal}
          onClose={() => setSelectedPropertyForModal(null)}
          onSubmitInquiry={handleLeadInquirySubmit}
        />
      )}

    </div>
  );
};
