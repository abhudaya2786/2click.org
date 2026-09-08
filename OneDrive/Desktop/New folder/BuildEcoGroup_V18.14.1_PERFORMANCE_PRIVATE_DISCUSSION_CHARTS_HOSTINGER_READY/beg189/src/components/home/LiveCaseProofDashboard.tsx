import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  FileSpreadsheet, 
  Users, 
  HardHat, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Camera,
  Activity,
  FileCheck,
  TrendingUp,
  ExternalLink,
  Zap,
  MapPin,
  Compass,
  AlertTriangle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface LiveCaseProofDashboardProps {
  onOpenIntake: (objective: string, category: string) => void;
}

export const LiveCaseProofDashboard: React.FC<LiveCaseProofDashboardProps> = ({ onOpenIntake }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'feasibility' | 'boq' | 'rfqs' | 'milestones'>('overview');

  return (
    <section className="py-12 sm:py-16 bg-[var(--color-surface)] border-y border-[var(--color-border)]">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2">
              <Badge variant="primary" size="sm" icon={<Activity className="w-3.5 h-3.5" />}>
                Live Product Proof
              </Badge>
              <span className="text-xs font-mono text-[var(--color-brand-brown)] font-bold">
                AUDITABLE CASE #BEG-2026-001
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] tracking-tight">
              Inside the BuildEco Engine: Real Case Transparency
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] max-w-2xl">
              See how a single project requirement translates into live GIS feasibility, normalized BOQ line-items, competitive expert RFQs, and escrow-governed construction milestones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => onOpenIntake('Create My Project Case ID', 'Custom Project Dashboard')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Generate My Case ID
            </Button>
          </div>
        </div>

        {/* The Live Interactive Dashboard Container */}
        <div className="bg-[#0E192D] text-white rounded-2xl border border-[#233554] shadow-xl overflow-hidden">
          
          {/* Top Bar: Case ID & Meta Header */}
          <div className="p-4 sm:p-6 bg-[#13223D] border-b border-[#233554] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-base shadow-sm">
                BEG
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#F59E0B]">CASE #BEG-2026-001</span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary)]/70 text-[#7ED0E8] text-[10px] font-bold uppercase tracking-wider">
                    Execution Phase • Milestone 2 of 5
                  </span>
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                  <span>Eco-Villa & Solar Estate (4,200 sq ft)</span>
                  <span className="text-xs text-[#94A3B8] font-normal flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#F59E0B]" />
                    Shaheed Path, Lucknow, UP
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-[#1A2D4C] px-3 py-2 rounded-lg border border-[#2D446B]">
                <div className="text-[#94A3B8] text-[10px] uppercase font-bold">Land Feasibility</div>
                <div className="text-[#7ED0E8] font-bold text-sm">82 / 100 (Optimal)</div>
              </div>
              <div className="bg-[#1A2D4C] px-3 py-2 rounded-lg border border-[#2D446B]">
                <div className="text-[#94A3B8] text-[10px] uppercase font-bold">Normalized BOQ</div>
                <div className="text-[#F59E0B] font-bold text-sm">₹42.8 Lakhs</div>
              </div>
              <div className="bg-[#1A2D4C] px-3 py-2 rounded-lg border border-[#2D446B]">
                <div className="text-[#94A3B8] text-[10px] uppercase font-bold">Shortlisted Team</div>
                <div className="text-white font-bold text-sm">4 Experts • 6 RFQs</div>
              </div>
              <div className="bg-[#1A2D4C] px-3 py-2 rounded-lg border border-[#2D446B]">
                <div className="text-[#94A3B8] text-[10px] uppercase font-bold">Verified Progress</div>
                <div className="text-[#38BDF8] font-bold text-sm">38% Completed</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-[#233554] bg-[#0F1B30] overflow-x-auto text-xs font-semibold">
            {[
              { id: 'overview', label: '1. Executive Overview', icon: <Activity className="w-3.5 h-3.5" /> },
              { id: 'feasibility', label: '2. Land Feasibility & GIS', icon: <Compass className="w-3.5 h-3.5" /> },
              { id: 'boq', label: '3. Parametric Normalized BOQ', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
              { id: 'rfqs', label: '4. Expert Team & Contractor RFQs', icon: <Users className="w-3.5 h-3.5" /> },
              { id: 'milestones', label: '5. Site Milestones & Escrow QA', icon: <HardHat className="w-3.5 h-3.5" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-[var(--color-primary-light)] text-white bg-[var(--color-brand-navy-panel)]'
                    : 'border-transparent text-[#94A3B8] hover:text-white hover:bg-[#13223D]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Dashboard Tab Content Body */}
          <div className="p-5 sm:p-7">
            
            {/* TAB 1: EXECUTIVE OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Col: Lifecycle Stage Tracker */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                      Connected Lifecycle Stage Execution:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      
                      <div className="p-3.5 rounded-xl bg-[#14243E] border border-[#233B63] space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#7ED0E8] font-bold">Stage 1: Land Feasibility</span>
                          <CheckCircle2 className="w-4 h-4 text-[#7ED0E8]" />
                        </div>
                        <p className="text-[11px] text-[#94A3B8]">
                          LDA Master Plan 2031 verified. Safe bearing capacity 140 kN/m². Zero waterlogging zone.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#14243E] border border-[#233B63] space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#7ED0E8] font-bold">Stage 2: BOQ & Peer Review</span>
                          <CheckCircle2 className="w-4 h-4 text-[#7ED0E8]" />
                        </div>
                        <p className="text-[11px] text-[#94A3B8]">
                          IS 1893:2016 Zone III seismic check passed. CPWD rate normalization saved ₹9.6 Lakhs.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#1B3256] border border-[#F59E0B] space-y-1.5 ring-1 ring-[#F59E0B]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#F59E0B] font-bold">Stage 3: Active Construction</span>
                          <span className="text-[10px] font-mono bg-[#F59E0B]/20 text-[#F59E0B] px-1.5 py-0.5 rounded font-bold">LIVE</span>
                        </div>
                        <p className="text-[11px] text-[#CBD5E1]">
                          Plinth beam & waterproofing verified. 28-Day concrete cube strength: 29.4 N/mm².
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Live Telemetry & Camera Box */}
                  <div className="p-4 rounded-xl bg-[#13223D] border border-[#233554] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <Camera className="w-4 h-4 text-[#38BDF8]" />
                        <span>Live Site QA Telemetry & Verified Test Reports</span>
                      </div>
                      <span className="text-[10px] text-[#7ED0E8] font-mono flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#7ED0E8] animate-pulse"></span>
                        CCTV FEED ACTIVE
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#CBD5E1]">
                      <div className="p-3 rounded-lg bg-[#0E192D] border border-[#233554] space-y-1">
                        <span className="text-[#94A3B8] text-[10px] uppercase font-bold block">Geotechnical Compaction</span>
                        <div className="text-white font-medium">98.2% Standard Proctor Density (Lab Cert #GT-2026-881)</div>
                      </div>
                      <div className="p-3 rounded-lg bg-[#0E192D] border border-[#233554] space-y-1">
                        <span className="text-[#94A3B8] text-[10px] uppercase font-bold block">Solar Roof Sizing</span>
                        <div className="text-white font-medium">8.4 kW On-Grid System • 34 Units/Day Est. • UP Subsidy Approved</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Col: Escrow Milestone Balance */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="p-4 rounded-xl bg-[#14243E] border border-[#233B63] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#233554] pb-2">
                      <span className="text-xs font-bold text-white">Escrow Trust Ledger</span>
                      <ShieldCheck className="w-4 h-4 text-[#7ED0E8]" />
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-[#94A3B8]">
                        <span>Total Project Escrow:</span>
                        <span className="text-white font-mono font-bold">₹42,80,000</span>
                      </div>
                      <div className="flex justify-between text-[#94A3B8]">
                        <span>Disbursed (Milestone 1):</span>
                        <span className="text-[#7ED0E8] font-mono font-bold">₹8,56,000</span>
                      </div>
                      <div className="flex justify-between text-[#94A3B8]">
                        <span>Guarded in Escrow:</span>
                        <span className="text-[#F59E0B] font-mono font-bold">₹34,24,000</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#233554] text-[11px] text-[#94A3B8] leading-relaxed">
                      Consultants and civil contractors are paid strictly upon third-party structural audit verification. Zero upfront leakage.
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenIntake('BOQ & Construction Feasibility Audit', 'Detailed Consultation')}
                    className="w-full py-2.5 px-3 rounded-xl bg-[var(--color-primary)] hover:bg-[#008F4C] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <span>Request Audit for Your Plot / House</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            )}

            {/* TAB 2: LAND FEASIBILITY & GIS */}
            {activeTab === 'feasibility' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#14243E] border border-[#233554] space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#F59E0B]">Legal & Title Status</span>
                    <div className="text-sm font-bold text-white">100% Freehold Clear</div>
                    <p className="text-xs text-[#94A3B8]">30-year non-encumbrance certificate verified from Lucknow Sub-Registrar.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#14243E] border border-[#233554] space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#7ED0E8]">Municipal Setbacks</span>
                    <div className="text-sm font-bold text-white">LDA Bye-Laws 2026</div>
                    <p className="text-xs text-[#94A3B8]">Front: 4.5m, Rear: 3.0m, Ground Coverage: 65% with FAR 1.75 compliant.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#14243E] border border-[#233554] space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#38BDF8]">Hydrology & Soil</span>
                    <div className="text-sm font-bold text-white">Silty Clay (N=16)</div>
                    <p className="text-xs text-[#94A3B8]">Groundwater at 7.2m. Isolated column footings recommended with M25 grade.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#13223D] border border-[#233554] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#F59E0B]" />
                    <span className="text-[#CBD5E1]">Full 8-Parameter Feasibility Report (18 Pages PDF) generated in 48 Hours.</span>
                  </div>
                  <button
                    onClick={() => onOpenIntake('Land Feasibility Report Inquiry', 'Land to Project')}
                    className="text-[#7ED0E8] font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Order Feasibility for My Land</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: PARAMETRIC BOQ */}
            {activeTab === 'boq' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#233554] text-[#94A3B8] uppercase text-[10px]">
                        <th className="pb-2">Trade / Package</th>
                        <th className="pb-2">Material Specification</th>
                        <th className="pb-2">Quantity</th>
                        <th className="pb-2">Normalized Rate</th>
                        <th className="pb-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#233554] text-[#CBD5E1]">
                      <tr>
                        <td className="py-2.5 font-bold text-white">Substructure & Civil</td>
                        <td>M25 RMC Concrete + Fe550D TMT Rebar</td>
                        <td>4,200 sq ft</td>
                        <td>₹1,450 / sq ft</td>
                        <td className="py-2.5 text-right font-mono font-bold text-white">₹18,27,000</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-white">Masonry & AAC Walls</td>
                        <td>High-Insulation AAC Blocks (200mm)</td>
                        <td>8,600 sq ft</td>
                        <td>₹58 / sq ft</td>
                        <td className="py-2.5 text-right font-mono font-bold text-white">₹4,98,800</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-white">Solar PV Microgrid</td>
                        <td>Tier-1 Bifacial Solar Panels (8.4 kW)</td>
                        <td>1 System</td>
                        <td>₹4,20,000</td>
                        <td className="py-2.5 text-right font-mono font-bold text-white">₹4,20,000</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-white">Rainwater & STP</td>
                        <td>15,000L Modular Filtration Tank</td>
                        <td>1 Unit</td>
                        <td>₹2,80,000</td>
                        <td className="py-2.5 text-right font-mono font-bold text-white">₹2,80,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3.5 rounded-xl bg-[#162744] border border-[#2D446B] flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">Total Estimated Normalized Package (Turnkey with Structural Audit):</span>
                  <span className="text-base font-mono font-extrabold text-[#F59E0B]">₹42,80,000</span>
                </div>
              </div>
            )}

            {/* TAB 4: EXPERT TEAM & RFQS */}
            {activeTab === 'rfqs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#14243E] border border-[#233554] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Lead Structural Peer Reviewer</span>
                    <Badge variant="primary" size="sm">Empaneled</Badge>
                  </div>
                  <div className="text-xs text-[#CBD5E1]">Er. Arvind Verma (M.Tech IIT Roorkee, IEI Chartered)</div>
                  <div className="text-[11px] text-[#94A3B8]">Review: STAAD Pro seismic modeling complete. Safety Factor 1.65.</div>
                </div>

                <div className="p-4 rounded-xl bg-[#14243E] border border-[#233554] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Bioclimatic Architect</span>
                    <Badge variant="primary" size="sm">CoA Registered</Badge>
                  </div>
                  <div className="text-xs text-[#CBD5E1]">Ar. Sneha Roy (14 Yrs Experience • IGBC Fellow)</div>
                  <div className="text-[11px] text-[#94A3B8]">Passive solar orientation reduces AC thermal load by 32%.</div>
                </div>
              </div>
            )}

            {/* TAB 5: MILESTONES & ESCROW QA */}
            {activeTab === 'milestones' && (
              <div className="space-y-3">
                {[
                  { step: '1', title: 'Site Mobilization & Excavation Inspection', status: 'Completed', date: '14 Feb 2026', cert: 'Soil Plate Bearing Test #GT-881' },
                  { step: '2', title: 'Plinth Beam & Anti-Termite Injection', status: 'Completed', date: '28 Feb 2026', cert: 'Concrete 28-Day Strength 29.4 MPa' },
                  { step: '3', title: 'Ground Floor Slab & Column Pour', status: 'In Progress (Escrow Locked)', date: '15 Mar 2026', cert: 'Rebar Spacing & Cover Block QA' },
                  { step: '4', title: 'Roof Slab & Solar Microgrid Mounting', status: 'Upcoming', date: '10 Apr 2026', cert: 'Structural Integrity & Net Metering' },
                  { step: '5', title: 'Final Snagging & Digital Passport Handover', status: 'Upcoming', date: '30 May 2026', cert: 'Asset Handover Certificate' },
                ].map(m => (
                  <div key={m.step} className="p-3 rounded-xl bg-[#14243E] border border-[#233554] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#1A2D4C] text-[#F59E0B] font-bold flex items-center justify-center font-mono text-[11px]">
                        {m.step}
                      </div>
                      <div>
                        <div className="font-bold text-white">{m.title}</div>
                        <div className="text-[10px] text-[#94A3B8]">{m.cert}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.status.includes('Completed') ? 'bg-[var(--color-primary)] text-[#7ED0E8]' :
                        m.status.includes('In Progress') ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
                        'bg-[#233554] text-[#94A3B8]'
                      }`}>
                        {m.status}
                      </span>
                      <div className="text-[10px] text-[#94A3B8] mt-0.5">{m.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
