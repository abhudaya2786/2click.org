import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

interface CollapsibleHomeSectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export const CollapsibleHomeSection: React.FC<CollapsibleHomeSectionProps> = ({
  title,
  subtitle,
  defaultOpen = false,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="arch-sky-band border-y border-[var(--color-border)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mx-auto flex w-full max-w-[1340px] items-center justify-between gap-4 px-4 py-5 text-left sm:px-6 lg:px-8 hover:bg-[var(--color-surface)]/80 transition-colors"
      >
        <div>
          <span className="arch-kicker text-[var(--color-brand-brown)]">{title}</span>
          {subtitle && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{subtitle}</p>}
        </div>
        <ChevronDown className={cn('h-5 w-5 shrink-0 text-[var(--color-primary)] transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">{children}</div>}
    </section>
  );
};
