import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { NAV_ITEMS } from '../../lib/constants';
import { ROUTES } from '../../lib/routes';
import { PRIMARY_CTA_LABEL, PRIMARY_CTA_ROUTE } from '../../lib/homeGoals';
import { BuildEcoGroupLogo } from '../brand/BuildEcoGroupLogo';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { LanguageToggle } from '../ui/LanguageToggle';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  ArrowRight, 
  LogIn, 
  Send, 
  Compass,
  UserPlus,
} from 'lucide-react';
import { captureProductEvent, PRODUCT_EVENTS } from '../../lib/analytics';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_LABEL_HI: Record<string, string> = {
  Explore: 'खोजें',
  Land: 'भूमि',
  Construction: 'निर्माण',
  Consultants: 'विशेषज्ञ',
  'BOQ Estimator': 'BOQ अनुमान',
  Property: 'संपत्ति',
};

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="right"
      title={
        <Link to={ROUTES.HOME} onClick={onClose} className="block py-1">
          <BuildEcoGroupLogo variant="full" theme="light" className="h-10 w-auto" />
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>

        {/* Primary Call to Action */}
        <div className="p-4 rounded-xl bg-[var(--color-primary-subtle)] border border-[#B9DDEA] space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
            {t('Universal Case Intake', 'यूनिवर्सल केस इनटेक')}
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            {t(
              'Structure your project requirement with zero sales pressure.',
              'बिना सेल्स दबाव के अपनी प्रोजेक्ट आवश्यकता संरचित करें।'
            )}
          </p>
          <Link to={PRIMARY_CTA_ROUTE} onClick={onClose}>
            <Button
              variant="primary"
              size="md"
              fullWidth
              rightIcon={<Send className="w-4 h-4" />}
              className="min-h-11"
            >
              {t(PRIMARY_CTA_LABEL, 'अपनी आवश्यकता बताएं')}
            </Button>
          </Link>
        </div>

        {/* Main Navigation Links */}
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-subtle)] px-3 mb-2">
            {t('Main Sections', 'मुख्य अनुभाग')}
          </div>
          {NAV_ITEMS.map((item) => {
            const label = t(item.label, NAV_LABEL_HI[item.label] || item.label);
            if (item.href.startsWith('/#') || item.href.startsWith('#')) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className="flex min-h-11 items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] transition-colors"
                >
                  <span>{label}</span>
                  <ArrowRight className="w-4 h-4 opacity-50" aria-hidden />
                </a>
              );
            }

            return (
              <NavLink
                key={item.label}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex min-h-11 items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-white font-semibold'
                      : 'text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]'
                  }`
                }
              >
                <span>{label}</span>
                <ArrowRight className="w-4 h-4 opacity-50" aria-hidden />
              </NavLink>
            );
          })}
        </div>

        {/* 5 Pillars Quick List */}
        <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-brown)] px-3">
            {t('Core Flagships & Tools', 'मुख्य फ्लैगशिप और टूल')}
          </div>
          <div className="space-y-1.5">
            <a
              href="/#land-to-project"
              onClick={onClose}
              className="flex min-h-11 items-center justify-between px-3 py-2 rounded-lg text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
            >
              <span>{t('Land-to-Project 8-Stage Engine', 'Land-to-Project 8-Stage इंजन')}</span>
              <span className="text-[10px] font-mono text-[var(--color-brand-brown)]">01</span>
            </a>
            <a
              href="/#construction-management"
              onClick={onClose}
              className="flex min-h-11 items-center justify-between px-3 py-2 rounded-lg text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
            >
              <span>{t('Construction Management Ecosystem', 'निर्माण प्रबंधन इकोसिस्टम')}</span>
              <span className="text-[10px] font-mono text-[var(--color-brand-brown)]">02</span>
            </a>
            <a
              href="/#boq-estimator"
              onClick={onClose}
              className="flex min-h-11 items-center justify-between px-3 py-2 rounded-lg text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
            >
              <span>{t('BOQ & Cost Normalization', 'BOQ और लागत normalization')}</span>
              <span className="text-[10px] font-mono text-[var(--color-brand-brown)]">03</span>
            </a>
          </div>
        </div>

        {/* Sign In & Direct Links */}
        <div className="pt-4 border-t border-[var(--color-border)] space-y-2">
          <Link
            to={ROUTES.REGISTER}
            onClick={() => {
              captureProductEvent(PRODUCT_EVENTS.REGISTRATION_NAV_CLICKED, { source: 'mobile_menu' });
              onClose();
            }}
          >
            <Button
              variant="primary"
              size="md"
              fullWidth
              leftIcon={<UserPlus className="w-4 h-4" />}
              className="min-h-11"
            >
              {t('Create Customer Account', 'कस्टमर अकाउंट बनाएं')}
            </Button>
          </Link>
          <Link to={ROUTES.TRACK_REQUEST} onClick={onClose}>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              leftIcon={<Compass className="w-4 h-4 text-[var(--color-primary)]" />}
              className="min-h-11"
            >
              {t('Track My Request / Form', 'मेरा अनुरोध / फॉर्म ट्रैक करें')}
            </Button>
          </Link>
          <Link to={ROUTES.LOGIN} onClick={onClose}>
            <Button
              variant="outline"
              size="md"
              fullWidth
              leftIcon={<LogIn className="w-4 h-4 text-[var(--color-primary)]" />}
              className="min-h-11"
            >
              {t('Console Login', 'कंसोल लॉगिन')}
            </Button>
          </Link>
        </div>

      </div>
    </Drawer>
  );
};
