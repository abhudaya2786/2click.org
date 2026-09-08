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
  if (role !== 'CONSULTANT') return caseRecord;
  const { clientEmail: _clientEmail, clientPhone: _clientPhone, ...caseWithoutDirectContact } = caseRecord;
  return caseWithoutDirectContact;
}
