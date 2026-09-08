import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import { PageContainer } from '../components/ui/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Compass, ArrowLeft, Home, FileQuestion } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-20 sm:py-32 flex items-center justify-center arch-hero-engineering min-h-[60vh]">
      <PageContainer>
        <div className="max-w-xl mx-auto text-center space-y-6">
          
          <div className="w-16 h-16 rounded-2xl bg-[#EAF4F8] text-[var(--color-brand-brown)] flex items-center justify-center mx-auto border border-[#C6DEE8]">
            <FileQuestion className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="font-mono-code text-sm font-extrabold text-[var(--color-brand-brown)] tracking-wider uppercase">
              ERROR 404
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)]">
              Page Not Found
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-md mx-auto">
              The project module, case file, or page you requested could not be located in the platform registry.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to={ROUTES.HOME}>
              <Button variant="primary" size="lg" leftIcon={<Home className="w-4 h-4" />}>
                Return to Homepage
              </Button>
            </Link>
            <Link to={ROUTES.PILLARS}>
              <Button variant="secondary" size="lg" rightIcon={<Compass className="w-4 h-4" />}>
                Explore 5 Pillars
              </Button>
            </Link>
          </div>

          <div className="pt-6 border-t border-[var(--color-border)] text-xs text-[var(--color-text-subtle)]">
            BuildEcoGroup V18.8 Platform Routing
          </div>

        </div>
      </PageContainer>
    </div>
  );
};
