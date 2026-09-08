import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, FileCheck2, Leaf, Scale, Sparkles, Users } from 'lucide-react';
import { ExpertProfileCard } from '../components/experts/ExpertProfileCard';
import { MotionReveal } from '../components/ui/MotionReveal';
import { ResponsiveMedia } from '../components/ui/ResponsiveMedia';
import { ABBHUDAYA_PRATAP_PROFILE, ABHISHEK_MISHRA_PROFILE } from '../lib/expertProfiles';
import { ROUTES } from '../lib/routes';

const PILLARS = [
  { title: 'People', desc: 'Right expertise', icon: Users },
  { title: 'Process', desc: 'Structured delivery', icon: FileCheck2 },
  { title: 'Technology', desc: 'Smarter decisions', icon: Cpu },
  { title: 'Sustainability', desc: 'Long-term value', icon: Leaf },
  { title: 'Impact', desc: 'Better communities', icon: Sparkles },
];

const PRINCIPLES = [
  ['Independent orchestration', 'Requirements, expert review, commercial comparison and delivery stay visibly structured to reduce conflicts of interest.'],
  ['Comparable decisions', 'Clear scopes, BOQs and milestones make technical and commercial proposals easier to compare.'],
  ['Accountable network', 'Suitable specialists are matched to a Case ID with controlled information sharing and a traceable record.'],
];

export const AboutPage: React.FC = () => (
  <main className="min-h-screen overflow-x-hidden bg-[var(--color-background)]">
    <section className="beg-reference-section py-5 sm:py-7">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-[#f8f5ee] shadow-[0_12px_34px_rgba(23,49,39,.07)] lg:grid-cols-[57%_43%]">
          <MotionReveal className="flex flex-col justify-center p-6 sm:p-8 lg:p-9">
            <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[var(--color-primary)]">People · Process · Possibilities</p>
            <h1 className="beg-editorial-title mt-2 text-[2rem] font-bold leading-tight text-[var(--color-text)] sm:text-[2.7rem]">About BuildEcoGroup</h1>
            <p className="mt-2 text-[12px] font-semibold text-[var(--color-text-secondary)]">An independent platform for a more sustainable built environment.</p>
            <p className="mt-4 max-w-2xl text-xs leading-6 text-[var(--color-text-muted)] sm:text-[13px]">
              We bring together people, processes and technology to help individuals, businesses and institutions plan, build and sustain better spaces. BuildEcoGroup is an independent project-services and technology orchestration platform, enabling clarity, collaboration and confidence across the property and built-environment lifecycle.
            </p>
          </MotionReveal>
          <MotionReveal className="relative min-h-[245px] sm:min-h-[310px]" delay={0.12}>
            <ResponsiveMedia assetKey="hero_reference_eco_villa" priority showBadge={false} aspectRatio="16:9" className="hero-reference-media absolute inset-0 h-full rounded-none border-0" imageClassName="h-full object-cover" />
            <p className="absolute bottom-5 right-5 max-w-[128px] border-l border-white/90 pl-3 text-[9px] font-bold uppercase leading-[1.55] tracking-[.18em] text-white drop-shadow-md">People<br />Ideas<br />Platforms<br />A greener tomorrow</p>
          </MotionReveal>
        </div>
      </div>
    </section>

    <section className="beg-reference-section py-7 sm:py-9">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <MotionReveal>
          <h2 className="beg-editorial-title text-[1.6rem] font-bold text-[var(--color-text)] sm:text-[1.95rem]">Our Five Pillars</h2>
          <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">The connected values behind every BuildEcoGroup decision.</p>
        </MotionReveal>
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          {PILLARS.map(({ title, desc, icon: Icon }, index) => (
            <MotionReveal key={title} delay={index * 0.055}>
              <article className="h-full rounded-[9px] border border-[var(--color-border)] bg-white p-3.5 shadow-[0_3px_10px_rgba(23,49,39,.04)]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#efe2d6] text-[var(--color-accent-warm)]"><Icon className="h-3.5 w-3.5" /></span>
                <h3 className="beg-editorial-title mt-3 text-[13px] font-bold text-[var(--color-text)]">{title}</h3>
                <p className="mt-1 text-[9px] text-[var(--color-text-muted)]">{desc}</p>
              </article>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>

    <section className="beg-reference-section py-8 sm:py-11">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <MotionReveal className="max-w-2xl">
          <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[var(--color-accent-warm)]">How we work</p>
          <h2 className="beg-editorial-title mt-2 text-[1.65rem] font-bold text-[var(--color-text)] sm:text-2xl">A practical operating model built around clarity</h2>
        </MotionReveal>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {PRINCIPLES.map(([title, desc], index) => (
            <MotionReveal key={title} delay={index * 0.07}>
              <article className="h-full rounded-[10px] border border-[var(--color-border)] bg-white p-5">
                <div className="flex items-center justify-between"><Scale className="h-5 w-5 text-[var(--color-primary)]" /><span className="text-[10px] font-bold text-[var(--color-border-strong)]">0{index + 1}</span></div>
                <h3 className="beg-editorial-title mt-4 text-base font-bold text-[var(--color-text)]">{title}</h3>
                <p className="mt-2 text-[11px] leading-5 text-[var(--color-text-muted)]">{desc}</p>
              </article>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>

    <section className="beg-reference-section py-8 sm:py-11">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div><h2 className="beg-editorial-title text-[1.65rem] font-bold text-[var(--color-text)] sm:text-2xl">Leadership &amp; Advisory</h2><p className="mt-1 text-[11px] text-[var(--color-text-muted)]">Experienced professionals. Independent perspectives.</p></div>
          <Link to={ROUTES.CONSULTANTS} className="hidden items-center gap-1 text-[11px] font-bold text-[var(--color-primary)] hover:underline sm:inline-flex">Meet our consultants <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {[ABBHUDAYA_PRATAP_PROFILE, ABHISHEK_MISHRA_PROFILE].map((expert) => <ExpertProfileCard key={expert.id} expert={expert} compact eyebrow="Leadership & advisory" />)}
        </div>
      </div>
    </section>

    <section className="bg-[#e6eee8] py-10 text-center sm:py-13">
      <div className="mx-auto max-w-2xl px-4">
        <FileCheck2 className="mx-auto h-6 w-6 text-[var(--color-primary)]" />
        <h2 className="beg-editorial-title mt-3 text-2xl font-bold text-[var(--color-text)]">Start with one clear requirement.</h2>
        <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">Your Case ID keeps specialists, documents and milestones connected from first brief to handover.</p>
        <Link to={ROUTES.SUBMIT_REQUIREMENT} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--color-primary)] px-5 text-xs font-bold text-white hover:bg-[var(--color-primary-hover)]">Submit Project Requirement <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </section>
  </main>
);
