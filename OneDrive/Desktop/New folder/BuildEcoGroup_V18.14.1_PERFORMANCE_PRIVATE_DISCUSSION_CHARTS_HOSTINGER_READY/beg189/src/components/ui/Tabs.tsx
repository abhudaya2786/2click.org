import React from 'react';
import { cn } from '../../lib/cn';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex p-1 bg-[var(--color-surface-muted)] rounded-xl border border-[var(--color-border)] overflow-x-auto max-w-full scrollbar-none',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-150',
              isActive
                ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-xs font-semibold'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[#EAEAE4]/50'
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-xs px-1.5 py-0.2 rounded-full font-mono-code',
                  isActive ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]' : 'bg-[#D6E8F0] text-[var(--color-text-muted)]'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
