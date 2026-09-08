import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../lib/constants';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

interface DesktopNavProps {
  onToggleMegaMenu: () => void;
  isMegaMenuOpen: boolean;
}

export const DesktopNav: React.FC<DesktopNavProps> = ({
  onToggleMegaMenu,
  isMegaMenuOpen,
}) => {
  const location = useLocation();

  return (
    <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
      {NAV_ITEMS.map((item) => {
        if (item.hasMegaMenu) {
          return (
            <div key={item.label} className="relative">
              <button
                type="button"
                onClick={onToggleMegaMenu}
                aria-expanded={isMegaMenuOpen}
                aria-haspopup="true"
                className={cn(
                  'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isMegaMenuOpen
                    ? 'text-[var(--color-primary)] bg-[var(--color-primary-subtle)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)]'
                )}
              >
                <span>{item.label}</span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    isMegaMenuOpen && 'rotate-180 text-[var(--color-primary)]'
                  )}
                />
              </button>
            </div>
          );
        }

        // Handle hash anchor links
        if (item.href.startsWith('/#') || item.href.startsWith('#')) {
          const hash = item.href.includes('#') ? `#${item.href.split('#')[1]}` : item.href;
          const isHome = location.pathname === '/' || location.pathname === '';
          return (
            <a
              key={item.label}
              href={item.href}
              className="px-3 py-2 text-sm font-medium rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)] transition-colors"
            >
              {item.label}
            </a>
          );
        }

        return (
          <NavLink
            key={item.label}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors relative',
                isActive
                  ? 'text-[var(--color-primary)] bg-[var(--color-primary-subtle)] font-semibold'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)]'
              )
            }
          >
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
};
