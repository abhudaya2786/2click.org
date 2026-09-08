import React, { useState } from 'react';
import { 
  HardHat, 
  ShieldCheck, 
  Camera, 
  FileSpreadsheet, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  Clock, 
  AlertTriangle,
  Building2,
  Lock,
  Cpu,
  FileCheck,
  Zap,
  Users,
  Compass,
  CheckCircle,
  Eye,
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { UniversalCaseIntakeModal } from '../components/common/UniversalCaseIntakeModal';
import { GrihaNirmanSuperApp } from '../components/construction/GrihaNirmanSuperApp';
import { getMediaAsset } from '../lib/mediaAssets';
import { ResponsiveMedia, PageHeroMedia } from '../components/ui/ResponsiveMedia';

export const ConstructionManagementPage: React.FC = () => {
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [modalObjective, setModalObjective] = useState('Construction Project Governance & Supervision');
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);

  const handleOpenIntake = (objective: string) => {
    setModalObjective(objective);
    setIsIntakeOpen(true);
  };

  const constructionStages = [
    {
      id: 'planning',
      stageNum: '01',
      title: 'Planning & Design Detailing',
      assetKey: 'const_stage_1_planning',
      subheading: 'Architectural, Structural STAAD & Vastu Harmonization',
      standards: 'IS 456:2000 & IS 1893:2016 (Seismic Zone III)',
      checkpoints: [
        '3D BIM structural clash detection and load path analysis',
        'Vastu-compliant spatial planning without compromising column grid symmetry',
        'Municipal LDA / GDA sanctioned floor plan synchronization',
        'Normalized CPWD DSR Bill of Quantities (BOQ) with rebar schedules'
      ]
    },
    {
      id: 'foundation',
      stageNum: '02',
      title: 'Soil Excavation & Foundation',
      assetKey: 'const_stage_2_foundation',
      subheading: 'Earthwork, Anti-Termite & Footing Reinforcement',
      standards: 'IS 1892 & IS 6313 (Anti-Termite Treatment)',
      checkpoints: [
        'Geotechnical SPT N-value verification at planned footing depth',
        'Anti-termite chlorpyrifos emulsion spray along foundation trenches',
        'PCC (1:4:8) leveling course and high-grade cover blocks (50mm)',
        'Fe550D rebar cage placement and column starter positioning'
      ]
    },
    {
      id: 'structure',
      stageNum: '03',
      title: 'RCC Frame & Slab Casting',
      assetKey: 'const_stage_3_structure',
      subheading: 'Columns, Beams, Shuttering & Ready-Mix Concreting',
      standards: 'IS 10262 (Mix Design) & IS 13920 (Ductility)',
      checkpoints: [
        'Waterproof film-faced ply shuttering with adjustable steel props',
        'M25 grade ready-mix concrete pouring with calibrated needle vibrators',
        'Mandatory 6-cube sampling for 7-day and 28-day laboratory compression tests',
        'Continuous 14-day ponding/hessian curing protocol enforcement'
      ]
    },
    {
      id: 'masonry',
      stageNum: '04',
      title: 'AAC Block & Brick Masonry',
      assetKey: 'const_stage_4_masonry',
      subheading: 'Thermal Insulation & Crack-Resistant Lintel Bands',
      standards: 'IS 2185 (Part 3) & IS 1905',
      checkpoints: [
        'Class-1 AAC lightweight blocks with polymer thin-bed adhesive jointing',
        'Continuous RCC lintel bands at door/window height to resist thermal shear',
        'GI chicken wire mesh embedding at RCC-to-masonry junctions before plaster',
        'Precision spirit-level plumb line check for true perpendicular walls'
      ]
    },
    {
      id: 'mep',
      stageNum: '05',
      title: 'Concealed MEP Infrastructure',
      assetKey: 'const_stage_5_mep',
      subheading: 'Electrical Conduits, CPVC Plumbing & HVAC Rough-ins',
      standards: 'IS 732 (Electrical Wiring) & IS 2065 (Plumbing)',
      checkpoints: [
        'Heavy-gauge FRLS copper wiring laid inside virgin PVC wall conduits',
        'Hydrostatic pressure testing of CPVC water supply at 10 kg/cm² for 24 hours',
        'Dual-pipe drainage separation for greywater and blackwater sewage',
        'Dedicated copper earthing pits with chemical backfill compound'
      ]
    },
    {
      id: 'finishing',
      stageNum: '06',
      title: 'Finishing & Vitrified Tiling',
      assetKey: 'const_stage_6_finishing',
      subheading: 'Large-Format GVT Flooring, Plaster Punning & Paint',
      standards: 'IS 13630 (Vitrified Tiles) & IS 5410',
      checkpoints: [
        'Gypsum plaster wall punning for glass-smooth zero-undulation surfaces',
        'Large-format 1200x600mm glazed vitrified tiles laid with leveling clips',
        'Two coats of anti-efflorescence alkali-resistant primer and low-VOC acrylic paint',
        'Waterproof polyurethane membrane coating on wet areas (bathrooms & balconies)'
      ]
    },
    {
      id: 'interior',
      stageNum: '07',
      title: 'Modular Interiors & Joinery',
      assetKey: 'const_stage_7_interior',
      subheading: 'Modular Kitchen, Wardrobes & Cove False Ceilings',
      standards: 'IS 710 (BWP Marine Plywood)',
      checkpoints: [
        'Calibrated IS 710 boiling waterproof (BWP) ply carcasses with laminate pressing',
        'Soft-close telescopic hardware with 10-year functional warranty',
        'Moisture-resistant gypsum false ceilings with warm indirect LED cove channels',
        'Factory-finished modular joinery installed with zero on-site sawdust'
      ]
    },
    {
      id: 'quality',
      stageNum: '08',
      title: 'Lab Testing & Quality Audits',
      assetKey: 'const_stage_8_quality',
      subheading: 'NDT Rebound Hammer, Slump Testing & Snag Audits',
      standards: 'IS 13311 (Non-Destructive Testing)',
      checkpoints: [
        'NABL accredited third-party test certificates for cement, steel, and aggregates',
        'Digital laser distance meter and thermal imaging audit for hidden seepage',
        'Comprehensive 140-point snag checklist logged on cloud dashboard',
        'Independent Chartered Engineer milestone sign-off for escrow release'
      ]
    },
    {
      id: 'handover',
      stageNum: '09',
      title: 'Final Handover & Digital Passport',
      assetKey: 'const_stage_9_handover',
      subheading: 'Zero-Snag Certificate, As-Built Drawings & Warranty Dossier',
      standards: 'BuildEco Complete Asset Guarantee',
      checkpoints: [
        'Complete digital archive with all as-built MEP drawings and piping routes',
        '10-Year structural integrity warranty and 5-year anti-seepage guarantee',
        'Commissioned UPPCL rooftop solar net-metering and DISCOM subsidy certificates',
        'Permanent property digital passport handed over to homeowner'
      ]
    }
  ];

  const currentStage = constructionStages[activeStageIndex];
  const currentAsset = getMediaAsset(currentStage.assetKey) ?? getMediaAsset('const_stage_1_planning')!;

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      
      {/* 1. Hero Banner */}
      <section className="pt-10 pb-16 bg-gradient-to-b from-[#FFFFFF] to-[#EAF6FB] border-b border-[var(--color-border)]">
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="inline-flex items-center gap-2">
            <Badge variant="primary" size="md" icon={<HardHat className="w-3.5 h-3.5" />}>
              Core Engine 02
            </Badge>
            <span className="text-xs font-mono font-bold text-[var(--color-brand-brown)] bg-[#EAF7FC] px-2.5 py-1 rounded-full border border-[#C6DEE8]">
              Milestone Escrow & Site Governance
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-text)] tracking-tight leading-tight">
                Construction Management, Quality Control & <br className="hidden sm:inline" />
                <span className="text-[var(--color-primary)]">Escrow-Governed Execution</span>
              </h1>
              
              <p className="text-base text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
                Eliminate contractor cost escalations, substandard rebar substitutions, and construction delays with independent structural peer reviews, lab-tested quality audits, and milestone-locked escrow payouts.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleOpenIntake('Initiate Construction Management & Supervision')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Post Project for Supervision
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => handleOpenIntake('Request Independent Structural Peer Review')}
                  leftIcon={<ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />}
                >
                  Structural Peer Review
                </Button>
              </div>
            </div>

            {/* Hero visual */}
            <div className="lg:col-span-4">
              <PageHeroMedia assetKey="hero_construction_controls" className="rounded-2xl mb-4" />
            <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0F2EC] pb-3">
                <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">Quality Assurance Protocol</span>
                <span className="text-[10px] font-mono text-[var(--color-primary)] font-bold bg-[var(--color-primary-subtle)] px-2 py-0.5 rounded-full">CPWD & IS NORMS</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Payout Mechanism:</span>
                  <span className="font-bold text-[var(--color-primary)]">5-Stage Escrow Lock</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Material Testing:</span>
                  <span className="font-bold text-[var(--color-text)]">NABL Accredited Labs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Site Surveillance:</span>
                  <span className="font-bold text-[var(--color-text)]">Solar 4G Live Stream</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Final Deliverable:</span>
                  <span className="font-bold text-[var(--color-brand-brown)]">Digital Home Passport</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F0F2EC] text-[11px] text-[var(--color-text-subtle)] flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                <span>Funds disbursed strictly upon structural milestone sign-off.</span>
              </div>
            </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. GRIHA NIRMAN 360° SUPER-APP PLATFORM */}
      <section className="py-10 max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        <GrihaNirmanSuperApp onOpenIntake={handleOpenIntake} />
      </section>

      {/* 3. THE 9-STAGE INTERACTIVE VISUAL CONSTRUCTION JOURNEY */}
      <section className="py-14 sm:py-20 max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="brown" size="sm">9-Stage Visual Lifecycle</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)]">
            Stage-Wise Construction Quality & Milestone Standards
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
            Explore real technical checkpoints, IS standard codes, and verified photography across every phase of execution.
          </p>
        </div>

        {/* Stage Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {constructionStages.map((stg, idx) => (
            <button
              key={stg.id}
              onClick={() => setActiveStageIndex(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeStageIndex === idx
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[#1697C4]'
              }`}
            >
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                activeStageIndex === idx ? 'bg-[#2D6A4F] text-white' : 'bg-[var(--color-surface-muted)] text-[var(--color-primary)]'
              }`}>
                {stg.stageNum}
              </span>
              <span>{stg.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Active Stage Deep-Dive Card */}
        <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] p-6 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Stage Photography */}
          <div className="lg:col-span-6 space-y-3">
            <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-[var(--color-surface-muted)] border border-[var(--color-border)] shadow-inner group">
              <ResponsiveMedia
                asset={currentAsset}
                className="h-full rounded-none border-0"
                imageClassName="h-full"
                showBadge={false}
                overlay={
                  <>
                    <div className="absolute top-3 left-3 bg-[#191C1A]/80 backdrop-blur-xs text-white text-[11px] font-mono font-bold px-3 py-1 rounded-full border border-white/20">
                      STAGE {currentStage.stageNum} OF 09
                    </div>
                    <div className="absolute bottom-3 right-3 bg-[var(--color-primary)] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                      {currentAsset.badge || 'IS Standard Verified'}
                    </div>
                  </>
                }
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[var(--color-text-subtle)] px-1">
              <span>{currentAsset.title}</span>
              <span className="font-mono text-[var(--color-brand-brown)]">{currentStage.standards}</span>
            </div>
          </div>

          {/* Stage Details & Quality Protocol */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[var(--color-brand-brown)] bg-[#EAF7FC] px-2.5 py-0.5 rounded-full border border-[#C6DEE8]">
                  MILESTONE #{currentStage.stageNum}
                </span>
                <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-0.5 rounded-full">
                  CPWD / IS Compliant
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-[var(--color-text)]">
                {currentStage.title}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] font-medium">
                {currentStage.subheading}
              </p>
            </div>

            {/* Mandatory Checkpoints */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider block">
                Mandatory Engineering Checkpoints:
              </span>
              <div className="space-y-2 text-xs">
                {currentStage.checkpoints.map((cp, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]">
                    <CheckCircle className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
                    <span className="text-[var(--color-text)] font-medium leading-relaxed">{cp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => handleOpenIntake(`Supervise Stage ${currentStage.stageNum}: ${currentStage.title}`)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Hire Supervision for Stage {currentStage.stageNum}
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleOpenIntake(`Audit Checklist for Stage ${currentStage.stageNum}`)}
                leftIcon={<FileText className="w-4 h-4 text-[var(--color-primary)]" />}
              >
                Download Stage Checklist
              </Button>
            </div>
          </div>

        </div>

      </section>

      {/* 3. The 3 Pillars of Construction Control */}
      <section className="py-14 max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Layer 1 */}
          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[#1697C4] transition-all space-y-4 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-text)]">
              1. Independent Structural Peer Review
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Every design is re-analyzed by chartered structural engineers (IEI) on STAAD Pro/ETABS. We verify rebar schedules, seismic ductility (IS 13920), and concrete cover blocks before digging starts.
            </p>
            <div className="text-[11px] text-[var(--color-primary)] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Prevents Over-design & Structural Failure</span>
            </div>
          </div>

          {/* Layer 2 */}
          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[#1697C4] transition-all space-y-4 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-muted)] text-[var(--color-primary)] flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-text)]">
              2. 5-Stage Escrow Milestone Protection
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Your project funds sit in a tripartite escrow account. Contractors only receive stage disbursements (Plinth, Slab 1, Slab 2, Masonry, Finishing) after physical verification by BuildEco site engineers.
            </p>
            <div className="text-[11px] text-[var(--color-primary)] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero Risk of Contractor Disappearance</span>
            </div>
          </div>

          {/* Layer 3 */}
          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[#1697C4] transition-all space-y-4 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#EAF7FC] text-[var(--color-brand-brown)] flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-text)]">
              3. Live IoT & Video Telemetry
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Solar-powered, high-definition 4G CCTV cameras stream site activity directly to your client dashboard. Weekly drone flight photogrammetry measures volume and alignment.
            </p>
            <div className="text-[11px] text-[var(--color-brand-brown)] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>24/7 Mobile App Observability</span>
            </div>
          </div>

        </div>

        {/* Milestone Schedule */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text)]">Standard 5-Stage Milestone Verification Schedule</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Transparent escrow release criteria for residential and commercial construction.</p>
            </div>
            <Badge variant="primary" size="sm">Audited Protocols</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            {[
              { num: '01', title: 'Excavation & Plinth', pct: '20% Escrow', cert: 'Soil & Anti-termite QA' },
              { num: '02', title: 'Ground Floor Slab', pct: '25% Escrow', cert: 'Concrete Cube 28-day Test' },
              { num: '03', title: 'Superstructure Slabs', pct: '25% Escrow', cert: 'Rebar & Shuttering QA' },
              { num: '04', title: 'Masonry, MEP & Plaster', pct: '20% Escrow', cert: 'Plumbing Pressure Test' },
              { num: '05', title: 'Finishing & Passport', pct: '10% Escrow', cert: 'Snag List Sign-off' },
            ].map(m => (
              <div key={m.num} className="p-3.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[var(--color-primary)]">{m.num}</span>
                  <span className="text-[10px] font-bold bg-[var(--color-primary-subtle)] text-[var(--color-primary)] px-1.5 py-0.5 rounded">{m.pct}</span>
                </div>
                <div className="font-bold text-[var(--color-text)] text-xs">{m.title}</div>
                <div className="text-[10px] text-[var(--color-text-subtle)]">{m.cert}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center pt-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => handleOpenIntake('Hire Construction Management & Supervision Team')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Start Construction Management for Your Site
          </Button>
        </div>

      </section>

      {/* Universal Case Intake Modal */}
      <UniversalCaseIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        defaultObjective={modalObjective}
        defaultServiceId="construction"
        defaultCategory="CONSTRUCTION"
      />
    </div>
  );
};
