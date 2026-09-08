import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BUILD_ECO_JOURNEY_STEPS, BuildEcoJourneyStep } from '../../lib/buildEcoJourney';
import { PRIMARY_CTA_ROUTE } from '../../lib/homeGoals';
import { useLanguage } from '../../contexts/LanguageContext';
import { MotionReveal } from '../ui/MotionReveal';

export const BuildEcoJourney: React.FC = () => {
  const { t, language } = useLanguage();
  const label = (step: BuildEcoJourneyStep) => language === 'hi' ? step.titleHi : step.titleEn;
  const route = (step: BuildEcoJourneyStep) => step.id === 'need' ? PRIMARY_CTA_ROUTE : step.route;

  return (
    <section id="how-buildEco-works" className="beg-reference-section py-7 sm:py-9" data-testid="buildEco-journey">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <MotionReveal className="flex items-end justify-between gap-4">
          <div>
            <h2 className="beg-editorial-title text-[1.55rem] font-bold text-[var(--color-text)] sm:text-[1.85rem]">{t('How BuildEco Works', 'BuildEco कैसे काम करता है')}</h2>
            <p className="mt-1 text-[11px] text-[var(--color-text-muted)] sm:text-xs">{t('A simple, transparent journey from idea to impact.', 'विचार से प्रभाव तक एक सरल, पारदर्शी यात्रा।')}</p>
          </div>
          <Link to={PRIMARY_CTA_ROUTE} className="hidden items-center gap-1.5 text-[11px] font-semibold text-[var(--color-primary)] hover:underline sm:inline-flex">
            {t('View detailed process', 'पूरी प्रक्रिया देखें')} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </MotionReveal>

        <div className="beg-hide-scrollbar -mx-4 mt-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          <ol className="relative flex min-w-[900px] items-start justify-between pt-1" aria-label={t('BuildEco workflow steps', 'BuildEco कार्यप्रवाह चरण')}>
            <div className="pointer-events-none absolute left-[5%] right-[5%] top-[15px] h-px bg-[var(--color-primary-border)]" aria-hidden />
            {BUILD_ECO_JOURNEY_STEPS.map((step, index) => (
              <li key={step.id} className="relative z-10 w-[105px] text-center">
                <Link to={route(step)} className="group flex flex-col items-center" data-testid={`journey-step-${step.id}`}>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-background)] text-[10px] font-extrabold text-[var(--color-primary)] transition group-hover:bg-[var(--color-primary)] group-hover:text-white">
                    {index + 1}
                  </span>
                  <span className="mt-2 block max-w-[96px] text-[10px] font-semibold leading-[1.35] text-[var(--color-text)]">{label(step)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};
