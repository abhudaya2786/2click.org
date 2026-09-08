import React, { useMemo } from 'react';
import { PageContainer } from '../components/ui/PageContainer';
import { Badge } from '../components/ui/Badge';
import { useSearchParams } from 'react-router-dom';
import { HelpCircle, MessageSquare, ShieldCheck, UserCheck } from 'lucide-react';
import { GuidedRequirementWizard } from '../components/forms/GuidedRequirementWizard';
import { PageHeroMedia } from '../components/ui/ResponsiveMedia';
import { mapSearchParamToService } from '../lib/servicesRegistry';
import { serviceMediaKey } from '../lib/serviceMedia';
import { PRIMARY_CTA_LABEL } from '../lib/homeGoals';
import { readCopilotWizardPrefill } from '../lib/copilotPrefill';
import { useLanguage } from '../contexts/LanguageContext';

export const InitiateProjectPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const rawServiceParam =
    searchParams.get('service') ||
    searchParams.get('category') ||
    searchParams.get('pillar') ||
    searchParams.get('type');
  const cityParam = searchParams.get('city');
  const specialistName = searchParams.get('specialist') || undefined;
  const privateDiscussion = searchParams.get('privacy') === 'case-only' || Boolean(specialistName);

  const currentService = useMemo(() => mapSearchParamToService(rawServiceParam), [rawServiceParam]);
  const copilotPrefill = useMemo(() => readCopilotWizardPrefill(), []);

  const initialCity = cityParam || copilotPrefill?.city;

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-6 sm:py-10">
      <PageContainer>
        <div className="mx-auto mb-6 max-w-3xl">
          <PageHeroMedia assetKey={serviceMediaKey(currentService.id)} className="rounded-2xl" />
        </div>
        <div className="mx-auto mb-4 max-w-xl text-center sm:max-w-2xl sm:text-left">
          <Badge variant="primary" size="md" icon={<HelpCircle className="w-3.5 h-3.5" />}>
            {t(PRIMARY_CTA_LABEL, 'आवश्यकता शुरू करें')}
          </Badge>
          <h1 className="mt-3 text-2xl font-extrabold text-[var(--color-text)] sm:text-3xl">
            {t('Tell us what you need', 'हमें बताएं आपको क्या चाहिए')}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            {t(
              'Simple guided intake — get a real Case ID in minutes. Technical details come later from your expert.',
              'सरल guided intake — मिनटों में असली Case ID। तकनीकी विवरण बाद में विशेषज्ञ से।'
            )}
          </p>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[var(--color-primary)] sm:justify-start">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            <span>{t('Desk', 'डेस्क')}: {currentService.assignedDesk}</span>
          </div>
        </div>

        {privateDiscussion && (
          <section className="mx-auto mb-5 max-w-2xl overflow-hidden rounded-2xl border border-[#C9DDD5] bg-[#F1F7F3]" aria-labelledby="private-discussion-title">
            <div className="flex items-start gap-3 border-b border-[#C9DDD5] p-4 sm:p-5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]" aria-hidden />
              <div>
                <h2 id="private-discussion-title" className="text-sm font-extrabold text-[var(--color-text)]">{t('Private consultant discussion', 'निजी कंसल्टेंट चर्चा')}</h2>
                <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                  {t(
                    `Your phone and email stay with BuildEcoGroup's coordination desk and are not shown to ${specialistName || 'the consultant'}.`,
                    `आपका फोन और ईमेल BuildEcoGroup coordination desk के पास सुरक्षित रहेगा और ${specialistName || 'कंसल्टेंट'} को नहीं दिखेगा।`
                  )}
                </p>
              </div>
            </div>
            <div className="grid gap-px bg-[#C9DDD5] sm:grid-cols-3">
              {[
                { icon: ShieldCheck, title: t('1. Create Case ID', '1. Case ID बनाएं'), text: t('Contact stays private', 'संपर्क निजी रहेगा') },
                { icon: UserCheck, title: t('2. Expert assigned', '2. विशेषज्ञ जुड़ेगा'), text: t('Only project scope is shared', 'केवल प्रोजेक्ट scope साझा होगा') },
                { icon: MessageSquare, title: t('3. Discuss in Messages', '3. Messages में चर्चा'), text: t('No direct number exchange', 'मोबाइल नंबर साझा नहीं होगा') },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-2 bg-[#F8FBF9] p-3.5">
                  <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" aria-hidden />
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text)]">{item.title}</p>
                    <p className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <GuidedRequirementWizard
          key={currentService.id}
          initialServiceId={currentService.id}
          initialCity={initialCity}
          specialistName={specialistName}
          privateDiscussion={privateDiscussion}
          skipServiceStep={searchParams.get('from') === 'copilot' || searchParams.get('source') === 'dashboard' || copilotPrefill?.skipServiceStep}
        />
      </PageContainer>
    </div>
  );
};
