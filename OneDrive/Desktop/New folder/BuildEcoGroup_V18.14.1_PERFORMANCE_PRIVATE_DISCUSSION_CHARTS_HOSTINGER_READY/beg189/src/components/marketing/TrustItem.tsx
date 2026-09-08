import React from 'react';
import { TrustCapabilityItem } from '../../types/common';
import { 
  BadgeCheck, 
  FileText, 
  Lock, 
  BarChart3, 
  GitBranch, 
  Archive,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/cn';

interface TrustItemProps {
  item: TrustCapabilityItem;
  className?: string;
}

const TRUST_ICONS: Record<string, React.ReactNode> = {
  BadgeCheck: <BadgeCheck className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  Lock: <Lock className="w-5 h-5" />,
  BarChart3: <BarChart3 className="w-5 h-5" />,
  GitBranch: <GitBranch className="w-5 h-5" />,
  Archive: <Archive className="w-5 h-5" />,
};

export const TrustItem: React.FC<TrustItemProps> = ({ item, className }) => {
  return (
    <div
      className={cn(
        'group bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5 shadow-xs hover:border-[#1697C4]/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between',
        className
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
            {TRUST_ICONS[item.icon] || <ShieldCheck className="w-5 h-5" />}
          </div>
          <span className="text-[10px] font-mono-code uppercase font-semibold text-[var(--color-brand-brown)] px-2 py-0.5 rounded bg-[#EAF4F8]">
            Platform Standard
          </span>
        </div>

        <div>
          <h4 className="text-base font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
            {item.title}
          </h4>
          <p className="text-xs font-semibold text-[var(--color-brand-brown)] mt-0.5">
            {item.subtitle}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-2 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-[#EAF6FB] flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)]">
        <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" />
        <span className="truncate">{item.guaranteeNote}</span>
      </div>
    </div>
  );
};
