import { SafeUser, UserRole } from '../../src/types/auth';
import { AssignmentRecord } from '../../src/types/backend';

export interface CaseAccessRecord {
  id: string;
  clientId?: string | null;
  clientEmail?: string | null;
  assignedConsultantId?: string | null;
  leadSpecialistName?: string | null;
  targetSpecialist?: string | null;
  assignedSpecialistId?: string | null;
}

export function isPrivilegedStaff(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'EMPLOYEE';
}

export function userOwnsCase(user: SafeUser, caseRecord: CaseAccessRecord): boolean {
  return (
    (caseRecord.clientEmail && caseRecord.clientEmail.toLowerCase() === user.email.toLowerCase()) ||
    (caseRecord.clientId && caseRecord.clientId === user.id)
  );
}

export function consultantAssignedToCase(
  user: SafeUser,
  caseRecord: CaseAccessRecord,
  assignments: AssignmentRecord[] = [],
): boolean {
  if (caseRecord.assignedConsultantId === user.id) return true;
  if ((caseRecord as { assignedSpecialistId?: string }).assignedSpecialistId === user.id) return true;
  if (assignments.some(a => a.consultantId === user.id)) return true;
  const name = user.fullName.toLowerCase();
  if (caseRecord.leadSpecialistName?.toLowerCase().includes(name)) return true;
  if (caseRecord.targetSpecialist?.toLowerCase().includes(name)) return true;
  return false;
}

export function userCanAccessCase(
  user: SafeUser | undefined,
  caseRecord: CaseAccessRecord,
  assignments: AssignmentRecord[] = [],
): boolean {
  if (!user) return false;
  if (isPrivilegedStaff(user.role)) return true;
  if (user.role === 'CUSTOMER') return userOwnsCase(user, caseRecord);
  if (user.role === 'CONSULTANT') return consultantAssignedToCase(user, caseRecord, assignments);
  return false;
}

export function assertUserCanAccessCase(
  user: SafeUser,
  caseRecord: CaseAccessRecord,
  assignments: AssignmentRecord[] = [],
): void {
  if (!userCanAccessCase(user, caseRecord, assignments)) {
    if (user.role === 'CUSTOMER') {
      throw new Error('Forbidden: You do not have permission to view this client case record.');
    }
    if (user.role === 'CONSULTANT') {
      throw new Error('Forbidden: This case has not been assigned to your consultant practice.');
    }
    throw new Error('Unauthorized access to case record.');
  }
}

export function userCanMutateCommercial(user: SafeUser, caseRecord: CaseAccessRecord, assignments: AssignmentRecord[] = []): boolean {
  if (isPrivilegedStaff(user.role)) return true;
  if (user.role === 'CONSULTANT') return consultantAssignedToCase(user, caseRecord, assignments);
  return false;
}

export function assertUserCanMutateCommercial(
  user: SafeUser,
  caseRecord: CaseAccessRecord,
  assignments: AssignmentRecord[] = [],
): void {
  if (!userCanMutateCommercial(user, caseRecord, assignments)) {
    throw new Error('Forbidden: You are not authorized to modify commercial records for this case.');
  }
}

export function userCanAccessQuotation(
  user: SafeUser,
  quote: { providerId: string; caseId: string },
  caseRecord: CaseAccessRecord,
  assignments: AssignmentRecord[] = [],
): boolean {
  if (quote.providerId === user.id) return true;
  return userCanAccessCase(user, caseRecord, assignments);
}
