import type { CaseRecord, SafeUser } from '../../src/types/backend';

export type RoleSafeCaseRecord = Omit<CaseRecord, 'clientEmail' | 'clientPhone'> &
  Partial<Pick<CaseRecord, 'clientEmail' | 'clientPhone'>>;

/**
 * Consultants work through Case ID messaging and never receive direct customer
 * contact details. Operations roles and the owning customer retain their normal
 * authenticated view.
 */
export function sanitizeCaseForRole(
  caseRecord: CaseRecord,
  role?: SafeUser['role']
): CaseRecord | RoleSafeCaseRecord {
  // Consultants and vendors work via Case ID and must not receive direct customer contact.
  if (role !== 'CONSULTANT' && role !== 'VENDOR') return caseRecord;
  const { clientEmail: _clientEmail, clientPhone: _clientPhone, ...caseWithoutDirectContact } = caseRecord;
  return caseWithoutDirectContact;
}
