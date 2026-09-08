import React from 'react';
import { ConsultantMock } from '../../types/common';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MapPin, ShieldCheck, Award, Briefcase, ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/cn';

interface ConsultantCardProps {
  consultant: ConsultantMock;
  onViewProfile?: (consultant: ConsultantMock) => void;
  className?: string;
}

export const ConsultantCard: React.FC<ConsultantCardProps> = ({
  consultant,
  onViewProfile,
  className,
}) => {
  return (
    <div
      className={cn(
        'group bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 shadow-sm hover:border-[#1697C4]/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between',
        className
      )}
    >
      <div className="space-y-4">
        {/* Card Header: Avatar & Badges */}
        <div className="flex items-start gap-4">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[var(--color-surface-muted)] border border-[var(--color-border)] shrink-0">
            <img
              src={consultant.avatarUrl}
              alt={consultant.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="primary" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
                {consultant.verifiedStatus}
              </Badge>
            </div>
            <h4 className="text-base font-bold text-[var(--color-text)] truncate group-hover:text-[var(--color-primary)] transition-colors">
              {consultant.name}
            </h4>
            <p className="text-xs text-[var(--color-brand-brown)] font-medium truncate">
              {consultant.title}
            </p>
          </div>
        </div>

        {/* Department & Specialization */}
        <div className="space-y-1.5 pt-2 border-t border-[#EAF6FB]">
          <div className="text-xs font-semibold text-[var(--color-text)]">
            {consultant.specialization}
          </div>
          <div className="text-[11px] text-[var(--color-text-muted)]">
            {consultant.department}
          </div>
        </div>

        {/* Location & Experience Metadata */}
        <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-[var(--color-text-muted)]">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[var(--color-brand-brown)] shrink-0" />
            <span className="truncate">{consultant.city}, {consultant.state}</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" />
            <span className="truncate">{consultant.experienceLabel}</span>
          </div>
        </div>

        {/* Focus Tags */}
        <div className="flex flex-wrap gap-1 pt-1">
          {consultant.focusAreas.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-[var(--color-border)] flex items-center justify-between">
        <span className="text-[10px] font-mono-code text-[var(--color-text-subtle)]">
          Independent Empaneled
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewProfile?.(consultant)}
          rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
        >
          View Profile
        </Button>
      </div>
    </div>
  );
};
