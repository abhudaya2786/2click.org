import { APP_CONFIG } from './constants';
import { ROUTES } from './routes';
import {
  COPILOT_QUICK_ACTIONS,
  CopilotQuickAction,
  CopilotQuickActionId,
  getCopilotQuickAction,
} from './copilotConfig';
import type { PublicTrackRecord } from '../types/backend';

export const CASE_ID_PATTERN = /\b(BEG-(?:ENR-)?(?:2026-)?[A-Z0-9-]{4,})\b/i;

export type CopilotIntentType =
  | 'start_service'
  | 'track'
  | 'human_handoff'
  | 'general';

export interface CopilotIntent {
  type: CopilotIntentType;
  actionId?: CopilotQuickActionId;
  caseId?: string;
}

export type CopilotUiAction =
  | { type: 'navigate'; route: string; labelEn: string; labelHi: string }
  | { type: 'call'; phone: string; labelEn: string; labelHi: string }
  | { type: 'track_page'; caseRef: string; labelEn: string; labelHi: string };

const SERVICE_PATTERNS: Array<{ id: CopilotQuickActionId; patterns: RegExp[] }> = [
  {
    id: 'build',
    patterns: [
      /build\s*a?\s*project/i,
      /construction/i,
      /new\s+home/i,
      /villa/i,
      /turnkey/i,
      /निर्माण/,
      /प्रोजेक्ट\s*बन/,
      /घर\s*बन/,
    ],
  },
  {
    id: 'land',
    patterns: [/find\s+land/i, /\bland\b/i, /property/i, /\bplot\b/i, /ज़मीन/, /जमीन/, /प्रॉपर्टी/],
  },
  {
    id: 'solar',
    patterns: [/solar/i, /surya/i, /rooftop/i, /pm\s+surya/i, /सोलर/, /सूर्य/],
  },
  {
    id: 'interior',
    patterns: [/interior/i, /renovation/i, /fit-?out/i, /retrofit/i, /इंटीरियर/, /रेनोवेशन/],
  },
  {
    id: 'boq',
    patterns: [/material/i, /\bboq\b/i, /estimate/i, /quotation/i, /procurement/i, /मटीरियल/, /कोट/],
  },
  {
    id: 'expert',
    patterns: [/find\s+(an?\s+)?expert/i, /consultant/i, /structural/i, /architect/i, /विशेषज्ञ/, /इंजीनियर/],
  },
  {
    id: 'track',
    patterns: [/track/i, /case\s*id/i, /status/i, /my\s+case/i, /ट्रैक/, /केस/, /स्थिति/],
  },
];

export function detectCopilotIntent(message: string): CopilotIntent {
  const trimmed = message.trim();
  const caseMatch = trimmed.match(CASE_ID_PATTERN);
  if (caseMatch) {
    return { type: 'track', caseId: caseMatch[1].toUpperCase() };
  }

  const lower = trimmed.toLowerCase();

  if (/human|coordinator|call\s+me|talk\s+to|phone|मानव|कॉल|फोन|बात\s*कर|संपर्क/.test(lower)) {
    return { type: 'human_handoff' };
  }

  for (const entry of SERVICE_PATTERNS) {
    if (entry.patterns.some((p) => p.test(trimmed))) {
      return { type: 'start_service', actionId: entry.id };
    }
  }

  return { type: 'general' };
}

export function extractCaseId(message: string): string | null {
  const match = message.trim().match(CASE_ID_PATTERN);
  return match ? match[1].toUpperCase() : null;
}

export function isLikelyCityAnswer(message: string): boolean {
  const text = message.trim();
  if (text.length < 2 || text.length > 80) return false;
  if (CASE_ID_PATTERN.test(text)) return false;
  if (/^\d+$/.test(text)) return false;
  return true;
}

export function explainNextAction(track: PublicTrackRecord, language: 'en' | 'hi'): string {
  const status = track.status;
  const desk = track.assignedDesk ? ` (${track.assignedDesk})` : '';

  if (track.type === 'ENROLLMENT') {
    if (status === 'PENDING_VERIFICATION') {
      return language === 'hi'
        ? 'अगला कदम: हमारी टीम आपका enrollment verify करेगी। Track पेज पर updates देखें।'
        : 'Next: our team will verify your enrollment. Check the Track page for updates.';
    }
    if (status === 'UNDER_REVIEW') {
      return language === 'hi'
        ? 'अगला कदम: review पूर्ण होने तक प्रतीक्षा करें। ज़रूरत हो तो coordinator संपर्क करेगा।'
        : 'Next: wait for review to complete. A coordinator will contact you if needed.';
    }
    if (status === 'APPROVED') {
      return language === 'hi'
        ? 'अगला कदम: आप approved हैं — dashboard/login से profile पूरा करें।'
        : 'Next: you are approved — complete your profile via login/dashboard.';
    }
    return language === 'hi'
      ? 'अगला कदम: Track पेज पर latest status देखें या coordinator से संपर्क करें।'
      : 'Next: see the latest status on Track or contact a coordinator.';
  }

  const byStatus: Record<string, { en: string; hi: string }> = {
    NEW: {
      en: `Next: your case enters qualification${desk}. No action needed — we will review your requirement.`,
      hi: `अगला कदम: आपका केस qualification में है${desk}। अभी कुछ करने की ज़रूरत नहीं — हम review करेंगे।`,
    },
    QUALIFICATION_PENDING: {
      en: 'Next: our desk is reviewing your scope. Reply to any information request on the Track page.',
      hi: 'अगला कदम: desk आपका scope review कर रहा है। Track पेज पर information request का जवाब दें।',
    },
    NEEDS_INFORMATION: {
      en: 'Next: we need more details from you — open Track and send the requested information.',
      hi: 'अगला कदम: हमें और जानकारी चाहिए — Track खोलें और requested details भेजें।',
    },
    COORDINATOR_ASSIGNED: {
      en: 'Next: a coordinator is assigned — expect contact for scope discovery.',
      hi: 'अगला कदम: coordinator assign हो गया है — scope discovery के लिए संपर्क की प्रतीक्षा करें।',
    },
    CONSULTANT_ASSIGNED: {
      en: 'Next: your expert is assigned — review proposals/BOQ when shared on Track.',
      hi: 'अगला कदम: विशेषज्ञ assign हो गया — Track पर BOQ/proposal share होने पर review करें।',
    },
    SCOPE_DISCOVERY: {
      en: 'Next: scope and BOQ are being prepared — compare quotes when available.',
      hi: 'अगला कदम: scope और BOQ तैयार हो रहे हैं — quotes उपलब्ध होने पर compare करें।',
    },
    IN_PROGRESS: {
      en: 'Next: work is in progress — follow milestones on Track.',
      hi: 'अगला कदम: काम चल रहा है — Track पर milestones देखें।',
    },
    COMPLETED: {
      en: 'Next: project is complete — download documents from Track or request handover support.',
      hi: 'अगला कदम: प्रोजेक्ट पूर्ण — Track से documents लें या handover support मांगें।',
    },
    CLOSED: {
      en: 'Next: this case is closed. Start a new requirement if you need further help.',
      hi: 'अगला कदम: यह केस बंद है। नई ज़रूरत के लिए नया requirement शुरू करें।',
    },
  };

  const entry = byStatus[status];
  if (entry) return language === 'hi' ? entry.hi : entry.en;

  return language === 'hi'
    ? `अगला कदम: Track पेज पर "${track.displayStatus}" status देखें।`
    : `Next: see status "${track.displayStatus}" on the Track page.`;
}

export function formatTrackSummary(track: PublicTrackRecord, language: 'en' | 'hi'): string {
  const lines = [
    language === 'hi' ? `📋 Case: ${track.reference}` : `📋 Case: ${track.reference}`,
    language === 'hi' ? `स्थिति: ${track.displayStatus}` : `Status: ${track.displayStatus}`,
  ];
  if (track.city) {
    lines.push(language === 'hi' ? `शहर: ${track.city}` : `City: ${track.city}`);
  }
  if (track.assignedDesk) {
    lines.push(language === 'hi' ? `Desk: ${track.assignedDesk}` : `Desk: ${track.assignedDesk}`);
  }
  if (track.isFullAccess && track.clientName) {
    lines.push(language === 'hi' ? `ग्राहक: ${track.clientName}` : `Client: ${track.clientName}`);
  }
  return lines.join('\n');
}

export function buildHumanHandoffReply(language: 'en' | 'hi'): { text: string; actions: CopilotUiAction[] } {
  const text =
    language === 'hi'
      ? `मैं आपको हमारी coordinator टीम से जोड़ सकता हूँ।\n\n• Contact पेज पर form भरें\n• फोन: ${APP_CONFIG.supportPhone}\n• Email: ${APP_CONFIG.contactEmail}\n\nमैं Case ID, कीमत या consultant की जानकारी नहीं बनाता — केवल असली records दिखाता हूँ।`
      : `I can connect you with our coordinator team.\n\n• Use the Contact page form\n• Phone: ${APP_CONFIG.supportPhone}\n• Email: ${APP_CONFIG.contactEmail}\n\nI never invent Case IDs, prices, or consultant records — only real data from the server.`;

  return {
    text,
    actions: [
      {
        type: 'navigate',
        route: ROUTES.CONTACT,
        labelEn: 'Contact coordinators',
        labelHi: 'Coordinator से संपर्क',
      },
      {
        type: 'call',
        phone: APP_CONFIG.supportPhone,
        labelEn: 'Call support',
        labelHi: 'सपोर्ट कॉल',
      },
    ],
  };
}

export function buildServiceStartReply(
  action: CopilotQuickAction,
  language: 'en' | 'hi',
  city?: string
): { text: string; actions: CopilotUiAction[] } {
  const label = language === 'hi' ? action.labelHi : action.labelEn;
  const cityLine = city
    ? language === 'hi'
      ? `\nशहर: ${city}`
      : `\nCity: ${city}`
    : '';

  if (action.id === 'expert') {
    return {
      text:
        language === 'hi'
          ? `ठीक है — verified consultants directory खोल रहा हूँ। मैं consultant profiles या कीमतें नहीं बनाता।${cityLine}`
          : `Opening the verified consultants directory. I do not invent consultant profiles or prices.${cityLine}`,
      actions: [
        {
          type: 'navigate',
          route: action.route,
          labelEn: 'Browse experts',
          labelHi: 'विशेषज्ञ देखें',
        },
      ],
    };
  }

  if (action.id === 'track') {
    return {
      text:
        language === 'hi'
          ? 'अपना Case ID (जैसे BEG-2026-XXXXXXXX) यहाँ भेजें। मैं केवल server से असली status दिखाता हूँ।'
          : 'Send your Case ID (e.g. BEG-2026-XXXXXXXX). I only show real status from the server.',
      actions: [
        {
          type: 'navigate',
          route: ROUTES.TRACK_REQUEST,
          labelEn: 'Open Track page',
          labelHi: 'Track पेज खोलें',
        },
      ],
    };
  }

  return {
    text:
      language === 'hi'
        ? `ठीक है — "${label}" के लिए requirement wizard खोलूँगा। Case केवल wizard submit के बाद server से बनेगा।${cityLine}\n\nअगला कदम: location और contact भरें, फिर submit करें।`
        : `Got it — I'll open the requirement wizard for "${label}". A Case is created only when you submit through the wizard (server workflow).${cityLine}\n\nNext: fill location & contact, then submit.`,
    actions: [
      {
        type: 'navigate',
        route: city && action.serviceId
          ? `${action.route}&city=${encodeURIComponent(city)}`
          : action.route,
        labelEn: 'Open requirement wizard',
        labelHi: 'Requirement wizard खोलें',
      },
    ],
  };
}

export function buildCityQuestion(action: CopilotQuickAction, language: 'en' | 'hi'): string {
  const label = language === 'hi' ? action.labelHi : action.labelEn;
  return language === 'hi'
    ? `"${label}" — आपका site किस शहर में है? (एक शब्द में, जैसे Lucknow)`
    : `For "${label}" — which city is your site in? (one word, e.g. Lucknow)`;
}

export function matchQuickActionFromIntent(intent: CopilotIntent): CopilotQuickAction | null {
  if (intent.actionId) return getCopilotQuickAction(intent.actionId);
  return null;
}

export function listQuickActions(): CopilotQuickAction[] {
  return COPILOT_QUICK_ACTIONS;
}
