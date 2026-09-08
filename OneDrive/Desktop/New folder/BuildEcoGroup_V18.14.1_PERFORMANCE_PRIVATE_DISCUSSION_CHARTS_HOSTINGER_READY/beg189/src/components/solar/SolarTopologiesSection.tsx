import React, { useState } from 'react';
import { 
  Home, 
  Building2, 
  Globe, 
  BatteryCharging, 
  Zap, 
  Droplet, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  PlusCircle, 
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { SOLAR_TOPOLOGIES } from '../../lib/solarRegistry';
import { SolarSystemTopology } from '../../types/solar';

interface SolarTopologiesSectionProps {
  onSelectTopology: (topology: SolarSystemTopology) => void;
  onOpenIntake: (objective: string, category: string) => void;
}

export const SolarTopologiesSection: React.FC<SolarTopologiesSectionProps> = ({
  onSelectTopology,
  onOpenIntake
}) => {
  const [selectedId, setSelectedId] = useState<string>(SOLAR_TOPOLOGIES[0].id);

  const activeTopology = SOLAR_TOPOLOGIES.find(t => t.id === selectedId) || SOLAR_TOPOLOGIES[0];

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home': return <Home className="w-5 h-5 text-[var(--color-primary)]" />;
      case 'Building2': return <Building2 className="w-5 h-5 text-[var(--color-brand-brown)]" />;
      case 'Globe': return <Globe className="w-5 h-5 text-[#2B7A78]" />;
      case 'BatteryCharging': return <BatteryCharging className="w-5 h-5 text-[#27AE60]" />;
      case 'Zap': return <Zap className="w-5 h-5 text-[#E5A93C]" />;
      case 'Droplet': return <Droplet className="w-5 h-5 text-[var(--color-primary)]" />;
      default: return <Home className="w-5 h-5 text-[var(--color-primary)]" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <Badge variant="primary" size="md">
            Engineered Project Topologies
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] tracking-tight">
            Comprehensive Solar Systems & Grid Interconnections
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Every solar installation is uniquely engineered to match your load profile, roof structural geometry, and DISCOM net-metering regulations.
          </p>
        </div>

        <div className="text-xs font-mono font-bold text-[var(--color-brand-brown)] bg-[#EAF4F8] px-3 py-1.5 rounded-xl border border-[#C6DEE8] shrink-0">
          6 Specialized Configurations
        </div>
      </div>

      {/* Topologies Selection Grid (6 Pills) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {SOLAR_TOPOLOGIES.map((topo) => {
          const isSelected = topo.id === selectedId;
          return (
            <button
              key={topo.id}
              type="button"
              onClick={() => setSelectedId(topo.id)}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                isSelected
                  ? 'bg-[var(--color-primary)] text-white border-[#1697C4] shadow-md scale-[1.02]'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-strong)] hover:border-[#1697C4] hover:bg-[var(--color-background)]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-[var(--color-surface)]/15 text-white' : 'bg-[var(--color-surface-muted)] text-[var(--color-primary)]'
                }`}>
                  {renderIcon(topo.iconName)}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  isSelected ? 'bg-[var(--color-surface)]/20 text-white' : 'bg-[#F0F2EC] text-[#7A837C]'
                }`}>
                  {topo.capacityRange.split(' ')[0]}
                </span>
              </div>
              <div className="font-bold text-xs leading-tight line-clamp-2">
                {topo.categoryName}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Active Topology Display Card */}
      <Card className="rounded-3xl border border-[var(--color-border)] p-6 sm:p-8 bg-[var(--color-surface)] shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left 7 cols: Technical Overview & Components */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Title & Badge */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-1 rounded-md border border-[#D4E8DC]">
                  {activeTopology.bannerBadge}
                </span>
                <span className="text-xs font-mono text-[var(--color-brand-brown)] bg-[#EAF4F8] px-2.5 py-1 rounded-md">
                  Capacity Range: {activeTopology.capacityRange}
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-[var(--color-text)]">
                {activeTopology.categoryName}
              </h3>
              
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                {activeTopology.architectureOverview}
              </p>
            </div>

            {/* Key Components Architecture List */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A837C]">
                Core Engineering Components & Bill of Materials (BOM)
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeTopology.keyComponents.map((comp, idx) => (
                  <div key={idx} className="p-2.5 bg-[var(--color-background)] rounded-xl border border-[var(--color-border)] text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
                    <span className="text-[var(--color-text-secondary)] font-medium leading-tight">{comp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Segment & Grid Connection */}
            <div className="p-4 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] text-xs space-y-2">
              <div>
                <span className="font-bold text-[var(--color-text)]">Target Segment: </span>
                <span className="text-[var(--color-text-muted)]">{activeTopology.targetSegment}</span>
              </div>
              <div>
                <span className="font-bold text-[var(--color-text)]">Grid & Metering Topology: </span>
                <span className="text-[var(--color-text-muted)]">{activeTopology.gridConnection}</span>
              </div>
              <div className="pt-2 border-t border-[var(--color-border)] text-[11px] text-[#7A837C]">
                Governing Standards: <span className="font-mono font-bold text-[var(--color-text)]">{activeTopology.standardsAndCodes}</span>
              </div>
            </div>

          </div>

          {/* Right 5 cols: Ideal Applications & Sizing CTA */}
          <div className="lg:col-span-5 bg-[var(--color-background)] p-6 rounded-2xl border border-[var(--color-border)] space-y-6 flex flex-col justify-between h-full">
            
            <div className="space-y-4">
              <div className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">
                Application Checklist
              </div>
              <div className="space-y-2 text-xs">
                {activeTopology.idealFor.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-[var(--color-text-secondary)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Estimated Pricing Guideline */}
              <div className="p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] text-xs">
                <div className="text-[#7A837C] text-[10px] uppercase font-bold">Estimated Turnkey Benchmark</div>
                <div className="text-lg font-extrabold text-[var(--color-primary)] mt-0.5">
                  ₹{activeTopology.estimatedPricingPerKw.toLocaleString('en-IN')} <span className="text-xs font-normal text-[var(--color-text-muted)]">/ kWp (Turnkey EPC)</span>
                </div>
                <div className="text-[10px] text-[#7A837C] mt-0.5">Includes modules, inverter, structure, net-metering & 5-yr O&M.</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center bg-[var(--color-primary)] font-bold text-xs"
                onClick={() => onOpenIntake(`${activeTopology.categoryName} Sizing & DPR`, 'solar')}
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Start Project Under This Topology
              </Button>

              <Button
                variant="outline"
                size="md"
                className="w-full justify-center text-xs font-bold"
                onClick={() => onSelectTopology(activeTopology)}
              >
                Configure in Sizing Calculator
              </Button>
            </div>

          </div>

        </div>
      </Card>
    </div>
  );
};
