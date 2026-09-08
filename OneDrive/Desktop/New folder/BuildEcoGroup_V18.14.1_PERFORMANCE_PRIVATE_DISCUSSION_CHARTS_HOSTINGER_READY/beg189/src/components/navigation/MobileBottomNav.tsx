import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { PRIMARY_CTA_ROUTE } from '../../lib/homeGoals';
import { AppIcon } from '../ui/AppIcon';
import type { IconToken } from '../../lib/iconSystem';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/cn';

export const MobileBottomNav: React.FC = () => {
  const { t } = useLanguage();

  const navItems: { labelEn: string; labelHi: string; href: string; icon: IconToken; isHighlight?: boolean }[] = [
    { labelEn: 'Home', labelHi: 'होम', href: ROUTES.HOME, icon: 'home' },
    { labelEn: 'Track', labelHi: 'ट्रैक', href: ROUTES.TRACK_REQUEST, icon: 'tracking' },
    { labelEn: 'Start', labelHi: 'शुरू', href: PRIMARY_CTA_ROUTE, icon: 'caseId', isHighlight: true },
    { labelEn: 'Experts', labelHi: 'विशेषज्ञ', href: ROUTES.CONSULTANTS, icon: 'consultant' },
    { labelEn: 'Services', labelHi: 'सेवाएँ', href: ROUTES.SERVICES, icon: 'boq' },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] px-1 py-1 shadow-lg pb-[max(0.25rem,env(safe-area-inset-bottom))]"
      aria-label={t('Mobile navigation', 'मोबाइल नेविगेशन')}
      data-testid="mobile-bottom-nav"
    >
      <div className="grid grid-cols-5 items-stretch max-w-md mx-auto">
        {navItems.map((item) => {
          const label = t(item.labelEn, item.labelHi);
          return (
            <NavLink
              key={item.href}
              to={item.href}
              aria-label={label}
              className={({ isActive }) =>
                cn(
                  'flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[10px] font-medium transition-colors touch-target',
                  isActive ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
                  item.isHighlight && 'text-[var(--color-primary)] font-bold'
                )
              }
            >
              <AppIcon
                name={item.icon}
                size={item.isHighlight ? 'lg' : 'md'}
                decorative
                className={item.isHighlight ? 'text-[var(--color-primary)]' : undefined}
              />
              <span className="truncate max-w-[4.5rem] leading-tight">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
