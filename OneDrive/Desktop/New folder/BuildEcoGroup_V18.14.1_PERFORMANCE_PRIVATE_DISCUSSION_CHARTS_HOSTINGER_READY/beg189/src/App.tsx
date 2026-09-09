import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicLayout } from './layouts/PublicLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ROUTES } from './lib/routes';
import { AnalyticsConsent } from './components/AnalyticsConsent';
import { capturePageView } from './lib/analytics';
import { LanguageProvider } from './contexts/LanguageContext';
import { PageSeo } from './components/seo/PageSeo';

const lazyPage = <T extends Record<string, React.ComponentType<any>>>(loader: () => Promise<T>, name: keyof T) =>
  lazy(async () => ({ default: (await loader())[name] }));

import { HomePage } from './pages/HomePage';
const AboutPage = lazyPage(() => import('./pages/AboutPage'), 'AboutPage');
const PillarsPage = lazyPage(() => import('./pages/PillarsPage'), 'PillarsPage');
const ServicesPage = lazyPage(() => import('./pages/ServicesPage'), 'ServicesPage');
const ConsultantsPage = lazyPage(() => import('./pages/ConsultantsPage'), 'ConsultantsPage');
const PropertyPage = lazyPage(() => import('./pages/PropertyPage'), 'PropertyPage');
const ExpertProfilePage = lazyPage(() => import('./pages/ExpertProfilePage'), 'ExpertProfilePage');
const TechnologyPage = lazyPage(() => import('./pages/TechnologyPage'), 'TechnologyPage');
const ContactPage = lazyPage(() => import('./pages/ContactPage'), 'ContactPage');
const InitiateProjectPage = lazyPage(() => import('./pages/InitiateProjectPage'), 'InitiateProjectPage');
const OnboardingPage = lazyPage(() => import('./pages/OnboardingPage'), 'OnboardingPage');
const LandDevelopmentPage = lazyPage(() => import('./pages/LandDevelopmentPage'), 'LandDevelopmentPage');
const ConstructionManagementPage = lazyPage(() => import('./pages/ConstructionManagementPage'), 'ConstructionManagementPage');
const BOQEstimationPage = lazyPage(() => import('./pages/BOQEstimationPage'), 'BOQEstimationPage');
const SolarUtilityPage = lazyPage(() => import('./pages/SolarUtilityPage'), 'SolarUtilityPage');
const WaterLandingPage = lazyPage(() => import('./pages/WaterLandingPage'), 'WaterLandingPage');
const LocalServicePage = lazyPage(() => import('./pages/LocalServicePage'), 'LocalServicePage');
const ProjectsPortfolioPage = lazyPage(() => import('./pages/ProjectsPortfolioPage'), 'ProjectsPortfolioPage');
const BlogResearchPage = lazyPage(() => import('./pages/BlogResearchPage'), 'BlogResearchPage');
const DashboardHubPage = lazyPage(() => import('./pages/DashboardHubPage'), 'DashboardHubPage');
const MessagesPage = lazyPage(() => import('./pages/MessagesPage'), 'MessagesPage');
const SettingsPage = lazyPage(() => import('./pages/SettingsPage'), 'SettingsPage');
const CustomerDashboardPage = lazyPage(() => import('./pages/CustomerDashboardPage'), 'CustomerDashboardPage');
const ConsultantDashboardPage = lazyPage(() => import('./pages/ConsultantDashboardPage'), 'ConsultantDashboardPage');
const AdminDashboardPage = lazyPage(() => import('./pages/AdminDashboardPage'), 'AdminDashboardPage');
const SuperAdminDashboardPage = lazyPage(() => import('./pages/SuperAdminDashboardPage'), 'SuperAdminDashboardPage');
const EmployeeDashboardPage = lazyPage(() => import('./pages/EmployeeDashboardPage'), 'EmployeeDashboardPage');
const CommercialOutsourcingSuitePage = lazyPage(() => import('./pages/CommercialOutsourcingSuitePage'), 'CommercialOutsourcingSuitePage');
const ProjectDetailPage = lazyPage(() => import('./pages/ProjectDetailPage'), 'ProjectDetailPage');
const TrackRequestPage = lazyPage(() => import('./pages/TrackRequestPage'), 'TrackRequestPage');
const LoginPage = lazyPage(() => import('./pages/LoginPage'), 'LoginPage');
const CustomerRegisterPage = lazyPage(() => import('./pages/CustomerRegisterPage'), 'CustomerRegisterPage');
const NotFoundPage = lazyPage(() => import('./pages/NotFoundPage'), 'NotFoundPage');

const ServiceExperiencePage = React.lazy(() => import('./pages/ServiceExperiencePage').then(m => ({ default: m.ServiceExperiencePage })));
const RouteLoadingState = () => (
  <div className="flex min-h-[55vh] items-center justify-center bg-[var(--color-background)]" role="status" aria-live="polite">
    <div className="text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]" />
      <p className="mt-4 text-xs font-bold uppercase tracking-[.14em] text-[var(--color-brand-brown)]">Loading workspace</p>
    </div>
  </div>
);

// Create a query client instance for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Scroll to top helper component on page transition
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } else {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [pathname, hash]);

  useEffect(() => {
    capturePageView(`${pathname}${hash}`);
  }, [pathname, hash]);

  return null;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider><AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <PageSeo />
          <AnalyticsConsent />
          <Suspense fallback={<RouteLoadingState />}><Routes>
            
            {/* Public Marketing & Portal Routes */}
            <Route element={<PublicLayout />}>
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.ABOUT} element={<AboutPage />} />
              <Route path={ROUTES.PILLARS} element={<PillarsPage />} />
              <Route path={ROUTES.SERVICES} element={<ServicesPage />} />
              <Route path={ROUTES.CONSULTANTS} element={<ConsultantsPage />} />
              <Route path="/experts/:slug" element={<ExpertProfilePage />} />
              <Route path={ROUTES.PROPERTY} element={<PropertyPage />} />
              <Route path={ROUTES.TECHNOLOGY} element={<TechnologyPage />} />
              <Route path={ROUTES.CONTACT} element={<ContactPage />} />
              <Route path={ROUTES.INITIATE_PROJECT} element={<InitiateProjectPage />} />
              <Route path={ROUTES.ONBOARDING} element={<OnboardingPage />} />
              <Route path={ROUTES.CONSULTANTS_JOIN} element={<OnboardingPage />} />

              {/* Dedicated SEO & Regional Service Landings */}
              <Route path={ROUTES.LAND_DEVELOPMENT} element={<LandDevelopmentPage />} />
              <Route path={ROUTES.LAND_FEASIBILITY} element={<LandDevelopmentPage />} />
              <Route path={ROUTES.CONSTRUCTION_MANAGEMENT} element={<ConstructionManagementPage />} />
              <Route path={ROUTES.PROJECT_MONITORING} element={<ConstructionManagementPage />} />
              <Route path={ROUTES.BOQ_ESTIMATION} element={<BOQEstimationPage />} />
              <Route path={ROUTES.SOLAR} element={<SolarUtilityPage />} />
              <Route path={ROUTES.WASTE_MANAGEMENT} element={<ServiceExperiencePage serviceId="waste" />} />
              <Route path={ROUTES.MAINTENANCE_AMC} element={<ServiceExperiencePage serviceId="maintenance" />} />
              <Route path={ROUTES.GIS} element={<ServiceExperiencePage serviceId="gis" />} />
              <Route path={ROUTES.MATERIAL_PROCUREMENT} element={<ServiceExperiencePage serviceId="material" />} />
              <Route path={ROUTES.INTERIOR} element={<ServiceExperiencePage serviceId="interior" />} />
              <Route path={ROUTES.VASTU} element={<ServiceExperiencePage serviceId="vastu" />} />
              <Route path={ROUTES.WORKERS} element={<ServiceExperiencePage serviceId="workers" />} />
              <Route path={ROUTES.EQUIPMENT} element={<ServiceExperiencePage serviceId="equipment" />} />
              <Route path={ROUTES.WATER_TREATMENT} element={<WaterLandingPage />} />
              <Route path="/water" element={<WaterLandingPage />} />
              <Route path="/water-landing" element={<WaterLandingPage />} />
              <Route path={ROUTES.LOCAL_LUCKNOW} element={<LocalServicePage cityKeyOverride="lucknow" />} />
              <Route path={ROUTES.LOCAL_GORAKHPUR} element={<LocalServicePage cityKeyOverride="gorakhpur" />} />
              <Route path="/services/:city" element={<LocalServicePage />} />
              <Route path={ROUTES.PROJECTS} element={<ProjectsPortfolioPage />} />
              <Route path={ROUTES.RESEARCH} element={<BlogResearchPage />} />
              <Route path={ROUTES.BLOG} element={<BlogResearchPage />} />
              <Route path={ROUTES.TRACK_REQUEST} element={<TrackRequestPage />} />
              <Route path="/track/:id" element={<TrackRequestPage />} />

              <Route 
                path="/projects/:id" 
                element={
                  <ProjectDetailPage />
                } 
              />
              <Route 
                path="/cases/:id" 
                element={
                  <ProjectDetailPage />
                } 
              />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Production Authentication Routes */}
            <Route element={<AuthLayout />}>
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.REGISTER} element={<CustomerRegisterPage />} />
            </Route>

            {/* Protected Role-Based Dashboard Routes */}
            <Route 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Customer Primary Console */}
              <Route 
                path={ROUTES.DASHBOARD} 
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'CONSULTANT', 'EMPLOYEE', 'ADMIN', 'SUPER_ADMIN', 'VENDOR']}>
                    <DashboardHubPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path={ROUTES.USER_DASHBOARD} 
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'VENDOR', 'CONSULTANT', 'EMPLOYEE', 'ADMIN', 'SUPER_ADMIN']}>
                    <DashboardHubPage />
                  </ProtectedRoute>
                } 
              />

              {/* Consultant Specialist Console */}
              <Route 
                path={ROUTES.CONSULTANT_DASHBOARD} 
                element={
                  <ProtectedRoute allowedRoles={['CONSULTANT', 'ADMIN', 'SUPER_ADMIN']}>
                    <ConsultantDashboardPage />
                  </ProtectedRoute>
                } 
              />

              {/* Operations Coordinator Console */}
              <Route 
                path="/dashboard/employee" 
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN']}>
                    <EmployeeDashboardPage />
                  </ProtectedRoute>
                } 
              />

              {/* Platform Admin Operations Center */}
              <Route 
                path={ROUTES.ADMIN_DASHBOARD} 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } 
              />

              {/* Super Admin Directorate Command Center */}
              <Route 
                path="/dashboard/super-admin" 
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                    <SuperAdminDashboardPage />
                  </ProtectedRoute>
                } 
              />

              {/* Commercial & Outsourcing Engine Suite */}
              <Route 
                path={ROUTES.COMMERCIAL_SUITE} 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'EMPLOYEE', 'CONSULTANT']}>
                    <CommercialOutsourcingSuitePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path={ROUTES.MARKETPLACE} 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'EMPLOYEE', 'CONSULTANT', 'CUSTOMER']}>
                    <CommercialOutsourcingSuitePage />
                  </ProtectedRoute>
                } 
              />

              {/* Case Repository & Documents */}
              <Route path={ROUTES.CASES} element={<DashboardHubPage />} />
              <Route path={ROUTES.DOCUMENTS} element={<DashboardHubPage />} />
              <Route path={ROUTES.MESSAGES} element={<MessagesPage />} />
              <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
            </Route>

          </Routes></Suspense>
        </BrowserRouter>
      </AuthProvider></LanguageProvider>
    </QueryClientProvider>
  );
}
