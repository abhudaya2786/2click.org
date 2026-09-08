import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  FileSpreadsheet, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Users, 
  Activity,
  Zap,
  HardHat,
  Eye,
  Camera
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ROUTES } from '../lib/routes';
import { UniversalCaseIntakeModal } from '../components/common/UniversalCaseIntakeModal';
import { MEDIA_REGISTRY } from '../lib/mediaAssets';

export const ProjectsPortfolioPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'residential' | 'commercial' | 'plotted' | 'solar'>('all');
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [modalObjective, setModalObjective] = useState('New Project Planning');

  const caseStudies = [
    {
      id: 'BEG-4092',
      title: 'Plotted Land to Bioclimatic Master Development',
      category: 'plotted',
      categoryLabel: 'Land to Project',
      assetKey: 'hero_modern_development',
      location: 'Shaheed Path Corridor, Lucknow',
      area: '14.5 Acres (92 Plotted Villa Enclave)',
      problem: 'Raw agricultural acreage with irregular contour elevations and undefined master plan setbacks.',
      solution: 'Drone GIS topographic modeling, LDA Master Plan 2031 alignment, 8.4m internal spine roads, and integrated solar microgrid.',
      boq: '₹6.84 Cr Infrastructure CAPEX',
      savings: '₹84 Lakhs saved via normalized earthwork cut/fill',
      timeline: '11 Months (Completed on schedule)',
      status: 'Handed Over with Digital Passport',
      typeBadge: 'VERIFIED CASE WORK'
    },
    {
      id: 'BEG-2026-001',
      title: 'Eco-Villa & Solar Microgrid Estate',
      category: 'residential',
      categoryLabel: 'Turnkey Construction',
      assetKey: 'const_stage_9_handover',
      location: 'Gomti Nagar Extension, Lucknow',
      area: '4,200 sq ft Built-up Area',
      problem: 'Homeowner faced 30% conflicting quotes from arbitrary local contractors without structural rebar detailing.',
      solution: 'CPWD-normalized BOQ package, independent IIT Roorkee structural peer review, 8.4 kW on-grid solar roof, and 5-stage escrow payouts.',
      boq: '₹42.8 Lakhs Normalized Package',
      savings: '₹9.6 Lakhs saved vs unvetted contractor bids',
      timeline: 'Execution: 38% Completed (Milestone 2)',
      status: 'Active Live Milestone Execution',
      typeBadge: 'LIVE ACTIVE SITE'
    },
    {
      id: 'BEG-GKP-104',
      title: 'Lakefront Commercial Arcade & STP Facility',
      category: 'commercial',
      categoryLabel: 'Commercial Project Controls',
      assetKey: 'prop_commercial_office',
      location: 'Ramgarh Tal Road, Gorakhpur',
      area: '18,500 sq ft Mixed-Use G+4 Structure',
      problem: 'High water table near lake and deep sand layers demanding specialized foundation and GDA height permissions.',
      solution: 'Bored cast-in-situ pile foundation design, 20 KLD modular zero-discharge STP, and 24/7 solar 4G site CCTV QA.',
      boq: '₹2.18 Cr Turnkey Execution',
      savings: 'Zero structural cracks & on-budget delivery',
      timeline: '14 Months (Milestone 4 of 5)',
      status: 'Superstructure Finishing',
      typeBadge: 'VERIFIED CASE WORK'
    },
    {
      id: 'BEG-SOLAR-88',
      title: 'Industrial Rooftop 45 kW Solar Microgrid',
      category: 'solar',
      categoryLabel: 'Clean Energy Microgrid',
      assetKey: 'solar_residential_rooftop',
      location: 'UPSIDA Industrial Area, Kursi Road',
      area: '5,800 sq ft Industrial Shed Roof',
      problem: 'Escalating commercial power tariffs (₹9.20/unit) and frequent grid voltage fluctuations affecting machinery.',
      solution: '45 kW Tier-1 Bifacial TopCon panels, micro-inverter grid synchronization, and MVVNL net-metering approval with UP NEDA subsidy.',
      boq: '₹18.9 Lakhs Net Capex',
      savings: '₹4.8 Lakhs/year recurring electricity reduction',
      timeline: '3 Weeks Installation & Testing',
      status: 'Commissioned & Generating Live',
      typeBadge: 'VERIFIED COMMISSIONED'
    }
  ];

  const filtered = activeFilter === 'all' 
    ? caseStudies 
    : caseStudies.filter(c => c.category === activeFilter);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      
      {/* 1. Header */}
      <section className="pt-10 pb-16 bg-gradient-to-b from-[#FFFFFF] to-[#EAF6FB] border-b border-[var(--color-border)]">
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="inline-flex items-center gap-2">
            <Badge variant="primary" size="md" icon={<Building2 className="w-3.5 h-3.5" />}>
              Auditable Case Studies
            </Badge>
            <span className="text-xs font-mono font-bold text-[var(--color-brand-brown)] bg-[#EAF7FC] px-2.5 py-1 rounded-full border border-[#C6DEE8]">
              Verifiable Project Milestones
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-text)] tracking-tight leading-tight">
                Projects, Case Studies & <br className="hidden sm:inline" />
                <span className="text-[var(--color-primary)]">Verified Portfolio</span>
              </h1>
              
              <p className="text-base text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
                Explore real projects executed across Uttar Pradesh under BuildEco's connected governance. Every project is documented with Problem, Solution, Normalized BOQ, Timeline, and Verifiable Outcome.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                {[
                  { id: 'all', label: 'All Projects' },
                  { id: 'residential', label: 'Eco-Villas & Homes' },
                  { id: 'commercial', label: 'Commercial Arcades' },
                  { id: 'plotted', label: 'Land & Plotted Enclaves' },
                  { id: 'solar', label: 'Solar Microgrids' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      activeFilter === tab.id
                        ? 'bg-[var(--color-primary)] text-white shadow-xs'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[#1697C4]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-xs space-y-3 text-xs">
              <div className="font-bold text-[var(--color-text)] text-sm uppercase">Platform Portfolio Metrics</div>
              <div className="flex justify-between border-b border-[#F0F2EC] pb-2">
                <span className="text-[var(--color-text-muted)]">Total Projects Governed:</span>
                <span className="font-bold text-[var(--color-primary)]">230+ Assets</span>
              </div>
              <div className="flex justify-between border-b border-[#F0F2EC] pb-2">
                <span className="text-[var(--color-text-muted)]">Total Value Supervised:</span>
                <span className="font-bold text-[var(--color-text)]">₹180+ Crores</span>
              </div>
              <div className="flex justify-between border-b border-[#F0F2EC] pb-2">
                <span className="text-[var(--color-text-muted)]">Average Client Savings:</span>
                <span className="font-bold text-[#F59E0B]">18.4% Net</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">On-Time Delivery Rate:</span>
                <span className="font-bold text-[#7ED0E8]">96.2%</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Project List Cards with Photography */}
      <section className="py-14 sm:py-20 max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map(project => {
            const asset = MEDIA_REGISTRY[project.assetKey] || MEDIA_REGISTRY['const_stage_9_handover'];
            return (
              <div 
                key={project.id} 
                className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] overflow-hidden shadow-2xs hover:border-[#1697C4] transition-all flex flex-col justify-between group"
              >
                {/* Photo Top with Case Badge */}
                <div className="relative aspect-16/9 overflow-hidden bg-[var(--color-surface-muted)]">
                  <img
                    src={asset.url}
                    alt={asset.altText}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-[#191C1A]/85 backdrop-blur-xs text-white font-mono text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                    CASE #{project.id}
                  </div>
                  <div className="absolute top-3 right-3 bg-[var(--color-primary)] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                    {project.typeBadge}
                  </div>
                </div>

                <div className="p-6 sm:p-7 space-y-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-[var(--color-brand-brown)] uppercase tracking-wider">
                        {project.categoryLabel}
                      </div>
                      <h3 className="text-xl font-extrabold text-[var(--color-text)] leading-snug">
                        {project.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-muted)] pt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[var(--color-brand-brown)]" />
                          {project.location}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-[var(--color-text)]">{project.area}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] space-y-1">
                        <span className="text-[10px] font-bold uppercase text-[var(--color-text-subtle)] block">The Problem</span>
                        <p className="text-[var(--color-text-muted)] leading-relaxed">{project.problem}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--color-surface-muted)] border border-[#B9DDEA] space-y-1">
                        <span className="text-[10px] font-bold uppercase text-[var(--color-primary)] block">The BuildEco Solution</span>
                        <p className="text-[var(--color-text)] font-medium leading-relaxed">{project.solution}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]">
                        <span className="text-[10px] uppercase font-bold text-[var(--color-text-subtle)] block">Normalized BOQ</span>
                        <span className="font-mono font-bold text-[var(--color-text)]">{project.boq}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]">
                        <span className="text-[10px] uppercase font-bold text-[var(--color-primary)] block">Client Impact</span>
                        <span className="font-bold text-[var(--color-primary)]">{project.savings}</span>
                      </div>
                    </div>

                  </div>

                  <div className="pt-4 border-t border-[#F0F2EC] flex items-center justify-between text-xs">
                    <span className="text-[var(--color-text-muted)] font-medium">{project.timeline}</span>
                    <button
                      onClick={() => {
                        setModalObjective(`Inquiry on Case #${project.id}: ${project.title}`);
                        setIsIntakeOpen(true);
                      }}
                      className="font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                    >
                      <span>Inquire on Case Architecture</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

        {/* Action Strip */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--color-primary)] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold">Ready to make your project our next success story?</h3>
            <p className="text-xs text-[#B9DDEA]">
              Start with a structured intake and get a dedicated Case ID within minutes.
            </p>
          </div>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              setModalObjective('New Project Case Registration');
              setIsIntakeOpen(true);
            }}
            rightIcon={<ArrowRight className="w-4 h-4 text-[var(--color-primary)]" />}
            className="bg-[var(--color-surface)] text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)] font-bold"
          >
            Start Your Project Case
          </Button>
        </div>

      </section>

      {/* Universal Case Intake Modal */}
      <UniversalCaseIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        defaultObjective={modalObjective}
        defaultCategory="Portfolio Inquiry"
      />
    </div>
  );
};
