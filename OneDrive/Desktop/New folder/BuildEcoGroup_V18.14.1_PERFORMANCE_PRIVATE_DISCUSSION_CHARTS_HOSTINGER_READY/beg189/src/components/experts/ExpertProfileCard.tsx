import React from 'react';
import { ArrowRight, MapPin, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ExpertProfile } from '../../lib/expertProfiles';
import { expertPhotoUrl } from '../../lib/expertProfiles';
import { captureAnalyticsEvent, PRODUCT_EVENTS } from '../../lib/analytics';
import { ROUTES } from '../../lib/routes';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ExpertProfileCardProps {
  expert: ExpertProfile;
  eyebrow?: string;
  compact?: boolean;
  onDiscuss?: () => void;
  ctaLabel?: string;
  trackingSource?: string;
}

export const ExpertProfileCard: React.FC<ExpertProfileCardProps> = ({
  expert,
  eyebrow = 'Verified public profile',
  compact = false,
  onDiscuss,
  ctaLabel = 'Discuss Requirement',
  trackingSource = 'profile_card',
}) => {
  const discussUrl = `${ROUTES.INITIATE_PROJECT}?service=${expert.ctaService ?? 'land'}&specialist=${encodeURIComponent(expert.name)}&privacy=case-only`;

  return (
    <article className="group overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg sm:rounded-[24px]">
      <div className="grid h-full grid-cols-1 sm:grid-cols-[200px_1fr]">
        <div className={`relative aspect-[5/4] overflow-hidden bg-[#DDE8EC] sm:aspect-auto ${compact ? 'sm:min-h-[250px]' : 'sm:min-h-[300px]'}`}>
          <img
            src={expertPhotoUrl(expert.photoUrl)}
            alt={`${expert.name} — ${expert.title}`}
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.025]"
            loading="lazy"
          />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.08em] text-[var(--color-primary)] shadow-sm backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified
          </span>
        </div>

        <div className="flex flex-col justify-between p-4 sm:p-6">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[var(--color-accent-warm)]">
              {eyebrow}
            </p>
            <h3 className="mt-2 text-xl font-black tracking-tight text-[var(--color-text)]">{expert.name}</h3>
            <p className="mt-1 text-sm font-bold text-[var(--color-primary)]">{expert.title}</p>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-[var(--color-text-secondary)]">
              {expert.designation}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="neutral" size="sm">{expert.experienceLabel}</Badge>
              <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                <MapPin className="h-3.5 w-3.5" />
                {expert.city}, {expert.state}
              </span>
            </div>

            <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--color-text-muted)] sm:mt-4 sm:line-clamp-none">
              {expert.intro[0]}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2 border-t border-[var(--color-border)] pt-4 sm:flex sm:flex-wrap">
            <Link to={ROUTES.EXPERT_PROFILE(expert.slug)} className="w-full sm:w-auto">
              <Button variant="secondary" size="sm" className="min-h-11 w-full">View Full Profile</Button>
            </Link>
            {onDiscuss ? (
              <Button
                variant="primary"
                size="sm"
                className="min-h-11 w-full"
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                onClick={() => {
                  captureAnalyticsEvent(PRODUCT_EVENTS.EXPERT_MATCH_STARTED, {
                    profile_slug: expert.slug,
                    source: trackingSource,
                  });
                  onDiscuss();
                }}
              >
                {ctaLabel}
              </Button>
            ) : (
              <Link to={discussUrl} className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="sm"
                  className="min-h-11 w-full"
                  rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                  onClick={() => captureAnalyticsEvent(PRODUCT_EVENTS.EXPERT_MATCH_STARTED, {
                    profile_slug: expert.slug,
                    source: trackingSource,
                  })}
                >
                  {ctaLabel}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
