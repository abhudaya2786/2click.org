import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { ABBHUDAYA_PRATAP_PROFILE, ABHISHEK_MISHRA_PROFILE } from '../../lib/expertProfiles';
import { MotionReveal } from '../ui/MotionReveal';

interface FeaturedConsultantsSectionProps {
  onStartRequirement: (consultantName: string) => void;
}

const FEATURED = [
  {
    expert: ABBHUDAYA_PRATAP_PROFILE,
    role: 'Director & Ecosystem Lead',
    summary: 'Connecting people, expertise and technology to enable better projects and more sustainable outcomes.',
    tags: ['Strategy', 'Project Orchestration', 'Sustainable Development'],
  },
  {
    expert: ABHISHEK_MISHRA_PROFILE,
    role: 'Property Expert & Strategic Advisor',
    summary: 'Strategic insight for land, property potential, market intelligence and long-term value.',
    tags: ['Property Advisory', 'Market Intelligence', 'Investment Strategy'],
  },
];

export const FeaturedConsultantsSection: React.FC<FeaturedConsultantsSectionProps> = ({ onStartRequirement }) => (
  <section id="featured-consultants" className="beg-reference-section py-8 sm:py-10" data-testid="featured-consultants-section">
    <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
      <MotionReveal className="flex items-end justify-between gap-4">
        <div>
          <h2 className="beg-editorial-title text-[1.6rem] font-bold text-[var(--color-text)] sm:text-[1.95rem]">Leadership &amp; Advisory</h2>
          <p className="mt-1 text-[11px] text-[var(--color-text-muted)] sm:text-xs">Experienced professionals. Independent perspectives. Better outcomes.</p>
        </div>
        <Link to={ROUTES.CONSULTANTS} className="hidden items-center gap-1.5 text-[11px] font-semibold text-[var(--color-primary)] hover:underline sm:inline-flex">
          Meet our consultants <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </MotionReveal>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {FEATURED.map(({ expert, role, summary, tags }, index) => (
          <MotionReveal key={expert.id} delay={index * 0.08}>
            <article className="group grid min-h-[148px] grid-cols-[112px_1fr] overflow-hidden rounded-[10px] border border-[var(--color-border)] bg-white shadow-[0_3px_10px_rgba(23,49,39,.05)] sm:grid-cols-[138px_1fr]">
              <Link to={ROUTES.EXPERT_PROFILE(expert.slug)} className="block overflow-hidden bg-[var(--color-surface-muted)]">
                <img src={expert.photoUrl} alt={expert.name} className="h-full min-h-[148px] w-full object-cover object-top transition duration-500 group-hover:scale-[1.035]" loading="lazy" />
              </Link>
              <div className="flex min-w-0 flex-col justify-between p-3.5 sm:p-4">
                <div>
                  <Link to={ROUTES.EXPERT_PROFILE(expert.slug)} className="hover:text-[var(--color-primary)]">
                    <h3 className="beg-editorial-title text-[15px] font-bold leading-tight text-[var(--color-text)] sm:text-base">{expert.name}</h3>
                  </Link>
                  <p className="mt-0.5 text-[9px] font-semibold text-[var(--color-text-muted)] sm:text-[10px]">{role}</p>
                  <p className="mt-2 hidden text-[10px] leading-[1.55] text-[var(--color-text-secondary)] sm:block">{summary}</p>
                </div>
                <div className="mt-2.5 flex items-end justify-between gap-2">
                  <div className="flex min-w-0 flex-wrap gap-1">
                    {tags.slice(0, 2).map((tag) => <span key={tag} className="rounded-full bg-[var(--color-surface-muted)] px-2 py-1 text-[8px] font-semibold text-[var(--color-text-secondary)]">{tag}</span>)}
                  </div>
                  <button type="button" onClick={() => onStartRequirement(expert.name)} className="beg-copper-arrow" aria-label={`Discuss a project with ${expert.name}`}>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          </MotionReveal>
        ))}
      </div>
    </div>
  </section>
);
