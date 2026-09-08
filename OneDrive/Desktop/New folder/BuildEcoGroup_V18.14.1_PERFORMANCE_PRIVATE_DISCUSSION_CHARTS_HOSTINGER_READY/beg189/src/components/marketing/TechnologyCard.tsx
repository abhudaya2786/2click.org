import React from 'react';
import { Link } from 'react-router-dom';
import { SecondaryCapability } from '../../types/common';
import { Badge } from '../ui/Badge';
import { 
  Globe, 
  Calculator, 
  SunMedium, 
  Droplets, 
  Recycle, 
  Wrench, 
  Compass, 
  Layers,
  ArrowRight 
} from 'lucide-react';
import { cn } from '../../lib/cn';

interface TechnologyCardProps {
  capability: SecondaryCapability;
  className?: string;
}

const TECH_ICONS: Record<string, React.ReactNode> = {
  Globe: <Globe className="w-5 h-5" />,
  Calculator: <Calculator className="w-5 h-5" />,
  SunMedium: <SunMedium className="w-5 h-5" />,
  Droplets: <Droplets className="w-5 h-5" />,
  Recycle: <Recycle className="w-5 h-5" />,
  Wrench: <Wrench className="w-5 h-5" />,
  Compass: <Compass className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
};

export const TechnologyCard: React.FC<TechnologyCardProps> = ({ capability, className }) => {
  return (
    <div
      className={cn(
        'group bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5 shadow-xs hover:border-[#15364A]/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between',
        className
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-lg bg-[#EAF4F8] text-[var(--color-brand-brown)] flex items-center justify-center group-hover:bg-[#15364A] group-hover:text-white transition-colors">
            {TECH_ICONS[capability.icon] || <Globe className="w-5 h-5" />}
          </div>
          <Badge variant="brown" size="sm">
            {capability.tag}
          </Badge>
        </div>

        <div>
          <h4 className="text-base font-bold text-[var(--color-text)] group-hover:text-[var(--color-brand-brown)] transition-colors">
            {capability.title}
          </h4>
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed">
            {capability.description}
          </p>
        </div>
      </div>

      <div className="pt-4 mt-3 border-t border-[#EAF6FB]">
        <Link
          to={capability.href}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-brand-brown)] hover:text-[#0C2939] group-hover:translate-x-0.5 transition-all"
        >
          <span>View Technical Scope</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
