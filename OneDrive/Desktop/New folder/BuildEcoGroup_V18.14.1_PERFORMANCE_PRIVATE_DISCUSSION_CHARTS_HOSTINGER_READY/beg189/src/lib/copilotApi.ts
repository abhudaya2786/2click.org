import type { CopilotUiAction } from './copilotEngine';

export type CopilotGuideResponse = {
  success: boolean;
  mode: 'context';
  intent: string;
  reply: string;
  language: 'en' | 'hi';
  actions: Array<{
    type: 'navigate' | 'track_page' | 'call';
    route?: string;
    phone?: string;
    caseRef?: string;
    labelEn: string;
    labelHi: string;
  }>;
  activeCaseRef?: string;
  casesCount: number;
};

export function mapGuideActions(
  actions: CopilotGuideResponse['actions'],
  language: 'en' | 'hi',
): CopilotUiAction[] {
  return actions.map((a) => {
    if (a.type === 'call') {
      return {
        type: 'call',
        phone: a.phone || '',
        labelEn: a.labelEn,
        labelHi: a.labelHi,
      };
    }
    if (a.type === 'track_page' && a.caseRef) {
      return {
        type: 'track_page',
        caseRef: a.caseRef,
        labelEn: a.labelEn,
        labelHi: a.labelHi,
      };
    }
    return {
      type: 'navigate',
      route: a.route || '/',
      labelEn: a.labelEn,
      labelHi: a.labelHi,
    };
  });
}

export async function copilotGuideApi(
  message: string,
  activeCaseRef?: string,
): Promise<CopilotGuideResponse> {
  const response = await fetch('/api/assistant/guide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ message, activeCaseRef }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Guide request failed (${response.status})`);
  }
  return data as CopilotGuideResponse;
}
