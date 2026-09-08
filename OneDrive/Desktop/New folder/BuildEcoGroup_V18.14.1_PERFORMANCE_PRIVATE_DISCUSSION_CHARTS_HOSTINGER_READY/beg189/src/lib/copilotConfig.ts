import { ROUTES } from './routes';
import type { IconToken } from './iconSystem';

export type CopilotQuickActionId =
  | 'build'
  | 'land'
  | 'solar'
  | 'interior'
  | 'boq'
  | 'expert'
  | 'track';

export interface CopilotQuickAction {
  id: CopilotQuickActionId;
  labelEn: string;
  labelHi: string;
  icon: IconToken;
  serviceId?: string;
  route: string;
  opensWizard: boolean;
}

/** Seven homepage-aligned quick actions — each maps to a real route/workflow. */
export const COPILOT_QUICK_ACTIONS: CopilotQuickAction[] = [
  {
    id: 'build',
    labelEn: 'Build a Project',
    labelHi: 'प्रोजेक्ट बनाएं',
    icon: 'construction',
    serviceId: 'construction',
    route: `${ROUTES.INITIATE_PROJECT}?service=construction&from=copilot`,
    opensWizard: true,
  },
  {
    id: 'land',
    labelEn: 'Find Land',
    labelHi: 'ज़मीन खोजें',
    icon: 'land',
    serviceId: 'land',
    route: `${ROUTES.INITIATE_PROJECT}?service=land&from=copilot`,
    opensWizard: true,
  },
  {
    id: 'solar',
    labelEn: 'Solar',
    labelHi: 'सोलर',
    icon: 'solar',
    serviceId: 'solar',
    route: `${ROUTES.INITIATE_PROJECT}?service=solar&from=copilot`,
    opensWizard: true,
  },
  {
    id: 'interior',
    labelEn: 'Interior / Renovation',
    labelHi: 'इंटीरियर / रेनोवेशन',
    icon: 'interior',
    serviceId: 'interior',
    route: `${ROUTES.INITIATE_PROJECT}?service=interior&from=copilot`,
    opensWizard: true,
  },
  {
    id: 'boq',
    labelEn: 'Material / BOQ',
    labelHi: 'मटीरियल / BOQ',
    icon: 'boq',
    serviceId: 'boq',
    route: `${ROUTES.INITIATE_PROJECT}?service=boq&from=copilot`,
    opensWizard: true,
  },
  {
    id: 'expert',
    labelEn: 'Find Expert',
    labelHi: 'विशेषज्ञ खोजें',
    icon: 'consultant',
    route: ROUTES.CONSULTANTS,
    opensWizard: false,
  },
  {
    id: 'track',
    labelEn: 'Track My Case',
    labelHi: 'केस ट्रैक करें',
    icon: 'tracking',
    route: ROUTES.TRACK_REQUEST,
    opensWizard: false,
  },
];

export function getCopilotQuickAction(id: CopilotQuickActionId): CopilotQuickAction {
  const action = COPILOT_QUICK_ACTIONS.find((a) => a.id === id);
  if (!action) throw new Error(`Unknown copilot action: ${id}`);
  return action;
}
