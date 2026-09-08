import { ROUTES } from '../src/lib/routes';
import { SafeUser } from '../src/types/auth';
import { CaseRecord, PublicTrackRecord } from '../src/types/backend';
import { userCanAccessCase } from './security/caseAccess';
import { env } from './env';
import { store } from './store';

export const CASE_ID_PATTERN = /\b(BEG-(?:ENR-)?(?:2026-)?[A-Z0-9-]{4,})\b/i;

export type GuideIntent =
  | 'my_cases'
  | 'case_status'
  | 'boq_status'
  | 'quotation_status'
  | 'next_step'
  | 'assigned_expert'
  | 'milestones'
  | 'messages_docs'
  | 'pending_action'
  | 'pick_case'
  | 'start_service'
  | 'forbidden'
  | 'not_found'
  | 'no_cases';

export type GuideAction = {
  type: 'navigate' | 'track_page' | 'call';
  route?: string;
  phone?: string;
  caseRef?: string;
  labelEn: string;
  labelHi: string;
};

export type CopilotGuideResult = {
  success: boolean;
  mode: 'context';
  intent: GuideIntent;
  reply: string;
  language: 'en' | 'hi';
  actions: GuideAction[];
  activeCaseRef?: string;
  casesCount: number;
};

function isHindi(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

function t(en: string, hi: string, language: 'en' | 'hi'): string {
  return language === 'hi' ? hi : en;
}

/** Same RBAC scope as GET /api/cases */
export function getVisibleCasesForUser(user: SafeUser): CaseRecord[] {
  const allCases = store.getAllCases();

  if (user.role === 'CUSTOMER') {
    return allCases.filter(
      (c) =>
        (c.clientEmail && c.clientEmail.toLowerCase() === user.email.toLowerCase()) ||
        c.clientId === user.id,
    );
  }

  if (user.role === 'CONSULTANT') {
    const consultantAssignments = store.getAssignmentsForConsultant(user.id);
    const assignedCaseIds = new Set(consultantAssignments.map((a) => a.caseId));
    return allCases.filter(
      (c) =>
        assignedCaseIds.has(c.id) ||
        c.assignedConsultantId === user.id ||
        c.leadSpecialistName?.toLowerCase().includes(user.fullName.toLowerCase()) ||
        c.targetSpecialist?.toLowerCase().includes(user.fullName.toLowerCase()) ||
        (env.NODE_ENV !== 'production' && c.isDemo),
    );
  }

  return allCases;
}

export function detectGuideIntent(message: string): GuideIntent {
  const text = message.toLowerCase();

  if (/my cases|mere case|मेरे केस|सभी केस/.test(text)) return 'my_cases';
  if (/boq|bill of quantities|बीओक्यू|बी o q/.test(text)) return 'boq_status';
  if (/quot|quote|कोट|तुलना|compare/.test(text)) return 'quotation_status';
  if (/milestone|माइलस्टोन|चरण/.test(text)) return 'milestones';
  if (/message|document|chat|संदेश|दस्तावेज़|दस्तावेज/.test(text)) return 'messages_docs';
  if (/pending|action|wait|प्रतीक्षा|बाकी|करना है/.test(text)) return 'pending_action';
  if (
    /mera case|case kaha|kaha tak|pahucha|पहुँच|पहुंच|कहाँ|कहा|स्थिति|status/.test(text)
  ) {
    return 'case_status';
  }
  if (/agla step|next step|आगे|अगला|अगला कदम/.test(text)) return 'next_step';
  if (/expert|consultant|architect|coordinator|विशेषज्ञ|आर्किटेक्ट|इंजीनियर/.test(text)) {
    if (/chahiye|lagwana|want|need|start|शुरू|चाहिए|लगवाना|lagana/.test(text)) {
      return 'start_service';
    }
    return 'assigned_expert';
  }
  if (/solar|land|interior|build|construction|renovation|material/.test(text)) {
    return 'start_service';
  }

  return 'next_step';
}

type ResolveResult =
  | { caseRecord: CaseRecord }
  | { pick: CaseRecord[] }
  | { forbidden: true }
  | { notFound: true };

function resolveAuthorizedCase(
  user: SafeUser,
  message: string,
  activeCaseRef?: string,
): ResolveResult {
  const visible = getVisibleCasesForUser(user);
  const caseToken = message.match(CASE_ID_PATTERN)?.[1]?.toUpperCase();

  if (caseToken) {
    const globalCase = store.getCase(caseToken);
    if (!globalCase) return { notFound: true };
    const authorized = visible.find(
      (c) => c.id === globalCase.id || c.caseReference.toUpperCase() === caseToken,
    );
    if (!authorized) return { forbidden: true };
    return { caseRecord: authorized };
  }

  if (activeCaseRef) {
    const match = visible.find((c) => c.caseReference === activeCaseRef);
    if (match) return { caseRecord: match };
  }

  if (visible.length === 1) return { caseRecord: visible[0] };
  if (visible.length > 1) return { pick: visible };
  return { notFound: true };
}

function actionNavigate(route: string, labelEn: string, labelHi: string): GuideAction {
  return { type: 'navigate', route, labelEn, labelHi };
}

function actionTrack(caseRef: string, labelEn: string, labelHi: string): GuideAction {
  return { type: 'track_page', caseRef, labelEn, labelHi };
}

function listCasesReply(cases: CaseRecord[], language: 'en' | 'hi'): string {
  const lines = cases.slice(0, 8).map(
    (c, i) =>
      `${i + 1}. ${c.caseReference} — ${c.projectTitle || c.primaryDiscipline} (${c.status})`,
  );
  return t(
    `Your authorized cases (${cases.length}):\n${lines.join('\n')}\n\nMention a Case ID for details.`,
    `आपके authorized cases (${cases.length}):\n${lines.join('\n')}\n\nविवरण के लिए Case ID भेजें।`,
    language,
  );
}

function pendingActionForCase(caseRecord: CaseRecord, language: 'en' | 'hi'): string {
  const infoRequests = store.getInformationRequests(caseRecord.id);
  const openRequests = infoRequests.filter((r) => r.status === 'PENDING' || r.status === 'RESPONDED');

  if (openRequests.length > 0) {
    const q = openRequests[0].question;
    return t(
      `Pending: respond to information request — "${q.slice(0, 120)}${q.length > 120 ? '…' : ''}"`,
      `बाकी: information request का जवाब दें — "${q.slice(0, 120)}${q.length > 120 ? '…' : ''}"`,
      language,
    );
  }

  const byStatus: Partial<Record<string, { en: string; hi: string }>> = {
    NEEDS_INFORMATION: {
      en: 'Pending: open Track and submit the requested details.',
      hi: 'बाकी: Track खोलें और मांगी गई जानकारी भेजें।',
    },
    CUSTOMER_REVIEW: {
      en: 'Pending: review proposal/scope and approve on your dashboard.',
      hi: 'बाकी: proposal/scope review करें और dashboard पर approve करें।',
    },
    PROPOSAL_PENDING: {
      en: 'Pending: quotations/BOQ are being prepared — check back on Track.',
      hi: 'बाकी: quotations/BOQ तैयार हो रहे हैं — Track पर देखें।',
    },
    QUALIFICATION_PENDING: {
      en: 'Pending: our desk is reviewing your requirement — no action needed now.',
      hi: 'बाकी: desk आपकी requirement review कर रहा है — अभी कोई action नहीं।',
    },
  };

  const entry = byStatus[caseRecord.status];
  if (entry) return language === 'hi' ? entry.hi : entry.en;

  return t(
    'No urgent pending action on server. Follow milestones on Track.',
    'Server पर कोई urgent pending action नहीं। Track पर milestones देखें।',
    language,
  );
}

function expertReply(caseRecord: CaseRecord, language: 'en' | 'hi'): string {
  const assignments = store
    .getAssignmentsForCase(caseRecord.id)
    .filter((a) => a.assignmentType === 'CONSULTANT' && a.status !== 'DECLINED');

  if (assignments.length > 0) {
    const names = assignments.map((a) => a.consultantName || a.consultantId).join(', ');
    return t(
      `Assigned expert(s) on ${caseRecord.caseReference}: ${names}`,
      `${caseRecord.caseReference} पर नियुक्त विशेषज्ञ: ${names}`,
      language,
    );
  }

  if (caseRecord.leadSpecialistName || caseRecord.assignedCoordinatorName) {
    const lead = caseRecord.leadSpecialistName || caseRecord.assignedCoordinatorName;
    return t(
      `Coordinator/specialist on record: ${lead}. Full consultant assignment may still be in progress.`,
      `Record पर coordinator/specialist: ${lead}। पूर्ण consultant assignment अभी progress में हो सकता है।`,
      language,
    );
  }

  return t(
    'No expert assigned yet on server for this case. Next: wait for qualification and matching.',
    'Server पर अभी कोई expert assign नहीं। अगला: qualification और matching की प्रतीक्षा।',
    language,
  );
}

function boqReply(caseRecord: CaseRecord, user: SafeUser, language: 'en' | 'hi'): string {
  const boqs = store.getBOQsForCase(caseRecord.id, user);
  if (boqs.length === 0) {
    return t(
      `No BOQ exists on server yet for ${caseRecord.caseReference}. BOQ is prepared after scope discovery.`,
      `${caseRecord.caseReference} के लिए server पर अभी BOQ नहीं है। BOQ scope discovery के बाद तैयार होता है।`,
      language,
    );
  }

  const latest = boqs[0];
  const rev = latest.currentRevision?.status || latest.status;
  return t(
    `BOQ on server: ${latest.boqReference} — status ${latest.status}${rev ? `, revision ${rev}` : ''}.`,
    `Server पर BOQ: ${latest.boqReference} — status ${latest.status}${rev ? `, revision ${rev}` : ''}।`,
    language,
  );
}

function quotationReply(caseRecord: CaseRecord, user: SafeUser, language: 'en' | 'hi'): string {
  const boqs = store.getBOQsForCase(caseRecord.id, user);
  if (boqs.length === 0) {
    return t(
      'No quotations on server — BOQ is not created yet for this case.',
      'Server पर quotations नहीं — इस case के लिए BOQ अभी नहीं बना।',
      language,
    );
  }

  const allQuotes = boqs.flatMap((b) => store.getQuotationsForBOQ(b.id, user));
  if (allQuotes.length === 0) {
    return t(
      'BOQ exists but no vendor quotations on server yet.',
      'BOQ है लेकिन server पर अभी vendor quotations नहीं।',
      language,
    );
  }

  const summary = allQuotes
    .slice(0, 5)
    .map((q) => `• ${q.quotationReference} (${q.providerName}) — ${q.status}`)
    .join('\n');

  return t(
    `Quotations on server (${allQuotes.length}):\n${summary}`,
    `Server पर quotations (${allQuotes.length}):\n${summary}`,
    language,
  );
}

function milestonesReply(track: PublicTrackRecord, language: 'en' | 'hi'): string {
  if (!track.milestones?.length) {
    return t(
      'No milestones on server yet for this case.',
      'इस case के लिए server पर अभी milestones नहीं।',
      language,
    );
  }
  const lines = track.milestones.map(
    (m, i) => `${i + 1}. ${m.title} — ${m.status}${m.date ? ` (${m.date})` : ''}`,
  );
  return t(`Milestones:\n${lines.join('\n')}`, `Milestones:\n${lines.join('\n')}`, language);
}

function messagesDocsReply(caseRecord: CaseRecord, language: 'en' | 'hi'): string {
  const messages = store.getCaseMessages(caseRecord.id);
  const documents = store.getDocuments(caseRecord.caseReference);
  return t(
    `On server for ${caseRecord.caseReference}: ${messages.length} message(s), ${documents.length} document(s). Open Track or dashboard for full list.`,
    `${caseRecord.caseReference}: server पर ${messages.length} message, ${documents.length} document। पूरी सूची Track/dashboard पर।`,
    language,
  );
}

function nextStepFromTrack(track: PublicTrackRecord, language: 'en' | 'hi'): string {
  const status = track.status;
  const map: Record<string, { en: string; hi: string }> = {
    NEW: {
      en: 'Next: qualification review — no action needed from you yet.',
      hi: 'अगला: qualification review — अभी आपसे action नहीं।',
    },
    QUALIFICATION_PENDING: {
      en: 'Next: desk review in progress. Watch Track for updates.',
      hi: 'अगला: desk review चल रहा है। Track पर updates देखें।',
    },
    NEEDS_INFORMATION: {
      en: 'Next: submit requested information on the Track page.',
      hi: 'अगला: Track पेज पर मांगी गई जानकारी भेजें।',
    },
    CONSULTANT_ASSIGNED: {
      en: 'Next: review BOQ/quotes when shared.',
      hi: 'अगला: BOQ/quotes share होने पर review करें।',
    },
    SCOPE_DISCOVERY: {
      en: 'Next: scope & BOQ preparation — compare quotes when ready.',
      hi: 'अगला: scope और BOQ — quotes ready होने पर compare करें।',
    },
    CUSTOMER_REVIEW: {
      en: 'Next: approve scope/milestones on your dashboard.',
      hi: 'अगला: dashboard पर scope/milestones approve करें।',
    },
    COMPLETED: {
      en: 'Next: download handover documents from Track.',
      hi: 'अगला: Track से handover documents लें।',
    },
  };
  const entry = map[status];
  if (entry) return language === 'hi' ? entry.hi : entry.en;
  return t(
    `Next: follow status "${track.displayStatus}" on Track.`,
    `अगला: Track पर "${track.displayStatus}" status देखें।`,
    language,
  );
}

function startServiceReply(message: string, language: 'en' | 'hi'): CopilotGuideResult {
  const text = message.toLowerCase();
  let route = `${ROUTES.INITIATE_PROJECT}?service=construction&from=copilot`;
  let label = t('construction', 'निर्माण', language);

  if (/solar|सोलर|सूर्य/.test(text)) {
    route = `${ROUTES.INITIATE_PROJECT}?service=solar&from=copilot`;
    label = t('solar', 'सोलर', language);
  } else if (/land|जमीन|ज़मीन|property/.test(text)) {
    route = `${ROUTES.INITIATE_PROJECT}?service=land&from=copilot`;
    label = t('land', 'ज़मीन', language);
  } else if (/interior|renovation|इंटीरियर/.test(text)) {
    route = `${ROUTES.INITIATE_PROJECT}?service=interior&from=copilot`;
    label = t('interior', 'इंटीरियर', language);
  } else if (/architect|consultant|expert|विशेषज्ञ|आर्किटेक्ट/.test(text)) {
    return {
      success: true,
      mode: 'context',
      intent: 'start_service',
      language,
      reply: t(
        'Browse verified experts on the consultants directory. I do not invent consultant profiles.',
        'Consultants directory पर verified experts देखें। मैं consultant profiles नहीं बनाता।',
        language,
      ),
      actions: [
        actionNavigate(ROUTES.CONSULTANTS, 'Find experts', 'विशेषज्ञ खोजें'),
      ],
      casesCount: 0,
    };
  } else if (/boq|material/.test(text)) {
    route = `${ROUTES.INITIATE_PROJECT}?service=boq&from=copilot`;
    label = t('BOQ / material', 'BOQ / material', language);
  }

  return {
    success: true,
    mode: 'context',
    intent: 'start_service',
    language,
    reply: t(
      `Starting a new requirement for ${label}. Cases are created only when you submit the wizard.`,
      `${label} के लिए नई requirement शुरू करें। Case केवल wizard submit पर server से बनेगा।`,
      language,
    ),
    actions: [actionNavigate(route, 'Open requirement wizard', 'Requirement wizard खोलें')],
    casesCount: 0,
  };
}

export function buildCopilotGuide(
  user: SafeUser,
  message: string,
  opts?: { activeCaseRef?: string },
): CopilotGuideResult {
  const language = isHindi(message) ? 'hi' : 'en';
  const intent = detectGuideIntent(message);
  const visible = getVisibleCasesForUser(user);

  if (intent === 'start_service') {
    const result = startServiceReply(message, language);
    result.casesCount = visible.length;
    return result;
  }

  const caseToken = message.match(CASE_ID_PATTERN)?.[1]?.toUpperCase();
  if (caseToken) {
    const globalCase = store.getCase(caseToken);
    if (!globalCase) {
      return {
        success: true,
        mode: 'context',
        intent: 'not_found',
        language,
        reply: t(
          'No case found on server for that ID. Verify the Case ID format.',
          'Server पर उस ID के लिए case नहीं मिला। Case ID format जाँचें।',
          language,
        ),
        actions: [actionNavigate(ROUTES.TRACK_REQUEST, 'Open Track', 'Track खोलें')],
        casesCount: visible.length,
      };
    }
    const authorized = visible.find(
      (c) => c.id === globalCase.id || c.caseReference.toUpperCase() === caseToken,
    );
    if (!authorized) {
      return {
        success: true,
        mode: 'context',
        intent: 'forbidden',
        language,
        reply: t(
          'That Case ID is not in your authorized account. I cannot show private data for cases you do not own or are not assigned to.',
          'यह Case ID आपके authorized account में नहीं है। आपके बिना access वाले cases का private data नहीं दिखा सकता।',
          language,
        ),
        actions: [
          actionNavigate(ROUTES.TRACK_REQUEST, 'Track your cases', 'अपने cases Track करें'),
        ],
        casesCount: visible.length,
      };
    }
  }

  if (visible.length === 0) {
    return {
      success: true,
      mode: 'context',
      intent: 'no_cases',
      language,
      reply: t(
        'No cases linked to your account on server yet. Start a requirement to get a Case ID.',
        'आपके account से server पर अभी कोई case linked नहीं। Case ID के लिए requirement शुरू करें।',
        language,
      ),
      actions: [
        actionNavigate(
          `${ROUTES.INITIATE_PROJECT}?from=copilot`,
          'Start requirement',
          'Requirement शुरू करें',
        ),
        actionNavigate(ROUTES.TRACK_REQUEST, 'Track with Case ID', 'Case ID से Track'),
      ],
      casesCount: 0,
    };
  }

  if (intent === 'my_cases') {
    return {
      success: true,
      mode: 'context',
      intent: 'my_cases',
      language,
      reply: listCasesReply(visible, language),
      actions: visible.slice(0, 3).map((c) =>
        actionTrack(c.caseReference, `Track ${c.caseReference}`, `Track ${c.caseReference}`),
      ),
      casesCount: visible.length,
    };
  }

  const resolved = resolveAuthorizedCase(user, message, opts?.activeCaseRef);

  if ('forbidden' in resolved && resolved.forbidden) {
    return {
      success: true,
      mode: 'context',
      intent: 'forbidden',
      language,
      reply: t(
        'That Case ID is not in your authorized account. I cannot show private data for cases you do not own or are not assigned to.',
        'यह Case ID आपके authorized account में नहीं है। आपके बिना access वाले cases का private data नहीं दिखा सकता।',
        language,
      ),
      actions: [
        actionNavigate(ROUTES.TRACK_REQUEST, 'Track your cases', 'अपने cases Track करें'),
      ],
      casesCount: visible.length,
    };
  }

  if ('notFound' in resolved && resolved.notFound && message.match(CASE_ID_PATTERN)) {
    return {
      success: true,
      mode: 'context',
      intent: 'not_found',
      language,
      reply: t(
        'No case found on server for that ID. Verify the Case ID format.',
        'Server पर उस ID के लिए case नहीं मिला। Case ID format जाँचें।',
        language,
      ),
      actions: [actionNavigate(ROUTES.TRACK_REQUEST, 'Open Track', 'Track खोलें')],
      casesCount: visible.length,
    };
  }

  if ('pick' in resolved && resolved.pick) {
    return {
      success: true,
      mode: 'context',
      intent: 'pick_case',
      language,
      reply: t(
        `You have ${resolved.pick.length} cases. Send a Case ID or pick one:\n${resolved.pick
          .slice(0, 5)
          .map((c) => `• ${c.caseReference}`)
          .join('\n')}`,
        `आपके ${resolved.pick.length} cases हैं। Case ID भेजें या चुनें:\n${resolved.pick
          .slice(0, 5)
          .map((c) => `• ${c.caseReference}`)
          .join('\n')}`,
        language,
      ),
      actions: resolved.pick.slice(0, 3).map((c) =>
        actionTrack(c.caseReference, `Open ${c.caseReference}`, `${c.caseReference} खोलें`),
      ),
      casesCount: visible.length,
    };
  }

  if (!('caseRecord' in resolved) || !resolved.caseRecord) {
    return {
      success: true,
      mode: 'context',
      intent: 'not_found',
      language,
      reply: t('Could not resolve a case from server.', 'Server से case resolve नहीं हो पाया।', language),
      actions: [],
      casesCount: visible.length,
    };
  }

  const caseRecord = resolved.caseRecord;
  const track = store.getTrackView(caseRecord.caseReference, user);
  if (!track) {
    return {
      success: true,
      mode: 'context',
      intent: 'not_found',
      language,
      reply: t('Case data unavailable on server.', 'Server पर case data उपलब्ध नहीं।', language),
      actions: [],
      casesCount: visible.length,
      activeCaseRef: caseRecord.caseReference,
    };
  }

  const baseActions: GuideAction[] = [
    actionTrack(caseRecord.caseReference, 'Open Track', 'Track खोलें'),
    actionNavigate(`${ROUTES.CASES}`, 'Open dashboard', 'Dashboard खोलें'),
  ];

  let reply = '';

  switch (intent) {
    case 'case_status':
      reply = t(
        `${caseRecord.caseReference}: ${track.displayStatus} (${track.status}). City: ${track.city || caseRecord.city || '—'}.`,
        `${caseRecord.caseReference}: ${track.displayStatus} (${track.status}). शहर: ${track.city || caseRecord.city || '—'}।`,
        language,
      );
      break;
    case 'boq_status':
      reply = boqReply(caseRecord, user, language);
      break;
    case 'quotation_status':
      reply = quotationReply(caseRecord, user, language);
      baseActions.unshift(
        actionNavigate(ROUTES.COMMERCIAL_SUITE, 'Compare quotations', 'कोट तुलना'),
      );
      break;
    case 'assigned_expert':
      reply = expertReply(caseRecord, language);
      baseActions.unshift(actionNavigate(ROUTES.CONSULTANTS, 'Browse experts', 'विशेषज्ञ देखें'));
      break;
    case 'milestones':
      reply = milestonesReply(track, language);
      break;
    case 'messages_docs':
      reply = messagesDocsReply(caseRecord, language);
      break;
    case 'pending_action':
      reply = pendingActionForCase(caseRecord, language);
      break;
    case 'next_step':
    default:
      reply = `${t('Current status', 'वर्तमान स्थिति', language)}: ${track.displayStatus}\n\n${nextStepFromTrack(track, language)}`;
      break;
  }

  if (intent !== 'pending_action' && intent !== 'next_step') {
    reply += `\n\n${pendingActionForCase(caseRecord, language)}`;
  }

  return {
    success: true,
    mode: 'context',
    intent,
    language,
    reply,
    actions: baseActions,
    activeCaseRef: caseRecord.caseReference,
    casesCount: visible.length,
  };
}
