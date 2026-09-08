import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CustomerDashboardPage } from './CustomerDashboardPage';
import { ConsultantDashboardPage } from './ConsultantDashboardPage';
import { AdminDashboardPage } from './AdminDashboardPage';
import { EmployeeDashboardPage } from './EmployeeDashboardPage';
import { SuperAdminDashboardPage } from './SuperAdminDashboardPage';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../lib/routes';

// Role-authoritative workspace hub for /dashboard/cases and /dashboard/documents.
// Previously exposed a client-side role switcher that let any signed-in user preview
// admin/consultant consoles — removed to enforce server-side RBAC in the UI.
export const DashboardHubPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const focusDocuments = location.pathname === ROUTES.DOCUMENTS;

  if (!user) return null;

  // Keep /dashboard as the customer home, but canonicalize every privileged
  // identity to its own protected workspace. This also prevents a stale
  // post-login return path from briefly showing the customer console.
  if (location.pathname === ROUTES.DASHBOARD || location.pathname === ROUTES.USER_DASHBOARD) {
    if (user.role === 'SUPER_ADMIN') return <Navigate to={ROUTES.SUPER_ADMIN_DASHBOARD} replace />;
    if (user.role === 'ADMIN') return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    if (user.role === 'EMPLOYEE') return <Navigate to={ROUTES.EMPLOYEE_DASHBOARD} replace />;
    if (user.role === 'CONSULTANT') return <Navigate to={ROUTES.CONSULTANT_DASHBOARD} replace />;
  }

  if (location.pathname === ROUTES.DASHBOARD && (user.role === 'CUSTOMER' || user.role === 'VENDOR')) {
    return <Navigate to={ROUTES.USER_DASHBOARD} replace />;
  }

  switch (user.role) {
    case 'CONSULTANT':
      return <ConsultantDashboardPage />;
    case 'EMPLOYEE':
      return <EmployeeDashboardPage />;
    case 'ADMIN':
      return <AdminDashboardPage />;
    case 'SUPER_ADMIN':
      return <SuperAdminDashboardPage />;
    default:
      return (
        <CustomerDashboardPage documentsFocus={focusDocuments} />
      );
  }
};
