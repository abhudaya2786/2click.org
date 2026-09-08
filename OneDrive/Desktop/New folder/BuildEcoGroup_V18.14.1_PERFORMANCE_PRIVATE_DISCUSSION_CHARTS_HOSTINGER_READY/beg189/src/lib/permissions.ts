import { UserRole, Permission, SafeUser } from '../types/auth';

/**
 * BuildEcoGroup Centralized Role-Based Access Control (RBAC) Matrix
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  CUSTOMER: [
    'case:create',
    'case:read:own',
    'case:update:own',
    'project:read:own',
  ],
  CONSULTANT: [
    'case:read:assigned',
    'case:update:assigned',
    'consultant:profile:update:own',
    'project:read:assigned',
  ],
  VENDOR: [
    'case:read:assigned',
    'case:update:assigned',
    'project:read:assigned',
  ],
  EMPLOYEE: [
    'case:read:assigned',
    'case:update:assigned',
    'case:read:any',
    'project:read:any',
    'admin:operations',
  ],
  ADMIN: [
    'case:create',
    'case:read:any',
    'case:update:own',
    'case:update:assigned',
    'consultant:verify',
    'project:read:any',
    'admin:operations',
    'admin:users',
    'admin:assignments',
  ],
  SUPER_ADMIN: [
    'case:create',
    'case:read:own',
    'case:read:assigned',
    'case:read:any',
    'case:update:own',
    'case:update:assigned',
    'consultant:profile:update:own',
    'consultant:verify',
    'project:read:own',
    'project:read:assigned',
    'project:read:any',
    'admin:operations',
    'admin:users',
    'admin:assignments',
    'superadmin:platform',
  ],
};

/**
 * Check if a given role possesses a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Check if user can access a specific case based on ownership and RBAC rules
 */
export function canAccessCase(
  user: SafeUser | null,
  caseRecord: { clientId?: string | null; clientEmail?: string | null; assignedSpecialistId?: string | null }
): boolean {
  if (!user) return false;

  // Super Admin and Admin can access any case
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'EMPLOYEE') {
    return true;
  }

  // Customer can only access their own case
  if (user.role === 'CUSTOMER') {
    return (
      (caseRecord.clientId && caseRecord.clientId === user.id) ||
      (caseRecord.clientEmail && caseRecord.clientEmail.toLowerCase() === user.email.toLowerCase())
    );
  }

  // Consultant can only access cases assigned to them
  if (user.role === 'CONSULTANT') {
    return Boolean(
      caseRecord.assignedSpecialistId && caseRecord.assignedSpecialistId === user.id
    );
  }

  return false;
}

/**
 * Returns default dashboard route for a given user role
 */
export function getDashboardRouteForRole(role: UserRole): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/dashboard/super-admin';
    case 'ADMIN':
      return '/dashboard/admin';
    case 'EMPLOYEE':
      return '/dashboard/employee';
    case 'CONSULTANT':
      return '/dashboard/consultant';
    case 'VENDOR':
      return '/dashboard/user';
    case 'CUSTOMER':
    default:
      return '/dashboard/user';
  }
}
