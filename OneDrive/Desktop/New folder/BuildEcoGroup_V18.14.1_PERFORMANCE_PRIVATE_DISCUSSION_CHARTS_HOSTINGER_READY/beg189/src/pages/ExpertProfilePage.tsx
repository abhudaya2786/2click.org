import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Building2,
  Compass,
  Layers,
  MapPin,
  Quote,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';
import { PageContainer } from '../components/ui/PageContainer';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ROUTES } from '../lib/routes';
import { expertPhotoUrl, getExpertBySlug } from '../lib/expertProfiles';
import { captureAnalyticsEvent, PRODUCT_EVENTS } from '../lib/analytics';
import { NotFoundPage } from './NotFoundPage';

const HIGHLIGHT_ICONS = {
  chart: BarChart3,
  compass: Compass,
  trending: TrendingUp,
  shield: Shield,
  layers: Layers,
  users: Users,
};

export const ExpertProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const expert = slug ? getExpertBySlug(slug) : undefined;

  useEffect(() => {
    if (!expert) return;
    captureAnalyticsEvent(PRODUCT_EVENTS.EXPERT_PROFILE_VIEWED, {
      profile_slug: expert.slug,
      profile_type: expert.kind,
    });
  }, [expert]);

  if (!expert) {
    return <NotFoundPage />;
  }

  const discussUrl = `${ROUTES.INITIATE_PROJECT}?service=${expert.ctaService ?? 'land'}&specialist=${encodeURIComponent(expert.name)}&privacy=case-only`;
  const badgeLabel =
    expert.kind === 'property' ? 'Property Expert & Strategic Advisor' : 'Leadership & Ecosystem Vision';

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--color-background)] py-5 sm:py-12">
      <PageContainer>
        <div className="mb-4 sm:mb-6">
          <Link to={ROUTES.CONSULTANTS} className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
            ← Back to Consultant Network
          </Link>
        </div>

        <header className="grid grid-cols-1 gap-5 overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm sm:gap-8 sm:rounded-[28px] sm:p-7 lg:grid-cols-12 lg:gap-10 lg:p-9">
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[#E8EEF2] shadow-xs">
              <img
                src={expertPhotoUrl(expert.photoUrl)}
                alt={`${expert.name} — professional portrait`}
                className="aspect-square w-full object-cover object-top sm:aspect-[4/5]"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-3.5 sm:space-y-4 lg:col-span-7">
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary" size="md" icon={<Building2 className="h-3.5 w-3.5" />}>
                {badgeLabel}
              </Badge>
              <Badge variant="neutral" size="md">Public professional profile</Badge>
            </div>
            <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight text-[var(--color-text)] sm:text-4xl">
              {expert.name}
            </h1>
            <p className="text-base font-semibold leading-6 text-[var(--color-primary)] sm:text-lg">{expert.designation}</p>
            <p className="text-sm font-medium text-[var(--color-text)]">{expert.title}</p>
            <Badge variant="neutral" size="md">{expert.experienceLabel}</Badge>
            <p className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
              <MapPin className="h-4 w-4 shrink-0" />
              {expert.city}, {expert.state}
            </p>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {expert.intro.map((para) => (
                <p key={para.slice(0, 40)}>{para}</p>
              ))}
            </div>
            <p className="rounded-xl border border-[var(--color-primary-border)] bg-[var(--color-primary-subtle)] px-4 py-3 text-xs leading-5 text-[var(--color-text-muted)]">
              Personal phone and email details are not shared with the consultant. Discussion stays inside the protected Case ID and Messages workspace.
            </p>
            <div className="grid grid-cols-1 gap-2 pt-2 sm:flex sm:flex-wrap">
              <Link to={discussUrl} className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  onClick={() => captureAnalyticsEvent(PRODUCT_EVENTS.EXPERT_MATCH_STARTED, {
                    profile_slug: expert.slug,
                    source: 'profile_hero',
                  })}
                >
                  {expert.ctaLabel}
                </Button>
              </Link>
              {expert.kind === 'property' ? (
                <Link to={ROUTES.PROPERTY} className="w-full sm:w-auto">
                  <Button variant="secondary" size="md" className="w-full">Explore Property Services</Button>
                </Link>
              ) : (
                <Link to={ROUTES.ABOUT} className="w-full sm:w-auto">
                  <Button variant="secondary" size="md" className="w-full">About BuildEcoGroup</Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        <section className="mt-10 grid grid-cols-1 gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4" data-testid="expert-highlight-cards">
          {expert.highlightCards.map((card) => {
            const Icon = HIGHLIGHT_ICONS[card.icon];
            return (
              <article
                key={card.title}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs sm:p-5"
              >
                <div className="mb-3 inline-flex rounded-xl bg-[var(--color-primary-subtle)] p-2.5 text-[var(--color-primary)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-base font-bold text-[var(--color-text)]">{card.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{card.description}</p>
              </article>
            );
          })}
        </section>

        {expert.experienceHighlights && (
          <section className="mt-11 space-y-5 sm:mt-14 sm:space-y-6">
            <h2 className="text-xl font-extrabold text-[var(--color-text)] sm:text-2xl">Experience Highlights</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {expert.experienceHighlights.map((item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
                >
                  <h3 className="text-sm font-bold text-[var(--color-text)]">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{item.description}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {expert.mission && (
          <section className="mt-11 rounded-2xl border border-[var(--color-primary-border)] bg-[var(--color-primary-subtle)] p-5 sm:mt-14 sm:p-6">
            <h2 className="text-lg font-bold text-[var(--color-text)]">Our Mission</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-primary)]">{expert.mission}</p>
          </section>
        )}

        {expert.ecosystemPillars && (
          <section className="mt-11 space-y-4 sm:mt-14">
            <h2 className="text-xl font-extrabold text-[var(--color-text)] sm:text-2xl">Integrated Ecosystem</h2>
            <div className="flex flex-wrap gap-2">
              {expert.ecosystemPillars.map((pillar) => (
                <span
                  key={pillar}
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)]"
                >
                  {pillar}
                </span>
              ))}
            </div>
          </section>
        )}

        {expert.coreValues && (
          <section className="mt-11 space-y-5 sm:mt-14 sm:space-y-6">
            <h2 className="text-xl font-extrabold text-[var(--color-text)] sm:text-2xl">Core Values</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {expert.coreValues.map((item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4"
                >
                  <h3 className="text-sm font-bold text-[var(--color-brand-brown)]">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{item.description}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {expert.coreExpertise && (
          <section className="mt-11 space-y-5 sm:mt-14 sm:space-y-6">
            <h2 className="text-xl font-extrabold text-[var(--color-text)] sm:text-2xl">Core Expertise</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {expert.coreExpertise.map((item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
                >
                  <h3 className="text-sm font-bold text-[var(--color-text)]">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{item.description}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {expert.keyMarkets && (
          <section className="mt-11 rounded-2xl border border-[var(--color-primary-border)] bg-[var(--color-primary-subtle)] p-5 sm:mt-14 sm:p-6">
            <h2 className="text-lg font-bold text-[var(--color-text)]">Key Markets</h2>
            <p className="mt-3 text-sm font-medium text-[var(--color-primary)]">
              {expert.keyMarkets.join(' • ')}
            </p>
          </section>
        )}

        {expert.strategicGuidance && (
          <section className="mt-11 space-y-5 sm:mt-14 sm:space-y-6">
            <h2 className="text-xl font-extrabold text-[var(--color-text)] sm:text-2xl">Strategic Guidance</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {expert.strategicGuidance.map((item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4"
                >
                  <h3 className="text-sm font-bold text-[var(--color-brand-brown)]">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{item.description}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <blockquote className="mt-11 flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:mt-14 sm:flex-row sm:gap-4 sm:p-8">
          <Quote className="h-8 w-8 shrink-0 text-[var(--color-primary)] opacity-80" />
          <p className="text-base font-medium italic leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
            “{expert.quote}”
          </p>
        </blockquote>

        <div className="mt-10 grid grid-cols-1 gap-2 border-t border-[var(--color-border)] pt-6 sm:flex sm:flex-wrap sm:gap-3 sm:pt-8">
          <Link to={discussUrl} className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => captureAnalyticsEvent(PRODUCT_EVENTS.EXPERT_MATCH_STARTED, {
                profile_slug: expert.slug,
                source: 'profile_footer',
              })}
            >
              {expert.ctaLabel}
            </Button>
          </Link>
          <Link to={ROUTES.CONSULTANTS} className="w-full sm:w-auto">
            <Button variant="secondary" size="md" className="w-full">View Consultant Network</Button>
          </Link>
        </div>
      </PageContainer>
    </div>
  );
};
