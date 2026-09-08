import React, { Suspense, lazy } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/navigation/Header';
import { Footer } from '../components/marketing/Footer';
import { MobileBottomNav } from '../components/navigation/MobileBottomNav';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { RoutePhotoRibbon } from '../components/marketing/RoutePhotoRibbon';

const BuildEcoAssistant = lazy(() =>
  import('../components/assistant/BuildEcoAssistant').then((m) => ({ default: m.BuildEcoAssistant })),
);

export const PublicLayout: React.FC = () => {
  return (
    <div className="arch-public-shell min-h-screen flex flex-col selection:bg-[var(--color-primary)] selection:text-white">
      {/* Sticky Main Header */}
      <Header />

      {/* Main Routed Page Content wrapped in Error Boundary */}
      <main className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
        <ErrorBoundary>
          <RoutePhotoRibbon />
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Mobile Bottom Navigation for quick navigation */}
      <MobileBottomNav />
      <Suspense fallback={null}>
        <BuildEcoAssistant />
      </Suspense>
    </div>
  );
};
