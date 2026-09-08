import React, { useState } from 'react';
import { 
  HardHat, 
  FileCheck2, 
  FileSpreadsheet, 
  Users, 
  Truck, 
  Camera, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Compass, 
  DollarSign, 
  KeyRound, 
  Hammer, 
  ClipboardList,
  Sparkles,
  Building2,
  PackageCheck
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ROUTES } from '../../lib/routes';
import { Link } from 'react-router-dom';

interface ConstructionManagementEcosystemProps {
  onOpenIntake: (objective: string, category: string) => void;
}

export const ConstructionManagementEcosystem: React.FC<ConstructionManagementEcosystemProps> = ({
  onOpenIntake,
}) => {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);

  const steps = [
    { num: '01', label: 'Requirement', desc: 'Scope Intake' },
    { num: '02', label: 'Design', desc: 'BIM & Structural Vetting' },
    { num: '03', label: 'BOQ', desc: 'Normalized Cost Matrix' },
    { num: '04', label: 'Team', desc: 'Empaneled Consultants' },
    { num: '05', label: 'Contractor', desc: 'Vetted Execution' },
    { num: '06', label: 'Supplier', desc: 'Direct Brand Sourcing' },
    { num: '07', label: 'Procure', desc: 'Material Mart' },
    { num: '08', label: 'Site Execution', desc: 'DPR & Telemetry' },
    { num: '09', label: 'Quality', desc: 'Snags & Milestone Audits' },
    { num: '10', label: 'Handover', desc: 'As-Builts & AMC' },
  ];

  const modules = [
    {
      id: 'planning_design',
      title: '1. Planning & Design',
      badge: 'Architectural & BIM Coordination',
      icon: Compass,
      headline: 'Vetted architectural, structural, and bioclimatic engineering blueprints.',
      details: [
        'Architectural, Structural, and MEP peer reviews by verified independent consultants.',
        'High-precision 3D BIM coordination to eliminate costly onsite pipe/duct clashes.',
        'Municipal zoning setback and building byelaw adherence check.',
        'Energy efficiency, daylight optimization, and ventilation simulations.',
      ],
      deliverables: ['Peer-Audited Blueprints', 'Clash-Free MEP Models', 'Statutory Clearance Scope', 'Bioclimatic Sun-Path Study'],
    },
    {
      id: 'boq_cost',
      title: '2. BOQ & Cost Engine',
      badge: 'Standardized CPWD Benchmarks',
      icon: FileSpreadsheet,
      headline: 'Normalized Bill of Quantities with unit-level material and labor pricing.',
      details: [
        'Itemized BOQs categorized across 16+ construction disciplines.',
        'Standardized CPWD/IS code rate benchmarks preventing inflated contractor estimates.',
        'Dynamic rate variance modeling for cement, TMT steel, AAC blocks, and finishing.',
        'Zero-margin transparent contractor tender packages.',
      ],
      deliverables: ['Standardized BOQ Schedule', 'Unit Rate Benchmarks', 'Contractor Tender Packages', 'Budget Variance Model'],
    },
    {
      id: 'team_contractors',
      title: '3. Team & Contractors',
      badge: 'Empaneled Specialists',
      icon: Users,
      headline: 'Empanel vetted CoA architects, IEI engineers, and certified contractors.',
      details: [
        'Deconstruct massive contracts into accountable work packages.',
        'Empanel verified contractor teams with audited equipment rosters and safety records.',
        'Skilled trade matching: licensed electricians, plumbers, carpenters, and painters.',
        'Standardized SLA contracts with clear milestone delivery dates.',
      ],
      deliverables: ['Vetted Contractor Roster', 'Skilled Trades Matching', 'Scope Contracts', 'Escrow Milestone Schedules'],
    },
    {
      id: 'procurement',
      title: '4. Procurement & Material Mart',
      badge: '2CLICK Sourcing',
      icon: Truck,
      headline: 'Direct brand factory sourcing for cement, steel, bricks, fixtures, and finishes.',
      details: [
        'Direct factory purchase orders (PO) with wholesale pricing passed directly to client.',
        'Strict batch testing: compressive cube strength, tensile steel tests, and ISI certs.',
        'Transparent delivery logs with digital weighbridge verification.',
        'Zero counterfeit material guarantee with tamper-proof delivery tracking.',
      ],
      deliverables: ['Material Mart POs', 'Batch Test Certificates', 'Weighbridge Receipts', 'Direct Brand Warranties'],
    },
    {
      id: 'site_management',
      title: '5. Site Management & Controls',
      badge: 'Live DPR & Telemetry',
      icon: HardHat,
      headline: 'Daily progress logs, stage inspections, and live CCTV site surveillance.',
      details: [
        'Daily Progress Reports (DPR) with verified photos, labor count, and weather impact logs.',
        'Structured RFI (Request for Information) lifecycle: Draft → Submit → Review → Response → Close.',
        'Milestone escrow releases only upon independent physical engineer verification.',
        'Stage-wise snag listing with geotagged photo evidence and verified contractor rectification.',
      ],
      deliverables: ['Daily Progress Reports (DPR)', 'Digital RFI Desk', 'Milestone Escrow Signoffs', 'Snag Resolution Log'],
    },
    {
      id: 'handover_maintenance',
      title: '6. Handover & Maintenance',
      badge: 'Asset Lifecycle & AMC',
      icon: KeyRound,
      headline: 'Permanent digital asset vault and scheduled annual maintenance contracts.',
      details: [
        'Permanent digital vault of As-Built drawings, MEP schematics, and occupancy certifications.',
        'Manufacturer warranty repository for elevators, transformers, solar inverters, and pumps.',
        'Comprehensive asset register with serial numbers and preventive maintenance schedules.',
        'Annual Maintenance Contract (AMC) benchmarking for water treatment, solar, and HVAC.',
      ],
      deliverables: ['As-Built Drawing Vault', 'Warranty Repository', 'Facility Asset Register', 'Preventive AMC Calendar'],
    },
  ];

  return (
    <section id="construction-management" className="py-16 sm:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)] scroll-mt-20">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2">
            <Badge variant="primary" size="md" icon={<HardHat className="w-3.5 h-3.5" />}>
              Flagship Engine 02
            </Badge>
            <span className="text-xs font-bold text-[var(--color-brand-brown)] uppercase tracking-wider">
              Construction Management Ecosystem
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] tracking-tight">
            Plan. Estimate. Build. Track. <br />
            <span className="text-[var(--color-primary)]">Enterprise Control for Every Project Stage.</span>
          </h2>

          <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
            BuildEcoGroup coordinates requirements, architectural vetting, itemized BOQs, verified teams, procurement, site supervision, and post-handover operations through one connected platform.
          </p>

          <div className="pt-2">
            <Link to={ROUTES.CONSTRUCTION_MANAGEMENT}>
              <Button
                variant="primary"
                size="md"
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-xs font-bold"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Start Construction Project
              </Button>
            </Link>
          </div>
        </div>

        {/* 10-Step Project Progression Flow */}
        <div className="bg-[var(--color-background)] p-6 rounded-2xl border border-[var(--color-border)] space-y-4">
          <div className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider text-center sm:text-left">
            Connected 10-Stage Lifecycle Flow
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
            {steps.map((step, idx) => (
              <div
                key={step.num}
                className="bg-[var(--color-surface)] p-2.5 rounded-xl border border-[var(--color-border)] flex flex-col justify-between gap-1.5 text-left relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[var(--color-primary)]">{step.num}</span>
                </div>
                <div>
                  <div className="font-bold text-[11px] text-[var(--color-text)] truncate">{step.label}</div>
                  <div className="text-[9px] text-[var(--color-text-muted)] truncate">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6 Enterprise Control Modules Tabs */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-[var(--color-brand-brown)] uppercase tracking-wider">Enterprise Controls</div>
              <h3 className="text-2xl font-extrabold text-[var(--color-text)]">
                6 Core Pillars of Construction Management
              </h3>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenIntake('Construction Management Case Intake', 'Construction Services')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Consult on Construction
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Nav List */}
            <div className="lg:col-span-4 space-y-2">
              {modules.map((mod, idx) => {
                const Icon = mod.icon;
                const isActive = activeModuleIndex === idx;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModuleIndex(idx)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md'
                        : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-background)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-[var(--color-surface)]/20 text-white' : 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{mod.title}</div>
                        <div className={`text-[10px] ${isActive ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
                          {mod.badge}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[var(--color-text-muted)]'}`} />
                  </button>
                );
              })}
            </div>

            {/* Right Active Module Card */}
            <div className="lg:col-span-8 bg-[var(--color-background)] p-6 sm:p-8 rounded-2xl border border-[var(--color-border)] space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--color-border)]">
                <div>
                  <Badge variant="primary" size="md">
                    {modules[activeModuleIndex].badge}
                  </Badge>
                  <h4 className="text-xl font-bold text-[var(--color-text)] mt-2">
                    {modules[activeModuleIndex].title}
                  </h4>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onOpenIntake(modules[activeModuleIndex].title, 'Construction Management')}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Inquire on this Pillar
                </Button>
              </div>

              <p className="text-sm font-medium text-[var(--color-text)] leading-relaxed">
                {modules[activeModuleIndex].headline}
              </p>

              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Key Features & Capabilities:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--color-text-secondary)]">
                  {modules[activeModuleIndex].details.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-border)]">
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Standard Deliverables */}
              <div className="pt-4 border-t border-[var(--color-border)]">
                <div className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider mb-2">
                  System Deliverables Generated:
                </div>
                <div className="flex flex-wrap gap-2">
                  {modules[activeModuleIndex].deliverables.map((del, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] text-xs font-semibold text-[var(--color-primary)] flex items-center gap-1.5"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-[var(--color-brand-brown)]" />
                      {del}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
