import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { Button } from '../ui/Button';
import { Send, ArrowRight, ShieldCheck } from 'lucide-react';

export const CTASection: React.FC = () => {
  return (
    <section className="arch-navy-band py-14 sm:py-20 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-arch-accent-light) 1px, transparent 1px), linear-gradient(90deg, var(--color-arch-accent-light) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
        aria-hidden="true"
      />

      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface)]/10 border border-white/20 text-xs font-semibold tracking-wide text-white">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-arch-accent-light)]" />
            <span>Independent Platform Orchestration</span>
          </div>

          <h2 className="text-display text-white text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Ready to Structure Your Next Project?
          </h2>

          <p className="text-sm sm:text-base text-[var(--color-arch-muted-on-navy)] leading-relaxed max-w-2xl mx-auto">
            Submit your site details, required technical disciplines, and target timeline. BuildEcoGroup coordinators will structure your standardized Case File and match vetted independent specialists.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to={ROUTES.SUBMIT_REQUIREMENT}>
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                rightIcon={<Send className="w-4 h-4 text-[var(--color-primary)]" />}
                className="bg-[var(--color-surface)] text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)] border-none font-bold"
              >
                Submit Your Requirement
              </Button>
            </Link>

            <Link to={ROUTES.CONSULTANTS}>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                className="border-white/40 text-white hover:bg-[var(--color-surface)]/10 font-semibold"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Browse Consultant Network
              </Button>
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--color-arch-accent-light)]">
            <span>✓ No Contractor Upcharge</span>
            <span>✓ Confidential Land Files</span>
            <span>✓ Transparent BOQ</span>
          </div>
        </div>
      </div>
    </section>
  );
};
