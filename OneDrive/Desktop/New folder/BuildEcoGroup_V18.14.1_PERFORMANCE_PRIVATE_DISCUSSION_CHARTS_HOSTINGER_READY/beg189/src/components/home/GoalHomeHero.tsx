import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, FileText, Flag, Hash, Users } from 'lucide-react';
import { PRIMARY_CTA_ROUTE } from '../../lib/homeGoals';
import { captureProductEvent, PRODUCT_EVENTS } from '../../lib/analytics';
import { useLanguage } from '../../contexts/LanguageContext';
import { ResponsiveMedia } from '../ui/ResponsiveMedia';
import { AnimatedHeadline, MotionReveal } from '../ui/MotionReveal';

const JOURNEY = [
  { label: 'Requirement', labelHi: 'आवश्यकता', icon: FileText },
  { label: 'Case ID', labelHi: 'केस आईडी', icon: Hash },
  { label: 'Expert', labelHi: 'विशेषज्ञ', icon: Users },
  { label: 'BOQ', labelHi: 'बीओक्यू', icon: Calculator },
  { label: 'Milestones', labelHi: 'माइलस्टोन', icon: Flag },
];

export const GoalHomeHero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="beg-reference-section overflow-hidden pt-5 sm:pt-7">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div className="beg-hero-depth relative overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-[#fbf8f1] shadow-[0_16px_42px_rgba(23,49,39,.08)] sm:rounded-[18px]">
          <div className="grid min-h-[390px] grid-cols-1 lg:grid-cols-[41%_59%]">
            <MotionReveal className="relative z-10 flex flex-col justify-center px-6 pb-5 pt-8 sm:px-9 lg:px-10 lg:pb-20 lg:pt-8">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[.22em] text-[var(--color-primary)]">
                {t('Plan · Build · Sustain', 'प्लान · बिल्ड · सस्टेन')}
              </p>
              <AnimatedHeadline
                className="beg-editorial-title max-w-[520px] text-[2.2rem] font-bold leading-[1.13] text-[var(--color-text)] sm:text-[2.45rem] lg:text-[2.55rem]"
                text={t('Build with clarity, from land to handover.', 'ज़मीन से हैंडओवर तक—पूरी स्पष्टता के साथ।')}
              />
              <p className="mt-4 max-w-[475px] text-[13px] leading-6 text-[var(--color-text-secondary)] sm:text-sm">
                {t(
                  'An independent project services and technology orchestration platform for a more sustainable tomorrow.',
                  'एक बेहतर और टिकाऊ भविष्य के लिए स्वतंत्र प्रोजेक्ट सेवाएं और टेक्नोलॉजी प्लेटफॉर्म।'
                )}
              </p>
              <Link
                to={PRIMARY_CTA_ROUTE}
                onClick={() => captureProductEvent(PRODUCT_EVENTS.HOMEPAGE_GOAL_SELECTED, { goal_id: 'primary_cta', destination: PRIMARY_CTA_ROUTE })}
                className="mt-6 inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] px-6 text-[12px] font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-hover)]"
                data-testid="cta-start-my-requirement"
              >
                {t('Start Requirement', 'आवश्यकता शुरू करें')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </MotionReveal>

            <MotionReveal className="beg-hero-photo relative min-h-[265px] lg:min-h-[390px]" delay={0.12}>
              <ResponsiveMedia
                assetKey="hero_reference_eco_villa"
                priority
                showBadge={false}
                aspectRatio="16:9"
                sizes="(max-width: 1024px) 100vw, 700px"
                className="hero-reference-media absolute inset-0 h-full rounded-none border-0"
                imageClassName="absolute inset-0 !h-full !w-full object-cover"
              />
              <div className="absolute right-5 top-5 max-w-[120px] border-l border-white/80 pl-3 text-[9px] font-bold uppercase leading-[1.55] tracking-[.18em] text-white drop-shadow-md sm:right-7 sm:top-7 sm:max-w-[145px] sm:text-[10px]">
                Better spaces<br />Brighter tomorrows
              </div>
            </MotionReveal>
          </div>

          <MotionReveal className="relative z-20 mx-4 -mt-4 mb-4 sm:mx-8 lg:absolute lg:bottom-4 lg:left-8 lg:right-24 lg:mx-0 lg:mb-0" delay={0.24}>
            <ol className="beg-hide-scrollbar flex min-h-[64px] items-center overflow-x-auto rounded-[12px] border border-[var(--color-border)] bg-[#fbfaf6]/96 px-2 shadow-lg backdrop-blur-xl sm:justify-between sm:px-5">
              {JOURNEY.map(({ label, labelHi, icon: Icon }, index) => (
                <li key={label} className="flex shrink-0 items-center">
                  <span className="flex min-w-[118px] items-center gap-2.5 px-2.5 py-3 sm:min-w-0">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent-warm)] text-white">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[10px] font-bold text-[var(--color-text)] sm:text-[11px]">{t(label, labelHi)}</span>
                  </span>
                  {index < JOURNEY.length - 1 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-subtle)]" />}
                </li>
              ))}
            </ol>
          </MotionReveal>
        </div>
      </div>
    </section>
  );
};
