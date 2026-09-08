import React from 'react';
import { 
  Sun, 
  Droplets, 
  Camera, 
  Wrench, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  ShieldCheck,
  Zap,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ROUTES } from '../../lib/routes';
import { Link } from 'react-router-dom';

interface PillarsOverviewSectionProps {
  onOpenIntake: (objective: string, category: string) => void;
}

export const PillarsOverviewSection: React.FC<PillarsOverviewSectionProps> = ({ onOpenIntake }) => {
  const pillars = [
    {
      id: 'solar',
      title: 'Solar & Clean Energy Microgrids',
      tag: 'Decarbonization',
      icon: Sun,
      desc: 'Rooftop irradiation modeling, net-metering grid interconnection, hybrid BESS storage sizing, and CAPEX/OPEX solar yield optimization.',
      points: ['Tier-1 TopCon bifacial solar', 'Hybrid inverter & lithium battery', 'PM Surya Ghar up to ₹1.08 Lakh subsidy'],
      link: ROUTES.SOLAR,
    },
    {
      id: 'water',
      title: 'Water Treatment & Zero-Discharge (STP)',
      tag: 'Hydrology & Conservation',
      icon: Droplets,
      desc: 'Advanced Membrane Bioreactor (MBR) STP designs, rainwater harvesting percolation tanks, and dual-plumbing greywater recycling loops.',
      points: ['MBR / SBR sewage treatment design', 'Aquifer recharge hydraulic modeling', 'Zero Liquid Discharge (ZLD) audits'],
      link: `${ROUTES.SERVICES}#water`,
    },
    {
      id: 'surveillance',
      title: 'Surveillance & Site IoT Telemetry',
      tag: 'Remote Intelligence',
      icon: Camera,
      desc: 'Autonomous 4G/solar PTZ site cameras, automated boundary intrusion detection, drone progress time-lapses, and cloud evidence vaults.',
      points: ['Live 24/7 solar 4G streaming', 'Automated progress time-lapses', 'AI boundary tripwire alerts'],
      link: `${ROUTES.SERVICES}#surveillance`,
    },
    {
      id: 'maintenance',
      title: 'Facility Operations & Preventive Maintenance',
      tag: 'Asset Protection',
      icon: Wrench,
      desc: 'Comprehensive digital asset registries, warranty tracking, preventive MEP/HVAC service schedules, and benchmarked facility AMC contractor audits.',
      points: ['Preventive maintenance scheduling', 'Elevator, DG & pump AMC benchmarking', 'Waterproofing restoration protocols'],
      link: `${ROUTES.SERVICES}#maintenance`,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="primary" size="md">
            Specialized Engineering Domains
          </Badge>
          <h2 className="text-3xl font-extrabold text-[var(--color-text)] tracking-tight">
            Integrated Sustainable Utilities & Site Technology
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Every service is integrated into the common project entry point. Start a project directly under any discipline with pre-selected parameters.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className="p-6 sm:p-7 rounded-3xl bg-[var(--color-background)] border border-[var(--color-border)] flex flex-col justify-between space-y-5 hover:border-[var(--color-primary)] transition-colors shadow-2xs"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-[var(--color-brand-brown)] bg-[var(--color-surface)] px-2.5 py-1 rounded-md border border-[var(--color-border)]">
                      {p.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[var(--color-text)]">{p.title}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{p.desc}</p>

                  <div className="space-y-1.5 pt-2">
                    {p.points.map((pt, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DUAL ACTION BUTTONS: Explore Service + Start New Project */}
                <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-3">
                  <Link
                    to={p.link}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border-strong)] text-xs font-bold text-[var(--color-text)] hover:bg-[var(--color-surface)] hover:border-[var(--color-primary)] transition-colors"
                  >
                    <span>Explore Specs</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => onOpenIntake(p.title, p.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:bg-[var(--color-primary-hover)] shadow-xs transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Start Project</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
