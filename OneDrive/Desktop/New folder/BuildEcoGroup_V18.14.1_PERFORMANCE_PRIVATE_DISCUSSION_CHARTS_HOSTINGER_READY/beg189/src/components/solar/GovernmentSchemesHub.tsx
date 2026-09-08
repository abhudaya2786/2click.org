import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  HelpCircle, 
  ExternalLink, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  Sun, 
  Droplet, 
  Percent, 
  FileCheck,
  TrendingDown,
  Info
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { STATE_SUBSIDY_DATABASE } from '../../lib/solarRegistry';

interface GovernmentSchemesHubProps {
  onOpenSubsidyChecker: () => void;
  onOpenQuickQuote: () => void;
}

export const GovernmentSchemesHub: React.FC<GovernmentSchemesHubProps> = ({
  onOpenSubsidyChecker,
  onOpenQuickQuote
}) => {
  const [activeTab, setActiveTab] = useState<'pmsuryaghar' | 'ci_incentives' | 'kusum' | 'checklist'>('pmsuryaghar');
  const [selectedState, setSelectedState] = useState('UP');

  const activeStateRule = STATE_SUBSIDY_DATABASE.find(s => s.stateCode === selectedState) || STATE_SUBSIDY_DATABASE[0];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div className="space-y-2 max-w-2xl">
          <Badge variant="primary" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Government Regulatory & Scheme Hub
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] tracking-tight">
            Central & State Solar Subsidies, Tax Incentives & Open Access
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Direct Benefit Transfer (DBT) guidelines, PM Surya Ghar slabs, 40% Accelerated Depreciation (AD) tax write-offs, and PM-KUSUM agricultural frameworks.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={onOpenSubsidyChecker}
          className="bg-[var(--color-primary)] font-bold text-xs shrink-0"
          leftIcon={<Sparkles className="w-4 h-4" />}
        >
          Check Your State Subsidy Slab
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'pmsuryaghar', label: 'PM Surya Ghar (Residential)', icon: Sun },
          { id: 'ci_incentives', label: 'C&I 40% AD & Open Access', icon: Building2 },
          { id: 'kusum', label: 'PM-KUSUM (Agricultural)', icon: Droplet },
          { id: 'checklist', label: 'Document Submission Checklist', icon: FileCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border-strong)] hover:border-[#1697C4]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PM SURYA GHAR */}
      {activeTab === 'pmsuryaghar' && (
        <Card className="rounded-3xl border border-[var(--color-border)] p-6 sm:p-8 bg-[var(--color-surface)] shadow-xs space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-1 rounded-md border border-[#D4E8DC]">
                  National Rooftop Solar Portal Slabs 2026
                </span>
                <h3 className="text-2xl font-extrabold text-[var(--color-text)]">
                  PM Surya Ghar: Muft Bijli Yojana
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                  Provides direct capital financial assistance (CFA) into the consumer's bank account within 30 days of net-meter commissioning, along with free monthly electricity generation up to 300 units.
                </p>
              </div>

              {/* National Slabs Grid */}
              <div className="space-y-2.5">
                <div className="text-xs font-mono font-bold uppercase text-[#7A837C]">
                  Central Financial Assistance (CFA) Schedule
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)]">
                    <div className="text-xs text-[var(--color-text-muted)] font-bold">1 kW System</div>
                    <div className="text-xl font-extrabold text-[var(--color-primary)] mt-1">₹30,000</div>
                    <div className="text-[10px] text-[#7A837C] mt-0.5">Direct DBT credit</div>
                  </div>

                  <div className="p-4 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)]">
                    <div className="text-xs text-[var(--color-text-muted)] font-bold">2 kW System</div>
                    <div className="text-xl font-extrabold text-[var(--color-primary)] mt-1">₹60,000</div>
                    <div className="text-[10px] text-[#7A837C] mt-0.5">Flat ₹30k / kW</div>
                  </div>

                  <div className="p-4 bg-[#FAF6EE] rounded-2xl border border-[#C6DEE8]">
                    <div className="text-xs text-[var(--color-brand-brown)] font-bold">3 kW to 10 kW</div>
                    <div className="text-xl font-extrabold text-[#F59E0B] mt-1">₹78,000</div>
                    <div className="text-[10px] text-[var(--color-brand-brown)] mt-0.5">Max Central Cap</div>
                  </div>
                </div>
              </div>

              {/* GHS / RWA Rules */}
              <div className="p-4 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] text-xs space-y-1.5">
                <div className="font-bold text-[var(--color-text)]">Group Housing Societies (GHS) & RWAs:</div>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  Residential housing societies receive <strong>₹18,000 per kW</strong> for common facility meters (elevators, water pumping, clubhouse lighting) up to a maximum aggregated capacity of <strong>500 kW</strong>.
                </p>
              </div>

            </div>

            {/* Right: State Selector & Combined Maximum */}
            <div className="lg:col-span-5 bg-[var(--color-background)] p-6 rounded-2xl border border-[var(--color-border)] space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[var(--color-text)]">Check State Top-Up Addition</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-xs font-semibold focus:outline-hidden"
                >
                  {STATE_SUBSIDY_DATABASE.map(s => (
                    <option key={s.stateCode} value={s.stateCode}>{s.stateName}</option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Central PM Surya (3kW+):</span>
                  <span className="font-bold">₹78,000</span>
                </div>
                <div className="flex justify-between text-[var(--color-primary)] font-bold">
                  <span>{activeStateRule.stateName} State Top-Up:</span>
                  <span>+ ₹{activeStateRule.residentialTopUp2kWPlus.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--color-border)] text-sm font-extrabold text-[#F59E0B]">
                  <span>Combined Maximum Subsidy:</span>
                  <span>₹{(78000 + activeStateRule.residentialTopUp2kWPlus).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="text-[11px] text-[var(--color-text-muted)] bg-[var(--color-primary-subtle)] p-3 rounded-xl border border-[#D4E8DC]">
                {activeStateRule.specialIncentives}
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full justify-center bg-[var(--color-primary)] font-bold text-xs"
                onClick={onOpenQuickQuote}
              >
                Apply for PM Surya Subsidy
              </Button>
            </div>

          </div>
        </Card>
      )}

      {/* TAB 2: C&I 40% ACCELERATED DEPRECIATION & OPEN ACCESS */}
      {activeTab === 'ci_incentives' && (
        <Card className="rounded-3xl border border-[var(--color-border)] p-6 sm:p-8 bg-[var(--color-surface)] shadow-xs space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-brown)] bg-[#EAF4F8] px-2.5 py-1 rounded-md border border-[#C6DEE8]">
              Income Tax Act Section 32 & Green Energy Open Access
            </span>
            <h3 className="text-2xl font-extrabold text-[var(--color-text)]">
              Commercial & Industrial Tax Incentives & Power Procurement
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] max-w-3xl leading-relaxed">
              Industrial facilities and corporate entities can recover up to 40%–50% of their total solar investment within the very first fiscal year through tax shields, lower GST, and open-access tariff arbitrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Accelerated Depreciation */}
            <div className="p-6 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center font-bold">
                <Percent className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[var(--color-text)]">40% Accelerated Depreciation (AD)</h4>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Under Section 32, commercial entities can claim 40% depreciation in Year 1 on solar equipment. Reduces taxable corporate profits substantially in the installation year.
              </p>
              <div className="pt-2 text-[11px] font-bold text-[var(--color-primary)]">
                ✓ Direct 25.17% / 34.94% Corporate Tax Shield
              </div>
            </div>

            {/* 2. Concessional Blended GST */}
            <div className="p-6 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF6EE] text-[var(--color-brand-brown)] flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[var(--color-text)]">Concessional Blended GST (13.8%)</h4>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Turnkey Solar EPC contracts are taxed under a split model: 70% of value as goods @ 12% GST, and 30% of value as services @ 18% GST, creating an effective blended rate of ~13.8%.
              </p>
              <div className="pt-2 text-[11px] font-bold text-[var(--color-brand-brown)]">
                ✓ Full Input Tax Credit (ITC) Eligible for Businesses
              </div>
            </div>

            {/* 3. Green Energy Open Access */}
            <div className="p-6 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-subtle)] text-[#2B7A78] flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[var(--color-text)]">Green Open Access (100 kW Threshold)</h4>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Rules lower the Open Access sanction limit from 1 MW down to 100 kW. SMEs and factories can now buy clean solar power from off-site solar parks with zero cross-subsidy surcharge on captive plants.
              </p>
              <div className="pt-2 text-[11px] font-bold text-[#2B7A78]">
                ✓ Tariffs as low as ₹3.50 – ₹4.20 / unit (vs ₹9-11 Discom)
              </div>
            </div>

          </div>
        </Card>
      )}

      {/* TAB 3: PM-KUSUM SCHEME */}
      {activeTab === 'kusum' && (
        <Card className="rounded-3xl border border-[var(--color-border)] p-6 sm:p-8 bg-[var(--color-surface)] shadow-xs space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-1 rounded-md border border-[#D4E8DC]">
              Ministry of New and Renewable Energy (MNRE)
            </span>
            <h3 className="text-2xl font-extrabold text-[var(--color-text)]">
              PM-KUSUM: Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] max-w-3xl leading-relaxed">
              Transforming agricultural irrigation by replacing polluting diesel pump sets with solar water pumping and enabling farmers to generate clean revenue by solarizing barren farmland.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Component A */}
            <div className="p-5 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] space-y-2.5 text-xs">
              <Badge variant="primary" size="sm">Component-A</Badge>
              <h4 className="text-sm font-bold text-[var(--color-text)]">500 kW to 2 MW Solar Plants on Barren Land</h4>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                Farmers, cooperatives, and panchayats set up decentralized grid-connected solar power plants on barren land within 5 km of 33/11 kV substations. DISCOM buys all power under 25-year PPA.
              </p>
            </div>

            {/* Component B */}
            <div className="p-5 bg-[var(--color-primary-subtle)] rounded-2xl border border-[#D4E8DC] space-y-2.5 text-xs">
              <Badge variant="primary" size="sm">Component-B (Most Popular)</Badge>
              <h4 className="text-sm font-bold text-[var(--color-primary)]">Standalone Solar Water Pumps (3 to 10 HP)</h4>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                Installation of individual standalone solar-powered agriculture pumps (surface or submersible). <strong>Up to 60% combined Central & State subsidy</strong> with farmer contribution of only 10%–40%.
              </p>
            </div>

            {/* Component C */}
            <div className="p-5 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] space-y-2.5 text-xs">
              <Badge variant="primary" size="sm">Component-C</Badge>
              <h4 className="text-sm font-bold text-[var(--color-text)]">Solarization of Grid-Connected Agricultural Pumps</h4>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                Existing grid-connected agriculture pumps are solarized. Farmers can fulfill their daytime irrigation needs and sell excess generated solar electricity back to the DISCOM.
              </p>
            </div>

          </div>
        </Card>
      )}

      {/* TAB 4: DOCUMENT CHECKLIST */}
      {activeTab === 'checklist' && (
        <Card className="rounded-3xl border border-[var(--color-border)] p-6 sm:p-8 bg-[var(--color-surface)] shadow-xs space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-1 rounded-md border border-[#D4E8DC]">
              Single-Window National Portal Submission
            </span>
            <h3 className="text-2xl font-extrabold text-[var(--color-text)]">
              Mandatory Documentation Checklist for Solar Net Metering & Subsidy
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] max-w-3xl leading-relaxed">
              BuildEcoGroup engineering liaison handles all DISCOM feasibility approvals, CEIG safety inspections, and Direct Benefit Transfer (DBT) portal filings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {[
              { title: 'Electricity Discom Bill (Latest 2 Months)', desc: 'Must display active Consumer ID (CA/Account Number), Sanctioned Load (kW/kVA), and tariff category.' },
              { title: 'Aadhar Card / PAN Card of Property Owner', desc: 'Identifies the primary applicant matching the electricity connection records.' },
              { title: 'Cancelled Cheque / Bank Passbook Copy', desc: 'Used by the National PM Surya Ghar Portal for direct deposit of the Central & State CFA subsidy.' },
              { title: 'Proof of Roof / Property Ownership', desc: 'Registry copy, Property Tax Receipt, or Mutation Certificate verifying ownership rights.' },
              { title: 'Site Geo-Tagged Photos & Single Line Diagram (SLD)', desc: 'Prepared by BuildEcoGroup engineers detailing module string layouts, inverter earthing, and SPD protection.' },
              { title: 'Company GSTIN & Certificate of Incorporation (For C&I)', desc: 'Required for claiming 40% Accelerated Depreciation (AD) and input tax credit on turnkey EPC invoice.' },
            ].map((doc, i) => (
              <div key={i} className="p-4 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] space-y-1">
                <div className="flex items-center gap-2 font-bold text-[var(--color-text)]">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                  <span>{doc.title}</span>
                </div>
                <p className="text-[var(--color-text-muted)] text-[11px] leading-relaxed pl-6">{doc.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
};
