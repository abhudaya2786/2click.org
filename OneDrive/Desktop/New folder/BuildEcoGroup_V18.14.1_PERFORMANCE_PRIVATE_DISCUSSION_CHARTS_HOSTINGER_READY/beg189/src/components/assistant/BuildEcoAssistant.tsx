import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ExternalLink, Loader2, Phone, Send, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { AppIcon } from '../ui/AppIcon';
import { trackRequestApi } from '../../lib/api';
import { copilotGuideApi, mapGuideActions } from '../../lib/copilotApi';
import {
  COPILOT_QUICK_ACTIONS,
  CopilotQuickAction,
  CopilotQuickActionId,
  getCopilotQuickAction,
} from '../../lib/copilotConfig';
import {
  buildCityQuestion,
  buildHumanHandoffReply,
  buildServiceStartReply,
  detectCopilotIntent,
  explainNextAction,
  extractCaseId,
  formatTrackSummary,
  isLikelyCityAnswer,
  CopilotUiAction,
} from '../../lib/copilotEngine';
import { saveCopilotWizardPrefill } from '../../lib/copilotPrefill';
import { captureProductEvent, PRODUCT_EVENTS } from '../../lib/analytics';
import { ROUTES } from '../../lib/routes';

type CopilotMessage = {
  role: 'user' | 'assistant';
  text: string;
  actions?: CopilotUiAction[];
};

type PendingFlow =
  | { type: 'track' }
  | { type: 'collect_city'; actionId: CopilotQuickActionId }
  | null;

const AUTH_CONTEXT_PROMPTS = [
  { en: 'My cases', hi: 'मेरे cases', message: 'my cases' },
  { en: 'Next step?', hi: 'अगला कदम?', message: 'agla step kya hai' },
  { en: 'BOQ ready?', hi: 'BOQ ready?', message: 'mera BOQ ready hai?' },
  { en: 'Case status', hi: 'केस status', message: 'mera case kaha tak pahucha' },
];

export const BuildEcoAssistant: React.FC = () => {
  const { language, t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState('');
  const [pendingFlow, setPendingFlow] = useState<PendingFlow>(null);
  const [activeCaseRef, setActiveCaseRef] = useState<string | undefined>();
  const endRef = useRef<HTMLDivElement>(null);

  const welcome = isAuthenticated
    ? t(
        `Namaste ${user?.fullName?.split(' ')[0] || ''}! BuildEco Copilot is your context-aware project guide.\n\nAsk about your cases, BOQ, quotations, milestones or next step — in Hindi or English. Answers come only from authorized server data.`,
        `नमस्ते ${user?.fullName?.split(' ')[0] || ''}! BuildEco Copilot आपका context-aware project guide है।\n\nअपने cases, BOQ, quotations, milestones या अगले step के बारे में Hindi/English में पूछें। जवाब केवल authorized server data से।`
      )
    : t(
        'Namaste! I am BuildEco Copilot — your guided assistant over real workflows.\n\nPick a quick action below or tell me what you need in Hindi or English. I only use real server data — never invented Case IDs, prices or consultants.',
        'नमस्ते! मैं BuildEco Copilot हूँ — असली workflows पर guided सहायक।\n\nनीचे quick action चुनें या Hindi/English में बताएं। मैं केवल server का असली data दिखाता हूँ — Case ID, कीमत या consultant नहीं बनाता।'
      );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  useEffect(() => {
    setMessages([{ role: 'assistant', text: welcome }]);
    setPendingFlow(null);
  }, [language, welcome, isAuthenticated, user?.fullName]);

  const pushAssistant = useCallback((msg: Omit<CopilotMessage, 'role'>) => {
    setMessages((prev) => [...prev, { role: 'assistant', ...msg }]);
  }, []);

  const pushUser = useCallback((text: string) => {
    setMessages((prev) => [...prev, { role: 'user', text }]);
  }, []);

  const openWizardForAction = useCallback(
    (action: CopilotQuickAction, city?: string) => {
      captureProductEvent(PRODUCT_EVENTS.COPILOT_CONVERSION, {
        action_id: action.id,
        destination: action.route,
        opens_wizard: Boolean(action.opensWizard),
        has_city: Boolean(city),
      });
      if (action.opensWizard && action.serviceId) {
        saveCopilotWizardPrefill({
          serviceId: action.serviceId,
          city,
          skipServiceStep: true,
        });
        const route =
          city
            ? `${action.route}${action.route.includes('?') ? '&' : '?'}city=${encodeURIComponent(city)}`
            : action.route;
        navigate(route);
        return;
      }
      navigate(action.route);
    },
    [navigate]
  );

  const handleTrackLookup = useCallback(
    async (caseId: string) => {
      setBusy(true);
      try {
        const { track } = await trackRequestApi(caseId);
        const summary = formatTrackSummary(track, language);
        const next = explainNextAction(track, language);
        pushAssistant({
          text: `${summary}\n\n${next}`,
          actions: [
            {
              type: 'track_page',
              caseRef: track.reference,
              labelEn: 'Open full Track page',
              labelHi: 'पूरा Track पेज खोलें',
            },
          ],
        });
        setPendingFlow(null);
      } catch (err) {
        pushAssistant({
          text: t(
            `No record found for "${caseId}". Please verify your Case ID format (BEG-2026-XXXXXXXX). I cannot show status without a real server record.`,
            `"${caseId}" के लिए record नहीं मिला। Case ID format (BEG-2026-XXXXXXXX) जाँचें। बिना असली server record के status नहीं दिखा सकता।`
          ),
          actions: [
            {
              type: 'navigate',
              route: ROUTES.TRACK_REQUEST,
              labelEn: 'Try on Track page',
              labelHi: 'Track पेज पर कोशिश करें',
            },
            ...buildHumanHandoffReply(language).actions.slice(0, 1),
          ],
        });
        setPendingFlow({ type: 'track' });
      } finally {
        setBusy(false);
      }
    },
    [language, pushAssistant, t]
  );

  const handleQuickAction = useCallback(
    (actionId: CopilotQuickActionId) => {
      const action = getCopilotQuickAction(actionId);
      const label = language === 'hi' ? action.labelHi : action.labelEn;
      pushUser(label);

      if (actionId === 'track') {
        const reply = buildServiceStartReply(action, language);
        pushAssistant(reply);
        setPendingFlow({ type: 'track' });
        return;
      }

      if (actionId === 'expert') {
        const reply = buildServiceStartReply(action, language);
        pushAssistant(reply);
        openWizardForAction(action);
        return;
      }

      const reply = buildServiceStartReply(action, language);
      pushAssistant({
        text: buildCityQuestion(action, language),
      });
      setPendingFlow({ type: 'collect_city', actionId });
    },
    [language, openWizardForAction, pushAssistant, pushUser]
  );

  const processMessage = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busy) return;
      pushUser(text);
      setInput('');
      setBusy(true);

      try {
        if (pendingFlow?.type === 'track') {
          const id = extractCaseId(text) ?? text;
          await handleTrackLookup(id);
          return;
        }

        if (pendingFlow?.type === 'collect_city' && isLikelyCityAnswer(text)) {
          const action = getCopilotQuickAction(pendingFlow.actionId);
          const city = text.trim();
          const reply = buildServiceStartReply(action, language, city);
          pushAssistant(reply);
          openWizardForAction(action, city);
          setPendingFlow(null);
          return;
        }

        if (isAuthenticated) {
          try {
            const guide = await copilotGuideApi(text, activeCaseRef);
            if (guide.activeCaseRef) setActiveCaseRef(guide.activeCaseRef);
            pushAssistant({
              text: guide.reply,
              actions: mapGuideActions(guide.actions, language),
            });
            setPendingFlow(null);
            return;
          } catch (guideErr) {
            console.warn('[Copilot] Guide API unavailable, falling back to public flow', guideErr);
          }
        }

        const intent = detectCopilotIntent(text);

        if (intent.type === 'track') {
          if (intent.caseId) {
            await handleTrackLookup(intent.caseId);
            return;
          }
          pushAssistant(buildServiceStartReply(getCopilotQuickAction('track'), language));
          setPendingFlow({ type: 'track' });
          return;
        }

        if (intent.type === 'human_handoff') {
          pushAssistant(buildHumanHandoffReply(language));
          setPendingFlow(null);
          return;
        }

        if (intent.type === 'start_service' && intent.actionId) {
          const action = getCopilotQuickAction(intent.actionId);
          if (action.id === 'expert') {
            pushAssistant(buildServiceStartReply(action, language));
            openWizardForAction(action);
            setPendingFlow(null);
            return;
          }
          if (action.id === 'track') {
            pushAssistant(buildServiceStartReply(action, language));
            setPendingFlow({ type: 'track' });
            return;
          }
          pushAssistant({ text: buildCityQuestion(action, language) });
          setPendingFlow({ type: 'collect_city', actionId: action.id });
          return;
        }

        const response = await fetch('/api/assistant/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            page: location.pathname,
            history: messages.slice(-8).map((m) => ({ role: m.role, text: m.text })),
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        pushAssistant({
          text: `${data.reply}\n\n${t('Tip: use quick actions for Build, Land, Solar, BOQ, Experts or Track.', 'टिप: Build, Land, Solar, BOQ, Experts या Track के लिए quick actions उपयोग करें।')}`,
          actions: buildHumanHandoffReply(language).actions.slice(0, 1),
        });
      } catch {
        pushAssistant({
          text: t(
            'Connection issue. Use quick actions below or contact our coordinators.',
            'Connection समस्या। नीचे quick actions या coordinators से संपर्क करें।'
          ),
          actions: buildHumanHandoffReply(language).actions,
        });
      } finally {
        setBusy(false);
      }
    },
    [
      busy,
      handleTrackLookup,
      language,
      location.pathname,
      messages,
      activeCaseRef,
      isAuthenticated,
      openWizardForAction,
      pendingFlow,
      pushAssistant,
      pushUser,
      t,
    ]
  );

  const send = (preset?: string) => {
    void processMessage(preset ?? input);
  };

  const renderAction = (action: CopilotUiAction, index: number) => {
    const label = language === 'hi' ? action.labelHi : action.labelEn;
    if (action.type === 'navigate' || action.type === 'track_page') {
      const route =
        action.type === 'track_page' ? `${ROUTES.TRACK_REQUEST}/${action.caseRef}` : action.route;
      return (
        <Link
          key={index}
          to={route}
          onClick={() => setOpen(false)}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#B9D9E6] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-bold text-[#0B6687] hover:bg-[#EDF8FC]"
        >
          {label}
          <ArrowRight className="h-3 w-3" />
        </Link>
      );
    }
    if (action.type === 'call') {
      return (
        <a
          key={index}
          href={`tel:${action.phone.replace(/\s/g, '')}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#B9D9E6] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-bold text-[#0B6687] hover:bg-[#EDF8FC]"
        >
          <Phone className="h-3 w-3" />
          {label}
        </a>
      );
    }
    return null;
  };

  return (
    <>
      {open && (
        <section
          className="fixed bottom-[4.75rem] left-2 right-2 z-[90] flex h-[min(640px,calc(100dvh-6rem))] flex-col overflow-hidden rounded-[24px] border border-[#C6DEE8] bg-[var(--color-surface)] shadow-[0_24px_70px_rgba(15,54,75,.24)] sm:left-auto sm:right-4 sm:w-[min(420px,calc(100vw-2rem))] lg:bottom-6 lg:right-6"
          aria-label={t('BuildEco Copilot', 'BuildEco Copilot')}
          data-testid="buildEco-copilot-panel"
        >
          <header className="flex items-center gap-3 bg-gradient-to-r from-[#0F364B] via-[#087FA6] to-[#1697C4] px-4 py-3.5 text-white">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--color-surface)]/15 ring-1 ring-white/20">
              <AppIcon name="copilot" size="md" decorative className="text-white" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-extrabold tracking-tight">BuildEco Copilot</h2>
              <p className="text-[11px] text-sky-100">
                {isAuthenticated
                  ? t('Context-aware · Your cases · EN/HI', 'Context-aware · आपके cases · EN/HI')
                  : t('Guided · Real workflows · EN/HI', 'Guided · असली workflows · EN/HI')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 hover:bg-[var(--color-surface)]/10"
              aria-label={t('Close Copilot', 'Copilot बंद करें')}
            >
              <X size={20} />
            </button>
          </header>

          <div className="border-b border-[#DCEAF0] bg-[var(--color-background)] px-3 py-2.5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#557482]">
              {t('Quick actions', 'त्वरित क्रियाएँ')}
            </p>
            <div
              className="grid grid-cols-2 gap-1.5 sm:grid-cols-3"
              data-testid="copilot-quick-actions"
            >
              {COPILOT_QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  data-testid={`copilot-action-${action.id}`}
                  onClick={() => handleQuickAction(action.id)}
                  disabled={busy}
                  className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-2 text-left text-[11px] font-bold leading-tight text-[var(--color-brand-brown)] transition hover:border-[#1697C4] hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
                >
                  <AppIcon name={action.icon} size="sm" decorative />
                  <span className="line-clamp-2">
                    {language === 'hi' ? action.labelHi : action.labelEn}
                  </span>
                </button>
              ))}
            </div>
            {isAuthenticated && (
              <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5" data-testid="copilot-context-chips">
                {AUTH_CONTEXT_PROMPTS.map((chip) => (
                  <button
                    key={chip.message}
                    type="button"
                    onClick={() => send(chip.message)}
                    disabled={busy}
                    className="shrink-0 min-h-11 rounded-full border border-[#1697C4]/30 bg-[var(--color-surface-muted)] px-2.5 py-1 text-[10px] font-bold text-[#0B6687]"
                  >
                    {language === 'hi' ? chip.hi : chip.en}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[var(--color-background)] p-3 sm:p-4" aria-live="polite">
            {messages.map((item, index) => (
              <div
                key={index}
                className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    item.role === 'user'
                      ? 'rounded-br-md bg-[#087FA6] text-white'
                      : 'rounded-bl-md border border-[#D6E7EE] bg-[var(--color-surface)] text-[var(--color-brand-brown)]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{item.text}</p>
                  {item.actions && item.actions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">{item.actions.map(renderAction)}</div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-xs font-medium text-[#557482]">
                <Loader2 className="animate-spin" size={15} />
                {t('Working on real server data…', 'Server data पर काम हो रहा है…')}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-[#DCEAF0] bg-[var(--color-surface)] p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-end gap-2 rounded-2xl border border-[#B9D9E6] bg-[var(--color-surface)] p-2 focus-within:ring-2 focus-within:ring-[#25A9D6]/30"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                maxLength={1200}
                rows={1}
                placeholder={t('Hindi or English…', 'Hindi या English…')}
                className="max-h-24 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
                aria-label={t('Copilot message', 'Copilot संदेश')}
                data-testid="copilot-input"
              />
              <button
                type="submit"
                disabled={!input.trim() || busy}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F28B24] text-white disabled:opacity-40"
                aria-label={t('Send', 'भेजें')}
              >
                <Send size={18} />
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between text-[10px] text-[#617B87]">
              <span>{t('Real data only — no invented Case IDs', 'केवल असली data')}</span>
              <Link
                to={ROUTES.CONTACT}
                className="flex items-center gap-1 font-semibold text-[#0B6687]"
                onClick={() => setOpen(false)}
              >
                {t('Human expert', 'मानव विशेषज्ञ')}
                <ExternalLink size={11} />
              </Link>
            </div>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => {
          setOpen(true);
          captureProductEvent(PRODUCT_EVENTS.COPILOT_OPENED, { source: 'fab' });
        }}
        className={`${
          open ? 'hidden' : 'flex'
        } fixed bottom-[4.75rem] right-3 z-[91] h-14 min-w-[3.5rem] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0F6F91] to-[#1697C4] px-4 text-white shadow-[0_12px_30px_rgba(15,111,145,.4)] transition hover:-translate-y-0.5 lg:bottom-6 lg:right-6`}
        aria-expanded={open}
        aria-label={t('Open BuildEco Copilot', 'BuildEco Copilot खोलें')}
        data-testid="copilot-fab"
      >
        <AppIcon name="copilot" size="lg" decorative className="text-white" />
        <span className="max-w-[7rem] truncate text-xs font-extrabold sm:text-sm">
          {t('Copilot', 'Copilot')}
        </span>
      </button>
    </>
  );
};
