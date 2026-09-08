import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Layers, 
  FileCheck2, 
  TrendingUp, 
  Users, 
  Building, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Briefcase,
  HardHat,
  Landmark,
  FileSpreadsheet,
  Globe2,
  PieChart,
  Hammer,
  KeyRound
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ROUTES } from '../../lib/routes';
import { Link } from 'react-router-dom';

interface LandDevelopmentEngineProps {
  onOpenIntake: (objective: string, category: string) => void;
}

export const LandDevelopmentEngine: React.FC<LandDevelopmentEngineProps> = ({ onOpenIntake }) => {
  const [selectedIntent, setSelectedIntent] = useState<'OWN_LAND' | 'NEED_LAND' | 'DEVELOP' | 'NEED_INVESTOR' | 'WANT_JV' | 'WANT_LEASE'>('OWN_LAND');
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const intents = [
    { id: 'OWN_LAND', label: 'I Own Land', icon: Landmark, subtitle: 'Feasibility & Development Options' },
    { id: 'NEED_LAND', label: 'I Need Land', icon: MapPin, subtitle: 'Zoned & Clear-Title Parcels' },
    { id: 'DEVELOP', label: 'I Want to Develop', icon: Building, subtitle: 'Concept to Turnkey Delivery' },
    { id: 'WANT_JV', label: 'I Want JV / Partnership', icon: Users, subtitle: 'Equitable Joint Ventures' },
    { id: 'NEED_INVESTOR', label: 'I Need Investor / Capital', icon: TrendingUp, subtitle: 'Structured Revenue Share' },
    { id: 'WANT_LEASE', label: 'I Want to Lease / Manage', icon: KeyRound, subtitle: 'Long-Term Yield Monetization' },
  ] as const;

  const stages = [
    {
      step: '01',
      title: 'Own Land / Ingestion',
      badge: 'GIS & Title Verification',
      desc: 'Cadastral boundary mapping, satellite coordinates, zoning classification, and title encumbrance screening.',
      deliverables: ['Cadastral Overlay', 'Master Plan Zoning Check', 'Title Audit Scope', 'Road Width & Access Validation'],
      icon: MapPin,
    },
    {
      step: '02',
      title: 'Feasibility & Hydrogeology',
      badge: 'Technical Due Diligence',
      desc: 'Topographic contour analysis, flood plain risk mapping, soil bearing capacity (SBC), and water table testing.',
      deliverables: ['LiDAR Topography Model', 'Soil Stability Report', 'Aquifer & Hydrogeology Vetting', 'Environmental Constraints'],
      icon: Compass,
    },
    {
      step: '03',
      title: 'Best Use Optimization',
      badge: 'FSI & Yield Modeling',
      desc: 'Evaluate maximum FSI/FAR potential across Residential, Commercial, Mixed-Use, Eco-Resort, and Industrial uses.',
      deliverables: ['FSI / Setback Feasibility', 'Revenue Yield Projections', 'Market Absorption Analytics', 'Master Concept Options'],
      icon: PieChart,
    },
    {
      step: '04',
      title: 'Development Model Selection',
      badge: 'Commercial Structuring',
      desc: 'Select optimal governance: Self-Development, Joint Venture (JV), Revenue Share, Builder Partnership, or DM.',
      deliverables: ['JV Ratio Simulation', 'DM Framework Agreement', 'Risk-Reward Allocation', 'Cash-Flow Milestone Model'],
      icon: Briefcase,
    },
    {
      step: '05',
      title: 'Expert Empanelment',
      badge: 'Multi-Discipline Team',
      desc: 'Match and empanel independent structural engineers, bioclimatic architects, MEP directors, and legal advisors.',
      deliverables: ['Vetted Architect Roster', 'Structural Peer Reviewer', 'Statutory Clearance Desk', 'Standardized Scope Contracts'],
      icon: Users,
    },
    {
      step: '06',
      title: 'Standardized BOQ & Tender',
      badge: 'Transparent Costing',
      desc: 'Item-by-item Bill of Quantities (BOQ), rate normalization, material grade specs, and competitive contractor bidding.',
      deliverables: ['Normalized BOQ Matrix', 'Material Quality Specs', 'Tender Package RFQ', 'Zero-Margin Vendor Comparison'],
      icon: FileSpreadsheet,
    },
    {
      step: '07',
      title: 'Execution & Site Oversight',
      badge: 'Milestone Delivery',
      desc: 'Discrete work packages, daily progress logs (DPR), site drone photogrammetry, and independent quality inspections.',
      deliverables: ['Daily Progress Reports', 'Drone Time-Lapse Audits', 'Milestone Escrow Signoffs', 'Structural Safety Certifications'],
      icon: Hammer,
    },
    {
      step: '08',
      title: 'Handover & Monetization',
      badge: 'Asset Lifecycle',
      desc: 'Facility commissioning, tenant leasing, property sales coordination, and long-term asset management.',
      deliverables: ['As-Built Vault', 'Asset Register & AMC Plans', 'Lease / Sales Desk', 'Ongoing Facility Monitoring'],
      icon: KeyRound,
    },
  ];

  const developmentModels = [
    {
      title: 'Self Development',
      badge: 'Full Equity Retention',
      description: 'Retain 100% ownership while BuildEcoGroup orchestrates architects, BOQ, verified contractors, and site supervision.',
      suitedFor: 'Landowners with capital seeking maximum development profit.',
    },
    {
      title: 'Joint Venture (JV)',
      badge: 'Shared Equity & Risk',
      description: 'Structured area-sharing or revenue-sharing joint ventures with vetted, high-reputation builders and grade-A contractors.',
      suitedFor: 'Landowners seeking zero out-of-pocket construction cost.',
    },
    {
      title: 'Revenue Share',
      badge: 'Cash-Flow Distribution',
      description: 'Top-line sales revenue sharing with clear escrow triggers, transparent booking registers, and audited payouts.',
      suitedFor: 'Commercial and residential plotted developments.',
    },
    {
      title: 'Builder Partnership',
      badge: 'Turnkey Contract Execution',
      description: 'Transparent fixed-price or cost-plus construction with independent milestone quality audits and zero bias.',
      suitedFor: 'High-end villas, institutions, and eco-resorts.',
    },
    {
      title: 'Development Management (DM)',
      badge: 'Professional Asset Advisory',
      description: 'End-to-end master planning, brand empanelment, statutory permissions, sales marketing, and construction oversight on a fixed fee model.',
      suitedFor: 'Large land parcels and family estates.',
    },
  ];

  return (
    <section id="land-to-project" className="py-16 sm:py-24 bg-[var(--color-background)] border-b border-[var(--color-border)] scroll-mt-20">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2">
            <Badge variant="primary" size="md" icon={<Landmark className="w-3.5 h-3.5" />}>
              Flagship Engine 01
            </Badge>
            <span className="text-xs font-bold text-[var(--color-brand-brown)] uppercase tracking-wider">
              Land-to-Project Lifecycle
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] tracking-tight">
            Turn Your Land Into a Project. <br />
            <span className="text-[var(--color-primary)]">Unlock the Maximum Value of Your Land.</span>
          </h2>
          
          <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
            Whether you own ancestral land, require a zoned development parcel, or seek an equitable Joint Venture (JV), BuildEcoGroup provides connected feasibility, statutory clarity, professional empanelment, and execution governance.
          </p>
        </div>

        {/* 1. Interactive Intent Selector */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] text-center">
            Select Your Land Objective
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {intents.map((intent) => {
              const Icon = intent.icon;
              const isSelected = selectedIntent === intent.id;
              return (
                <button
                  key={intent.id}
                  onClick={() => setSelectedIntent(intent.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md ring-2 ring-[var(--color-primary-border)]'
                      : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-muted)]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-[var(--color-surface)]/20 text-white' : 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs">{intent.label}</div>
                    <div className={`text-[10px] mt-0.5 line-clamp-1 ${
                      isSelected ? 'text-white/70' : 'text-[var(--color-text-muted)]'
                    }`}>
                      {intent.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Flagship 8-Step Interactive Roadmap */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 sm:p-8 shadow-xs space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
            <div>
              <div className="text-xs font-bold text-[var(--color-brand-brown)] uppercase tracking-wider">The Standardized Protocol</div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--color-text)]">
                Own Land → Feasibility → Best Use → Development Model → Experts → BOQ → Build → Monetize
              </h3>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => onOpenIntake(`Land Development: ${selectedIntent}`, 'Land to Project')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Feasibility Study
            </Button>
          </div>

          {/* Stepper Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {stages.map((stage, idx) => {
              const isActive = activeStageIndex === idx;
              return (
                <button
                  key={stage.step}
                  onClick={() => setActiveStageIndex(idx)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-xs'
                      : 'bg-[var(--color-background)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold ${
                      isActive ? 'text-white/70' : 'text-[var(--color-brand-brown)]'
                    }`}>
                      {stage.step}
                    </span>
                    <stage.icon className="w-3.5 h-3.5 opacity-80" />
                  </div>
                  <div className="text-xs font-bold leading-tight line-clamp-2">
                    {stage.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Stage Detailed View */}
          <div className="p-6 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-1 rounded-lg">
                  STAGE {stages[activeStageIndex].step} OF 08
                </span>
                <Badge variant="brown" size="sm">
                  {stages[activeStageIndex].badge}
                </Badge>
              </div>

              <h4 className="text-xl font-bold text-[var(--color-text)]">
                {stages[activeStageIndex].title}
              </h4>

              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                {stages[activeStageIndex].desc}
              </p>

              <div className="pt-2">
                <div className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider mb-2">
                  Key Orchestrated Deliverables:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--color-text-secondary)]">
                  {stages[activeStageIndex].deliverables.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-[var(--color-surface)] p-2 rounded-lg border border-[var(--color-border)]">
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[var(--color-surface)] p-5 rounded-xl border border-[var(--color-border)] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--color-text)]">Platform Assurance</div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">Neutral technical governance</div>
                </div>
              </div>

              <div className="text-xs text-[var(--color-text-muted)] space-y-2 border-t border-[var(--color-border)] pt-3">
                <p>
                  BuildEcoGroup does not take broker commissions or push developer quotas. You receive uncompromised engineering audits and competitive bid matrices.
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => onOpenIntake(`Stage ${stages[activeStageIndex].step}: ${stages[activeStageIndex].title}`, 'Land to Project')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Inquire About Stage {stages[activeStageIndex].step}
              </Button>
            </div>
          </div>
        </div>

        {/* 3. Develop Your Land: 5 Structured Development Models */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-[var(--color-brand-brown)] uppercase tracking-wider">Strategic Structuring</div>
              <h3 className="text-2xl font-extrabold text-[var(--color-text)]">
                Develop Your Land: Structured Models
              </h3>
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">
              Tailored governance frameworks for individual, corporate & family land parcels
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {developmentModels.map((model, idx) => (
              <div
                key={model.title}
                className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 flex flex-col justify-between hover:shadow-md transition-shadow duration-200 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[var(--color-brand-brown)]">MODEL 0{idx + 1}</span>
                    <Badge variant="primary" size="sm">
                      {model.badge}
                    </Badge>
                  </div>
                  <h4 className="text-base font-bold text-[var(--color-text)]">{model.title}</h4>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{model.description}</p>
                </div>

                <div className="pt-3 border-t border-[var(--color-border)] space-y-3">
                  <div className="text-[11px] text-[var(--color-text-muted)]">
                    <span className="font-bold text-[var(--color-text)]">Ideal for: </span>
                    {model.suitedFor}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => onOpenIntake(`Development Model: ${model.title}`, 'Land to Project')}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Structure {model.title}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
