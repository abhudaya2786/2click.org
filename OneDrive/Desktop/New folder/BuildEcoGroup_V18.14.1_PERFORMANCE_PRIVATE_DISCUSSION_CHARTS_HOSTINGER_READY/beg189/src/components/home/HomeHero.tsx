import React from 'react';
import { ArrowRight, Check, FileText, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ROUTES } from '../../lib/routes';
import { MEDIA_REGISTRY } from '../../lib/mediaAssets';
import { captureAnalyticsEvent } from '../../lib/analytics';
import { useLanguage } from '../../contexts/LanguageContext';

interface HomeHeroProps {
  onOpenIntake: (objective: string, category: string) => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ onOpenIntake }) => {
  const { t } = useLanguage();
  const primaryImage = MEDIA_REGISTRY.hero_modern_development;
  const detailImage = MEDIA_REGISTRY.hero_construction_controls;

  return (
    <section className="architectural-section overflow-hidden py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-center justify-between border-b border-[var(--color-border-strong)] pb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-brand-brown)]">
          <span>BuildEcoGroup / Project Orchestration</span>
          <span className="hidden sm:block">Land · Design · BOQ · Delivery</span>
        </div>

        <div className="grid items-stretch gap-8 lg:grid-cols-[1.03fr_.97fr] lg:gap-12">
          <div className="relative min-h-[430px] sm:min-h-[560px]">
            <div className="absolute inset-x-0 bottom-0 top-12 overflow-hidden bg-[#DCEEF5]">
              <img
                src={primaryImage.url}
                alt={primaryImage.altText}
                className="h-full w-full object-cover brightness-[1.05] saturate-[.72]"
                referrerPolicy="no-referrer"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              <div className="absolute inset-0 bg-[#B5DCEA]/20 mix-blend-color" />
            </div>

            <div className="absolute right-0 top-0 h-28 w-28 border-[10px] border-[#F4FAFD] bg-[#A8D4E5] sm:h-40 sm:w-44" />

            <div className="absolute bottom-7 right-0 w-[46%] border-[8px] border-[#F4FAFD] bg-[var(--color-surface)] sm:bottom-10 sm:w-[42%] sm:border-[10px]">
              <img
                src={detailImage.url}
                alt={detailImage.altText}
                className="aspect-[4/3] w-full object-cover saturate-[.65]"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="absolute bottom-0 left-0 bg-[#A8D4E5] px-4 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-[#071C27] sm:px-6">
              One case. One record. Full visibility.
            </div>
          </div>

          <div className="flex flex-col justify-center py-2 lg:py-10">
            <div className="mb-5 h-5 w-40 bg-[#A8D4E5] sm:w-56" />
            <p className="editorial-kicker mb-4">{t('Plan better. Connect smarter. Deliver better.', 'बेहतर योजना। सही विशेषज्ञ। पारदर्शी डिलीवरी।')}</p>
            <h1 className="max-w-[720px] text-[2.7rem] font-black uppercase leading-[.9] tracking-[-0.065em] text-black sm:text-[4.8rem] lg:text-[5.4rem]">
              {t('Building', 'प्रोजेक्ट')}
              <br />
              <span className="relative inline-block">
                {t('Projects', 'प्लानिंग')}
                <span className="absolute -right-20 top-1/2 hidden h-5 w-16 -translate-y-1/2 bg-[#A8D4E5] sm:block" />
              </span>
              <br />
              {t('With Clarity', 'पूरी स्पष्टता से')}
            </h1>

            <p className="mt-7 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base">
              {t('A connected project-services platform for land feasibility, verified experts, standardized BOQ comparisons, approvals and milestone tracking.', 'भूमि व्यवहार्यता, सत्यापित विशेषज्ञ, मानकीकृत BOQ तुलना, अनुमोदन और माइलस्टोन ट्रैकिंग के लिए एकीकृत प्रोजेक्ट-सर्विस प्लेटफॉर्म।')}
            </p>

            <div className="mt-7 grid gap-2 border-y border-[var(--color-border-strong)] py-4 text-xs font-bold text-[var(--color-brand-brown)] sm:grid-cols-3">
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--color-primary)]" /> Verified network</span>
              <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-[var(--color-primary)]" /> Comparable BOQs</span>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--color-primary)]" /> Trackable cases</span>
            </div>

            <div className="mt-7">
              <button type="button" onClick={() => { captureAnalyticsEvent('hero_requirement_clicked'); onOpenIntake('Start Your Requirement', 'General Inquiry'); }} className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[var(--color-primary)] px-7 text-sm font-extrabold uppercase tracking-[0.04em] text-white hover:bg-[var(--color-primary-hover)] sm:w-auto">
                {t('Start your requirement', 'अपनी आवश्यकता शुरू करें')} <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <a
              href="#how-it-works"
              onClick={() => captureAnalyticsEvent('hero_workflow_clicked')}
              className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--color-brand-brown)] hover:text-[var(--color-primary)]"
            >
              {t('See how the platform works', 'देखें प्लेटफॉर्म कैसे काम करता है')} <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
