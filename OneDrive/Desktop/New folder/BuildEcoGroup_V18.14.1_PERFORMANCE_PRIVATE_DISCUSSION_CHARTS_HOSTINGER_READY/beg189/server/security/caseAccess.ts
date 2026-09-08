import { SafeUser } from '../../src/types/auth';

export interface CaseAccessTarget {
  id?: string;
  clientId?: string | null;
  clientEmail?: string | null;
  assignedConsultantId?: string | null;
  leadSpecialistName?: string | null;
  targetSpecialist?: string | null;
}

/**
 * Authoritative case-level access matrix shared by HTTP middleware and store RBAC.
 */
export function userCanAccessCase(
  user: SafeUser,
  caseRecord: CaseAccessTarget,
  consultantAssignments: { consultantId: string }[] = [],
): boolean {
  if (['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE'].includes(user.role)) {
    return true;
  }

  if (user.role === 'CUSTOMER') {
    return Boolean(
      (caseRecord.clientEmail && caseRecord.clientEmail.toLowerCase() === user.email.toLowerCase()) ||
      (caseRecord.clientId && caseRecord.clientId === user.id),
    );
  }

  if (user.role === 'CONSULTANT') {
    return Boolean(
      consultantAssignments.some(a => a.consultantId === user.id) ||
      caseRecord.assignedConsultantId === user.id ||
      caseRecord.leadSpecialistName?.toLowerCase().includes(user.fullName.toLowerCase()) ||
      caseRecord.targetSpecialist?.toLowerCase().includes(user.fullName.toLowerCase()),
    );
  }

  return false;
}

export function assertCaseAccess(
  user: SafeUser,
  caseRecord: CaseAccessTarget,
  consultantAssignments: { consultantId: string }[] = [],
): void {
  if (!userCanAccessCase(user, caseRecord, consultantAssignments)) {
    throw new Error('Access denied: you do not have permission to access this case record.');
  }
}
