import React, { useState } from 'react';
import { BarChart3, X } from 'lucide-react';
import { getAnalyticsConsent, setAnalyticsConsent } from '../lib/analytics';

export const AnalyticsConsent: React.FC = () => {
  const [visible, setVisible] = useState(() => getAnalyticsConsent() === null);

  if (!visible) return null;

  const choose = (value: 'accepted' | 'declined') => {
    void setAnalyticsConsent(value);
    setVisible(false);
  };

  return (
    <aside
      aria-label="Analytics preference"
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-4 shadow-xl sm:bottom-6 sm:flex sm:items-center sm:gap-4"
    >
      <div className="mb-3 flex min-w-0 flex-1 items-start gap-3 sm:mb-0">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[var(--color-primary-subtle)] text-[var(--color-primary)]">
          <BarChart3 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-extrabold text-black">Help us improve the project journey</p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
            Optional, privacy-focused usage analytics only. Form text and session recordings are not collected.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:shrink-0">
        <button onClick={() => choose('declined')} className="min-h-10 border border-[var(--color-border-strong)] px-4 text-xs font-bold text-[var(--color-brand-brown)] hover:bg-[var(--color-background)]">
          Not now
        </button>
        <button onClick={() => choose('accepted')} className="min-h-10 bg-[var(--color-primary)] px-4 text-xs font-bold text-white hover:bg-[var(--color-primary-hover)]">
          Allow analytics
        </button>
        <button onClick={() => choose('declined')} aria-label="Close analytics preference" className="p-2 text-[var(--color-text-muted)] hover:text-black">
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
