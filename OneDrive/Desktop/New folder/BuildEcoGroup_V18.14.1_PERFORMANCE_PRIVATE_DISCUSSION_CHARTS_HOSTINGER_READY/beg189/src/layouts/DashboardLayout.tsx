import React from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import { useAuth } from '../contexts/AuthContext';
import { RoleBadge } from '../components/auth/RoleBadge';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { BuildEcoGroupLogo } from '../components/brand/BuildEcoGroupLogo';
import { AppIcon } from '../components/ui/AppIcon';
import { ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  return (
    <div className="beg-dashboard-shell min-h-screen flex flex-col lg:flex-row bg-[var(--color-surface-muted)] text-[var(--color-text)]">
      
      {/* Sidebar */}
      <aside className="beg-dashboard-sidebar w-full shrink-0 lg:w-72 bg-[var(--color-surface)] border-b lg:border-b-0 lg:border-r border-[var(--color-border)] p-4 lg:p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <Link to={ROUTES.HOME} className="block group focus-visible:outline-hidden">
            <BuildEcoGroupLogo variant="full" theme="light" className="h-10 w-auto" />
            <div className="text-[10px] text-[var(--color-brand-brown)] uppercase font-mono-code font-bold mt-1 tracking-wider">
              Authoritative Console
            </div>
          </Link>

          {/* User Profile Card in Sidebar */}
          {user && (
            <div className="p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[var(--color-text-subtle)]">Active Identity</span>
                <RoleBadge role={user.role} size="sm" showIcon={false} />
              </div>
              <div className="font-bold text-xs text-[var(--color-text)] truncate">{user.fullName}</div>
              <div className="text-[11px] text-[var(--color-text-muted)] font-mono-code truncate">{user.email}</div>
            </div>
          )}

          {/* Navigation Links based on RBAC */}
          <nav className="space-y-1 text-sm font-medium">
          {/* Customer Dashboard Link */}
            {(!user || user.role === 'CUSTOMER') && (
              <>
              <NavLink
                to={ROUTES.DASHBOARD}
                end
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-bold'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]'
                  }`
                }
              >
                <AppIcon name="dashboard" size="sm" decorative />
                <span>Home</span>
              </NavLink>
              <NavLink
                to={ROUTES.INITIATE_PROJECT}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-bold'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]'
                  }`
                }
              >
                <AppIcon name="caseId" size="sm" decorative />
                <span>Start My Requirement</span>
              </NavLink>
              <NavLink
                to={`${ROUTES.DASHBOARD}#my-requests`}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <AppIcon name="tracking" size="sm" decorative />
                <span>My Requests</span>
              </NavLink>
              <NavLink
                to={ROUTES.MESSAGES}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-bold'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]'
                  }`
                }
              >
                <AppIcon name="messages" size="sm" decorative />
                <span>Messages / Updates</span>
              </NavLink>
              <NavLink
                to={ROUTES.SETTINGS}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-bold'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]'
                  }`
                }
              >
                <AppIcon name="profile" size="sm" decorative />
                <span>Profile</span>
              </NavLink>
              </>
            )}

            {/* Legacy label removed — consultant/admin links below */}
            {false && (!user || user.role === 'CUSTOMER') && (
              <NavLink
                to={ROUTES.DASHBOARD}
                end
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-bold'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]'
                  }`
                }
              >
                <AppIcon name="dashboard" size="sm" decorative />
                <span>Client Case Workspace</span>
              </NavLink>
            )}

            {/* Consultant Dashboard Link */}
            {user?.role === 'CONSULTANT' && (
              <NavLink
                to="/dashboard/consultant"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-bold'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]'
                  }`
                }
              >
                <AppIcon name="consultant" size="sm" decorative />
                <span>Consultant Practice</span>
              </NavLink>
            )}

            {/* Employee Coordinator Link */}
            {user?.role === 'EMPLOYEE' && (
              <NavLink
                to="/dashboard/employee"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-bold'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]'
                  }`
                }
              >
                <AppIcon name="coordinator" size="sm" decorative />
                <span>Coordination Dispatcher</span>
              </NavLink>
            )}

            {/* Admin Ops Link */}
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
              <NavLink
                to="/dashboard/admin"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-bold'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]'
                  }`
                }
              >
                <AppIcon name="admin" size="sm" decorative />
                <span>Operations Center</span>
              </NavLink>
            )}

            {/* Super Admin Link */}
            {user?.role === 'SUPER_ADMIN' && (
              <NavLink
                to="/dashboard/super-admin"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-bold'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]'
                  }`
                }
              >
                <AppIcon name="superAdmin" size="sm" className="text-[#6B21A8]" decorative />
                <span>Command Center</span>
              </NavLink>
            )}

            {/* Commercial & Outsourcing Engine Link */}
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'EMPLOYEE' || user?.role === 'CONSULTANT') && (
              <NavLink
                to={ROUTES.COMMERCIAL_SUITE}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-100 text-purple-900 font-bold'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]'
                  }`
                }
              >
                <AppIcon name="vendor" size="sm" className="text-purple-600" decorative />
                <span>Commercial Engine</span>
              </NavLink>
            )}

            {/* Shared Case Records — hidden for customers (use My Requests instead) */}
            {user?.role !== 'CUSTOMER' && (
            <NavLink
              to={ROUTES.CASES}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-bold'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]'
                }`
              }
            >
              <AppIcon name="caseId" size="sm" decorative />
              <span>Project Requirements</span>
            </NavLink>
            )}

            <NavLink
              to={ROUTES.DOCUMENTS}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-bold'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]'
                }`
              }
            >
              <AppIcon name="boq" size="sm" decorative />
              <span>BOQ & Reports</span>
            </NavLink>
          </nav>
        </div>

        {/* Bottom Sidebar: Session & Logout Controls */}
        <div className="pt-6 border-t border-[var(--color-border)] space-y-3 mt-6 lg:mt-0">
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </div>
              <span className="text-[10px] text-[#71717A]">HttpOnly Clear</span>
            </button>
          ) : (
            <Link to={ROUTES.LOGIN} className="w-full inline-flex">
              <Button variant="primary" size="sm" fullWidth>
                Sign In
              </Button>
            </Link>
          )}

          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] px-3 py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit to Public Portal</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

    </div>
  );
};
