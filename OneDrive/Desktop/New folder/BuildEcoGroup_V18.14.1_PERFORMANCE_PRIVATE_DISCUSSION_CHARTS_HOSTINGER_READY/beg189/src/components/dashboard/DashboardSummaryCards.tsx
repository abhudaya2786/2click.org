import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  MessageSquare,
  Compass,
} from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { CaseRecord } from '../../types/backend';

interface DashboardSummaryCardsProps {
  cases: CaseRecord[];
}

export const DashboardSummaryCards: React.FC<DashboardSummaryCardsProps> = ({ cases }) => {
  const stats = useMemo(() => {
    const activeCount = cases.filter(
      (c) => !['COMPLETED', 'CLOSED', 'CANCELLED', 'REJECTED'].includes(c.status)
    ).length;
    return { total: cases.length, activeCount };
  }, [cases]);

  const cards = [
    {
      label: 'Start My Requirement',
      value: '+',
      sub: 'Submit a new request',
      icon: Plus,
      href: ROUTES.INITIATE_PROJECT,
      color: 'text-[var(--color-primary)]',
      primary: true,
    },
    {
      label: 'My Requests',
      value: stats.total,
      sub: 'All your submissions',
      icon: FolderKanban,
      href: '#my-requests',
      color: 'text-[var(--color-primary)]',
    },
    {
      label: 'Active Projects',
      value: stats.activeCount,
      sub: 'In progress',
      icon: Compass,
      href: '#my-requests',
      color: 'text-[var(--color-brand-brown)]',
    },
    {
      label: 'Messages / Updates',
      value: '→',
      sub: 'Case conversations',
      icon: MessageSquare,
      href: ROUTES.MESSAGES,
      color: 'text-[var(--color-text-muted)]',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4" data-testid="dashboard-summary">
      {cards.map((card) => {
        const Icon = card.icon;
        const isHash = card.href.startsWith('#');
        const inner = (
          <div
            className={`flex h-full flex-col rounded-xl border bg-[var(--color-surface)] p-4 transition-shadow hover:shadow-sm ${
              card.primary
                ? 'border-[var(--color-primary)]/30 bg-[var(--color-primary-subtle)]/40'
                : 'border-[var(--color-border)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <Icon className={`h-5 w-5 ${card.color}`} />
              <span className="text-2xl font-extrabold text-[var(--color-text)]">{card.value}</span>
            </div>
            <p className="mt-2 text-xs font-bold text-[var(--color-text)]">{card.label}</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">{card.sub}</p>
          </div>
        );

        if (isHash) {
          return (
            <a key={card.label} href={card.href}>
              {inner}
            </a>
          );
        }

        return (
          <Link key={card.label} to={card.href}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
};
