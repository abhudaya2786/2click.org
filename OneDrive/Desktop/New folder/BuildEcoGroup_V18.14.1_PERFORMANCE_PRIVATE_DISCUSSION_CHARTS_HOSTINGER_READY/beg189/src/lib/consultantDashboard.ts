import { AssignmentRecord, CaseRecord } from '../types/backend';

export type ConsultantDashboardTab =
  | 'new-assignments'
  | 'assigned'
  | 'accepted'
  | 'in-progress'
  | 'waiting-customer'
  | 'documents'
  | 'messages'
  | 'appointments'
  | 'completed'
  | 'profile'
  | 'availability';

export const CONSULTANT_TABS: { id: ConsultantDashboardTab; label: string }[] = [
  { id: 'new-assignments', label: 'New Assignments' },
  { id: 'assigned', label: 'Assigned Requests' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'waiting-customer', label: 'Waiting for Customer' },
  { id: 'documents', label: 'Documents / BOQ' },
  { id: 'messages', label: 'Messages' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'completed', label: 'Completed' },
  { id: 'profile', label: 'Profile' },
  { id: 'availability', label: 'Availability' },
];

export function getCaseStatus(a: AssignmentRecord): string {
  return a.caseSummary?.status || a.case?.status || '';
}

export function filterAssignmentsByTab(
  assignments: AssignmentRecord[],
  tab: ConsultantDashboardTab
): AssignmentRecord[] {
  switch (tab) {
    case 'new-assignments':
      return assignments.filter((a) => a.status === 'PENDING' || a.status === 'OFFERED');
    case 'assigned':
      return assignments;
    case 'accepted':
      return assignments.filter((a) => {
        if (a.status !== 'ACCEPTED') return false;
        const s = getCaseStatus(a);
        return ['CONSULTANT_ASSIGNED', 'CONSULTANT_ACCEPTED'].includes(s);
      });
    case 'in-progress':
      return assignments.filter((a) => {
        if (a.status !== 'ACCEPTED') return false;
        const s = getCaseStatus(a);
        return ['SCOPE_DISCOVERY', 'IN_PROGRESS', 'EXECUTION', 'ACTIVE', 'APPROVED', 'PROPOSAL_PENDING'].includes(s);
      });
    case 'waiting-customer':
      return assignments.filter((a) => {
        const s = getCaseStatus(a);
        return ['NEEDS_INFORMATION', 'ACTION_REQUIRED', 'WAITING_FOR_CUSTOMER'].includes(s);
      });
    case 'documents':
      return assignments.filter((a) => {
        const s = getCaseStatus(a);
        return s.includes('BOQ') || s.includes('QUOTATION') || s === 'BOQ_PREPARATION';
      });
    case 'completed':
      return assignments.filter((a) => {
        const s = getCaseStatus(a);
        return ['COMPLETED', 'CLOSED'].includes(s);
      });
    case 'messages':
    case 'appointments':
    case 'profile':
    case 'availability':
      return [];
    default:
      return assignments;
  }
}

export function tabCount(assignments: AssignmentRecord[], tab: ConsultantDashboardTab): number {
  if (tab === 'messages' || tab === 'appointments' || tab === 'profile' || tab === 'availability') {
    return 0;
  }
  return filterAssignmentsByTab(assignments, tab).length;
}

export function mergeCasesIntoAssignments(
  assignments: AssignmentRecord[],
  cases: CaseRecord[]
): AssignmentRecord[] {
  const caseById = new Map(cases.map((c) => [c.id, c]));
  return assignments.map((a) => {
    const c = caseById.get(a.caseId);
    if (!c) return a;
    return {
      ...a,
      case: c,
      caseSummary: {
        caseReference: c.caseReference,
        projectTitle: c.projectTitle,
        pillar: c.pillar,
        serviceSlug: c.serviceSlug,
        primaryDiscipline: c.primaryDiscipline,
        city: c.city,
        stateRegion: c.stateRegion,
        scopeDescription: c.scopeDescription,
        budgetRange: c.budgetRange,
        startDateUrgency: c.startDateUrgency,
        status: c.status,
      },
    };
  });
}
