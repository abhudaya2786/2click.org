export const COPILOT_PREFILL_KEY = 'beg-copilot-wizard-prefill';

export interface CopilotWizardPrefill {
  serviceId: string;
  city?: string;
  note?: string;
  skipServiceStep?: boolean;
  source: 'copilot';
}

export function saveCopilotWizardPrefill(prefill: Omit<CopilotWizardPrefill, 'source'>): void {
  sessionStorage.setItem(
    COPILOT_PREFILL_KEY,
    JSON.stringify({ ...prefill, source: 'copilot' satisfies CopilotWizardPrefill['source'] })
  );
}

export function readCopilotWizardPrefill(): CopilotWizardPrefill | null {
  try {
    const raw = sessionStorage.getItem(COPILOT_PREFILL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CopilotWizardPrefill;
    return parsed?.source === 'copilot' ? parsed : null;
  } catch {
    return null;
  }
}

export function clearCopilotWizardPrefill(): void {
  sessionStorage.removeItem(COPILOT_PREFILL_KEY);
}
