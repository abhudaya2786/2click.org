import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { PRIMARY_CTA_ROUTE } from '../../lib/homeGoals';
import { BuildEcoGroupLogo } from '../brand/BuildEcoGroupLogo';
import { MobileNav } from './MobileNav';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageToggle } from '../ui/LanguageToggle';
import { cn } from '../../lib/cn';
import { captureProductEvent, PRODUCT_EVENTS } from '../../lib/analytics';

const NAV_ITEMS = [
  { label: 'Home', labelHi: 'होम', to: ROUTES.HOME },
  { label: 'Services', labelHi: 'सेवाएं', to: ROUTES.SERVICES },
  { label: 'About', labelHi: 'हमारे बारे में', to: ROUTES.ABOUT },
  { label: 'Our Consultants', labelHi: 'हमारे विशेषज्ञ', to: ROUTES.CONSULTANTS },
  { label: 'Insights', labelHi: 'इनसाइट्स', to: ROUTES.RESEARCH },
];

export const Header: React.FC = () => {
  const { isScrolled } = useScrollPosition();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[#fbfaf6]/95 backdrop-blur-xl transition-shadow duration-200',
          isScrolled && 'shadow-[0_7px_22px_rgba(23,49,39,.07)]'
        )}
      >
        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-4 sm:h-[76px] sm:px-6 lg:px-8">
          <Link to={ROUTES.HOME} className="group shrink-0 py-1" aria-label={t('BuildEcoGroup Home', 'BuildEcoGroup होम')}>
            <BuildEcoGroupLogo
              variant="full"
              theme="light"
              className="h-[42px] w-auto transition-transform duration-200 group-hover:scale-[1.015] sm:h-[52px]"
            />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === ROUTES.HOME}
                className={({ isActive }) => cn(
                  'relative py-2 text-[12px] font-semibold text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]',
                  isActive && 'text-[var(--color-primary)] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-[var(--color-primary)]'
                )}
              >
                {t(item.label, item.labelHi)}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <LanguageToggle className="hidden 2xl:inline-flex" />
            <Link
              to={ROUTES.LOGIN}
              className="hidden min-h-10 items-center px-2 text-[11px] font-bold text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)] xl:inline-flex"
            >
              {t('Login', 'लॉगिन')}
            </Link>
            <Link
              to={ROUTES.REGISTER}
              onClick={() => captureProductEvent(PRODUCT_EVENTS.REGISTRATION_NAV_CLICKED, { source: 'desktop_header' })}
              className="hidden min-h-10 items-center justify-center rounded-md border border-[var(--color-primary)] px-3.5 text-[11px] font-bold text-[var(--color-primary)] transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-subtle)] lg:inline-flex"
              data-testid="header-register"
            >
              {t('Register', 'रजिस्टर')}
            </Link>
            <Link
              to={PRIMARY_CTA_ROUTE}
              className="hidden min-h-10 items-center justify-center rounded-md bg-[var(--color-primary)] px-5 text-[11px] font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-hover)] sm:inline-flex"
              data-testid="header-start-requirement"
            >
              {t('Start Requirement', 'आवश्यकता शुरू करें')}
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label={t('Open mobile menu', 'मोबाइल मेनू खोलें')}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[var(--color-text)] transition hover:bg-[var(--color-surface-muted)] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </>
  );
};
