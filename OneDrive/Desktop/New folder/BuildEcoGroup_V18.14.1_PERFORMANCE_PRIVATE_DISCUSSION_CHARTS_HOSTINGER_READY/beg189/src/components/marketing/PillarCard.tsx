import React from 'react';
import { Link } from 'react-router-dom';
import { PillarItem } from '../../types/common';
import { Badge } from '../ui/Badge';
import { 
  Hammer, 
  ShieldCheck, 
  MapPin, 
  Users, 
  Sparkles, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../lib/cn';

interface PillarCardProps {
  pillar: PillarItem;
  className?: string;
}

const ICON_COMPONENTS: Record<string, React.ReactNode> = {
  Hammer: <Hammer className="w-5 h-5" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5" />,
  MapPin: <MapPin className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
};

export const PillarCard: React.FC<PillarCardProps> = ({ pillar, className }) => {
  return (
    <div
      className={cn(
        'group flex flex-col justify-between h-full bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 shadow-sm hover:border-[#1697C4]/50 hover:shadow-md transition-all duration-200',
        className
      )}
    >
      <div className="space-y-4">
        {/* Top Header: Number & Icon */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
            {ICON_COMPONENTS[pillar.icon] || <Hammer className="w-5 h-5" />}
          </div>
          <span className="font-mono-code text-xs font-bold text-[var(--color-brand-brown)] px-2 py-0.5 rounded bg-[#EAF4F8] border border-[#C6DEE8]">
            PILLAR {pillar.number}
          </span>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors leading-snug">
            {pillar.title}
          </h3>
          {pillar.badge && (
            <div className="mt-1.5">
              <Badge variant="primary" size="sm">
                {pillar.badge}
              </Badge>
            </div>
          )}
        </div>

        {/* Short concise description (No long paragraphs) */}
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
          {pillar.shortDescription}
        </p>

        {/* Micro-capabilities list */}
        <div className="pt-2 space-y-1.5 border-t border-[#EAF6FB]">
          {pillar.keyCapabilities.slice(0, 3).map((cap) => (
            <div key={cap} className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" />
              <span className="truncate">{cap}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-6 mt-4 border-t border-[var(--color-border)]">
        <Link
          to={pillar.href}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] group-hover:text-[#087EA8] group-hover:translate-x-0.5 transition-all"
        >
          <span>Explore Pillar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
