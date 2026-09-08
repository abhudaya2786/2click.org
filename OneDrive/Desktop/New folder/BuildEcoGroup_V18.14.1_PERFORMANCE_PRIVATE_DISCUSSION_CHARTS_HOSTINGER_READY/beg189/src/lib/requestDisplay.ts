import { CaseRecord } from '../types/backend';
import { getServiceById } from './servicesRegistry';

export function getRequestCategoryLabel(caseRecord: CaseRecord): string {
  const service = getServiceById(caseRecord.serviceSlug);
  if (service?.title) return service.title;
  return caseRecord.serviceSlug?.replace(/-/g, ' ') || caseRecord.pillar?.replace(/_/g, ' ') || 'General';
}

export function getAssignedConsultantLabel(caseRecord: CaseRecord): string {
  return (
    caseRecord.leadSpecialistName ||
    caseRecord.targetSpecialist ||
    caseRecord.assignedConsultantId ||
    'Not assigned yet'
  );
}

export function getLatestActivityLabel(caseRecord: CaseRecord): string {
  const updated = new Date(caseRecord.updatedAt || caseRecord.createdAt);
  const dateLabel = updated.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const statusLabel = caseRecord.status.replace(/_/g, ' ').toLowerCase();
  return `Updated ${dateLabel} · ${statusLabel}`;
}

export function getNextActionLabel(status: string): string {
  const map: Record<string, string> = {
    NEW: 'Awaiting coordinator review',
    QUALIFICATION_PENDING: 'Coordinator reviewing your request',
    QUALIFICATION: 'Coordinator reviewing your request',
    NEEDS_INFORMATION: 'Please respond to the information request',
    CONSULTANT_ASSIGNED: 'Consultant reviewing assignment',
    CONSULTANT_ACCEPTED: 'Scope discovery in progress',
    SCOPE_DISCOVERY: 'Consultant preparing scope dossier',
    BOQ_PREPARATION: 'BOQ being prepared',
    QUOTATION_PENDING: 'Quotation being prepared',
    COMPLETED: 'Request completed',
    CLOSED: 'Request closed',
    CANCELLED: 'Request cancelled',
    REJECTED: 'Request was not approved',
  };
  return map[status] || 'Track progress in your request workspace';
}

export function formatRequestStatus(status: string): string {
  return status.replace(/_/g, ' ');
}
