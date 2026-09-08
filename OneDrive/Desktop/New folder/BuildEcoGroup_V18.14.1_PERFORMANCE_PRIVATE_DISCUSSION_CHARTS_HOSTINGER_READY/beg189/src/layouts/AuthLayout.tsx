import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { BuildEcoGroupLogo } from '../components/brand/BuildEcoGroupLogo';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface-muted)] text-[var(--color-text)]">
      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-[1340px] w-full mx-auto">
        <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
          <BuildEcoGroupLogo variant="full" theme="light" className="h-10 sm:h-12 w-auto" />
        </Link>

        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Center Box */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-5xl">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="py-6 text-center text-xs text-[var(--color-text-subtle)]">
        BuildEcoGroup V18.14.1 · Secure Project Access
      </footer>
    </div>
  );
};
