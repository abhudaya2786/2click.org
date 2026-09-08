import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  category: string;
  description: string;
  deliverables: string[];
  href: string;
  badge?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  category,
  description,
  deliverables,
  href,
  badge,
}) => {
  return (
    <Card variant="default" hoverEffect className="flex flex-col justify-between h-full">
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-brand-brown)]">
            {category}
          </span>
          {badge && <Badge variant="primary" size="sm">{badge}</Badge>}
        </div>

        <div>
          <h3 className="text-base font-bold text-[var(--color-text)]">{title}</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed">{description}</p>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-[#EAF6FB]">
          {deliverables.map((item) => (
            <div key={item} className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-[var(--color-border)]">
        <Link
          to={href}
          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:text-[#087EA8]"
        >
          <span>Explore Service Scope</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </Card>
  );
};
