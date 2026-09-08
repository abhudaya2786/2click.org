import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Copy,
  Loader2,
  Eye,
  MapPinned,
  Navigation,
  ImagePlus,
  Ruler,
  ShieldCheck,
  Trash2,
  User,
  AlertCircle,
} from 'lucide-react';
import { AppIcon, ServiceIdIcon } from '../ui/AppIcon';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ROUTES } from '../../lib/routes';
import { createCaseApi } from '../../lib/api';
import { buildCaseIntakeFromGuidedWizard } from '../../lib/guidedWizardSubmit';
import {
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
  WIZARD_PRIMARY_SERVICE_IDS,
  WIZARD_STEP_ORDER,
  WizardStepId,
  getDetailFieldsForService,
  resolveInitialService,
  serviceNeedsBudgetStep,
} from '../../lib/guidedWizardConfig';
import { SERVICES_CATALOG, ServiceDefinition, getServiceById } from '../../lib/servicesRegistry';
import { clearCopilotWizardPrefill, readCopilotWizardPrefill } from '../../lib/copilotPrefill';
import { captureProductEvent, PRODUCT_EVENTS } from '../../lib/analytics';
import { cn } from '../../lib/cn';
import {
  MAX_SITE_PHOTOS,
  prepareSitePhoto,
  SiteCoordinates,
  SitePhotoAttachment,
} from '../../lib/siteMedia';
import {
  buildMeasurementEntries,
  getServiceEvidenceGuide,
} from '../../lib/serviceEvidenceConfig';
import { LiveSiteCameraModal } from './LiveSiteCameraModal';

interface GuidedRequirementWizardProps {
  initialServiceId?: string;
  initialCity?: string;
  skipServiceStep?: boolean;
  onSuccess?: (caseReference: string) => void;
  onCancel?: () => void;
  isModal?: boolean;
  specialistName?: string;
  privateDiscussion?: boolean;
}

export const GuidedRequirementWizard: React.FC<GuidedRequirementWizardProps> = ({
  initialServiceId,
  initialCity,
  skipServiceStep = false,
  onSuccess,
  onCancel,
  isModal = false,
  specialistName,
  privateDiscussion = false,
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [step, setStep] = useState<WizardStepId>('service');
  const [selectedService, setSelectedService] = useState<ServiceDefinition>(() =>
    resolveInitialService(initialServiceId)
  );
  const [details, setDetails] = useState<Record<string, string>>({});
  const [locationCity, setLocationCity] = useState('Lucknow');
  const [pincode, setPincode] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [sitePhotos, setSitePhotos] = useState<SitePhotoAttachment[]>([]);
  const [siteCoordinates, setSiteCoordinates] = useState<SiteCoordinates | null>(null);
  const [siteMeasurements, setSiteMeasurements] = useState<Record<string, string>>({});
  const [selectedShotType, setSelectedShotType] = useState('site-overview');
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [isPreparingPhotos, setIsPreparingPhotos] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [budgetRange, setBudgetRange] = useState('discuss');
  const [targetTimeline, setTargetTimeline] = useState('1-3m');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState<'CALL' | 'WHATSAPP' | 'EMAIL'>('WHATSAPP');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [showMoreServices, setShowMoreServices] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [caseReference, setCaseReference] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    captureProductEvent(PRODUCT_EVENTS.REQUIREMENT_STARTED, {
      service_id: selectedService.id,
      entry: skipServiceStep ? 'copilot_prefill' : 'wizard',
      discussion_mode: privateDiscussion ? 'case_only' : 'standard',
    });
    if (privateDiscussion) {
      captureProductEvent(PRODUCT_EVENTS.PRIVATE_CONSULTATION_STARTED, {
        service_id: selectedService.id,
        source: 'consultant_profile',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once on wizard mount
  }, []);

  useEffect(() => {
    if (user) {
      setClientName(user.fullName || '');
      setClientEmail(user.email || '');
      if (user.phone) setClientPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    if (initialServiceId) {
      setSelectedService(resolveInitialService(initialServiceId));
      setDetails({});
      setSitePhotos([]);
      setSiteMeasurements({});
    }
  }, [initialServiceId]);

  useEffect(() => {
    const prefill = readCopilotWizardPrefill();
    if (prefill?.city || initialCity) {
      setLocationCity(prefill?.city || initialCity || 'Lucknow');
    }
    if (prefill?.note) {
      setSiteAddress(prefill.note);
    }
    if (skipServiceStep || prefill?.skipServiceStep) {
      setStep('location');
    }
    if (prefill) clearCopilotWizardPrefill();
  }, [initialCity, skipServiceStep]);

  const activeSteps = useMemo((): Array<Exclude<WizardStepId, 'success'>> => {
    const base = WIZARD_STEP_ORDER.filter((s): s is Exclude<WizardStepId, 'success'> => s !== 'success');
    if (!serviceNeedsBudgetStep(selectedService)) {
      return base.filter((s) => s !== 'budget');
    }
    return base;
  }, [selectedService]);

  const stepIndex = step === 'success' ? activeSteps.length - 1 : activeSteps.indexOf(step as Exclude<WizardStepId, 'success'>);
  const progressPct = step === 'success' ? 100 : Math.round(((stepIndex + 1) / activeSteps.length) * 100);

  const stepLabels: Record<WizardStepId, { en: string; hi: string }> = {
    service: { en: 'What do you need?', hi: 'आपको क्या चाहिए?' },
    location: { en: 'Location', hi: 'स्थान' },
    details: { en: 'Project details', hi: 'प्रोजेक्ट विवरण' },
    budget: { en: 'Budget & timeline', hi: 'बजट और समयसीमा' },
    contact: { en: 'Your contact', hi: 'आपका संपर्क' },
    review: { en: 'Review', hi: 'समीक्षा' },
    success: { en: 'Case created', hi: 'केस बन गया' },
  };

  const detailFields = getDetailFieldsForService(selectedService.id);
  const evidenceGuide = useMemo(
    () => getServiceEvidenceGuide(selectedService.id),
    [selectedService.id]
  );
  const measurementEntries = useMemo(
    () => buildMeasurementEntries(evidenceGuide, siteMeasurements, language),
    [evidenceGuide, siteMeasurements, language]
  );
  const selectedShot = evidenceGuide.shots.find((shot) => shot.id === selectedShotType) ?? evidenceGuide.shots[0];

  useEffect(() => {
    setSelectedShotType(evidenceGuide.shots[0]?.id || 'overview');
  }, [evidenceGuide]);

  const setDetail = (key: string, value: string) => {
    setDetails((prev) => ({ ...prev, [key]: value }));
  };

  const handleSitePhotos = async (
    files: FileList | File[] | null,
    captureMethod: 'UPLOAD' | 'MOBILE_CAMERA' | 'LIVE_CAMERA' = 'UPLOAD'
  ) => {
    if (!files || files.length === 0) return;
    const availableSlots = MAX_SITE_PHOTOS - sitePhotos.length;
    if (availableSlots <= 0) {
      setPhotoError(t(`You can add up to ${MAX_SITE_PHOTOS} photos.`, `अधिकतम ${MAX_SITE_PHOTOS} फोटो जोड़ सकते हैं।`));
      return;
    }

    const selected = Array.from(files).slice(0, availableSlots);
    const selectedShot = evidenceGuide.shots.find((shot) => shot.id === selectedShotType) ?? evidenceGuide.shots[0];
    setIsPreparingPhotos(true);
    setPhotoError(files.length > availableSlots
      ? t(`Only the first ${availableSlots} photo(s) were added.`, `केवल पहले ${availableSlots} फोटो जोड़े गए।`)
      : null);
    const prepared: SitePhotoAttachment[] = [];
    for (const file of selected) {
      try {
        prepared.push(await prepareSitePhoto(file, {
          shotType: selectedShot?.id,
          shotLabel: selectedShot ? (language === 'hi' ? selectedShot.labelHi : selectedShot.labelEn) : undefined,
          captureMethod,
          capturedAt: new Date().toISOString(),
        }));
      } catch (error: any) {
        setPhotoError(error?.message || t('A photo could not be prepared.', 'फोटो तैयार नहीं हो सका।'));
      }
    }
    if (prepared.length) setSitePhotos((current) => [...current, ...prepared].slice(0, MAX_SITE_PHOTOS));
    setIsPreparingPhotos(false);
  };

  const captureSiteLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      setGeoMessage(t('Location is not supported. Enter the address manually.', 'लोकेशन उपलब्ध नहीं है। पता मैन्युअली भरें।'));
      return;
    }

    setGeoStatus('loading');
    setGeoMessage(t('Detecting your current location…', 'आपकी लोकेशन खोजी जा रही है…'));
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coordinates: SiteCoordinates = {
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
          accuracyMeters: Math.round(position.coords.accuracy || 0),
          capturedAt: new Date().toISOString(),
        };
        setSiteCoordinates(coordinates);
        setGeoStatus('success');
        setGeoMessage(t('Exact site location attached.', 'साइट की सटीक लोकेशन जुड़ गई।'));

        try {
          const response = await fetch(
            `/api/geolocation/reverse?lat=${coordinates.latitude}&lon=${coordinates.longitude}`
          );
          const result = await response.json();
          if (response.ok && result.success) {
            if (result.city) setLocationCity(result.city);
            if (result.pincode) setPincode(String(result.pincode).replace(/\D/g, '').slice(0, 6));
          }
        } catch {
          // Coordinates are still valid even if reverse-geocoding is unavailable.
        }
      },
      () => {
        setGeoStatus('error');
        setGeoMessage(t('Location permission was denied. You can continue without it.', 'लोकेशन अनुमति नहीं मिली। इसके बिना भी आगे बढ़ सकते हैं।'));
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 }
    );
  };

  const validateStep = (current: Exclude<WizardStepId, 'success'>): string | null => {
    switch (current) {
      case 'service':
        return selectedService ? null : t('Please select a service', 'कृपया सेवा चुनें');
      case 'location':
        if (!locationCity.trim()) return t('City is required', 'शहर आवश्यक है');
        if (!siteAddress.trim() || siteAddress.trim().length < 3)
          return t('Please enter site address or landmark', 'पता या लैंडमार्क दर्ज करें');
        if (pincode && pincode.length < 6)
          return t('PIN code should be 6 digits', 'PIN 6 अंकों का होना चाहिए');
        return null;
      case 'details':
        for (const field of detailFields) {
          if (field.required && !details[field.key]?.trim()) {
            return t(`Please fill: ${field.labelEn}`, `भरें: ${field.labelHi}`);
          }
        }
        return null;
      case 'budget':
        if (!budgetRange) return t('Please select a budget range', 'बजट सीमा चुनें');
        if (!targetTimeline) return t('Please select a timeline', 'समयसीमा चुनें');
        return null;
      case 'contact':
        if (!clientName.trim()) return t('Name is required', 'नाम आवश्यक है');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail))
          return t('Valid email is required', 'वैध ईमेल आवश्यक है');
        if (!/^[0-9+\-\s]{10,15}$/.test(clientPhone.replace(/\s/g, '')))
          return t('Valid phone number is required', 'वैध फोन नंबर आवश्यक है');
        if (!consentAccepted)
          return t('Please accept the consent to proceed', 'आगे बढ़ने के लिए सहमति दें');
        return null;
      default:
        return null;
    }
  };

  const goNext = () => {
    if (step === 'success') return;
    const err = validateStep(step);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    const idx = activeSteps.indexOf(step);
    if (idx < activeSteps.length - 1) {
      setStep(activeSteps[idx + 1]);
    }
  };

  const goBack = () => {
    if (step === 'success') return;
    setStepError(null);
    const idx = activeSteps.indexOf(step);
    if (idx > 0) setStep(activeSteps[idx - 1]);
    else onCancel?.();
  };

  const handleSubmit = async () => {
    const err = validateStep('contact');
    if (err) {
      setStepError(err);
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const intake = buildCaseIntakeFromGuidedWizard({
        selectedService,
        details,
        locationCity,
        pincode: pincode || '000000',
        siteAddress,
        sitePhotos,
        siteCoordinates,
        siteMeasurements: measurementEntries,
        budgetRange,
        targetTimeline,
        clientName,
        clientEmail,
        clientPhone,
        preferredContact,
        specialistName,
        privateDiscussion,
      });
      const result = await createCaseApi(intake);
      setCaseReference(result.caseReference);
      setStep('success');
      captureProductEvent(PRODUCT_EVENTS.REQUIREMENT_COMPLETED, {
        service_id: selectedService.id,
        city: locationCity,
        budget_range: budgetRange,
        timeline: targetTimeline,
      });
      captureProductEvent(PRODUCT_EVENTS.CASE_CREATED, {
        service_id: selectedService.id,
        city: locationCity,
        budget_range: budgetRange,
      });
      onSuccess?.(result.caseReference);
    } catch (e: any) {
      setSubmitError(e.message || t('Submission failed. Please try again.', 'जमा करने में विफल।'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCaseId = () => {
    if (!caseReference) return;
    navigator.clipboard.writeText(caseReference);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const renderField = (field: ReturnType<typeof getDetailFieldsForService>[0]) => {
    const label = language === 'hi' ? field.labelHi : field.labelEn;
    const value = details[field.key] || '';

    if (field.type === 'select' && field.options) {
      return (
        <div key={field.key} className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text)]">{label}</label>
          <select
            value={value}
            onChange={(e) => setDetail(field.key, e.target.value)}
            className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-3 text-base sm:text-sm focus:border-[#1697C4] focus:outline-none focus:ring-1 focus:ring-[#1697C4]"
          >
            <option value="">{t('Select…', 'चुनें…')}</option>
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {language === 'hi' ? opt.labelHi : opt.labelEn}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.key} className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text)]">{label}</label>
          <textarea
            value={value}
            onChange={(e) => setDetail(field.key, e.target.value)}
            rows={3}
            placeholder={language === 'hi' ? field.placeholderHi : field.placeholderEn}
            className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-3 text-base sm:text-sm focus:border-[#1697C4] focus:outline-none focus:ring-1 focus:ring-[#1697C4]"
          />
        </div>
      );
    }

    return (
      <Input
        key={field.key}
        label={label}
        value={value}
        onChange={(e) => setDetail(field.key, e.target.value)}
        placeholder={language === 'hi' ? field.placeholderHi : field.placeholderEn}
      />
    );
  };

  const primaryServices = WIZARD_PRIMARY_SERVICE_IDS.map((id) => getServiceById(id)!);
  const extraServices = SERVICES_CATALOG.filter(
    (s) => !WIZARD_PRIMARY_SERVICE_IDS.includes(s.id as any)
  );

  return (
    <div
      className={cn(
        'mx-auto w-full pb-20 lg:pb-6',
        isModal ? 'px-4 py-5 sm:px-6' : 'max-w-xl px-4 py-6 sm:max-w-2xl sm:px-6'
      )}
      data-testid="guided-requirement-wizard"
    >
      <LiveSiteCameraModal
        isOpen={isLiveCameraOpen}
        onClose={() => setIsLiveCameraOpen(false)}
        shotLabel={selectedShot ? (language === 'hi' ? selectedShot.labelHi : selectedShot.labelEn) : t('Site overview', 'साइट का पूरा दृश्य')}
        onCapture={(file) => handleSitePhotos([file], 'LIVE_CAMERA')}
      />
      {privateDiscussion && step !== 'success' && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#C9DDD5] bg-[#F1F7F3] p-3.5 text-xs text-[var(--color-text-muted)]">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" aria-hidden />
          <span><strong className="text-[var(--color-text)]">Case-only discussion:</strong> {specialistName || 'the consultant'} will see the project brief, but not your phone or email.</span>
        </div>
      )}
      {step !== 'success' && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-subtle)]">
            <span>
              {t('Step', 'चरण')} {stepIndex + 1} / {activeSteps.length}
            </span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#D6E8F0]">
            <div
              className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t('Wizard progress', 'विज़ार्ड प्रगति')}
            />
          </div>
          <h2 className="mt-4 text-xl font-extrabold text-[var(--color-text)] sm:text-2xl">
            {language === 'hi' ? stepLabels[step].hi : stepLabels[step].en}
          </h2>
          {step === 'details' && (
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {t(
                'Keep it simple — your expert will collect technical details later.',
                'सरल रखें — विशेषज्ञ बाद में तकनीकी विवरण लेंगे।'
              )}
            </p>
          )}
        </div>
      )}

      {stepError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-4 flex items-start gap-2 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-xs text-[#DC2626]"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{stepError}</span>
        </div>
      )}

      {/* STEP: Service */}
      {step === 'service' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {primaryServices.map((svc) => (
              <button
                key={svc.id}
                type="button"
                data-testid={`wizard-service-${svc.id}`}
                onClick={() => {
                  setSelectedService(svc);
                  setDetails({});
                  setSitePhotos([]);
                  setSiteMeasurements({});
                }}
                aria-pressed={selectedService.id === svc.id}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-4 text-left transition-all touch-target',
                  selectedService.id === svc.id
                    ? 'border-[#1697C4] bg-[var(--color-surface-muted)] ring-2 ring-[#1697C4]/30'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[#1697C4]/50'
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-subtle)] text-[var(--color-primary)]">
                  <ServiceIdIcon serviceId={svc.id} size="md" />
                </span>
                <div>
                  <div className="text-sm font-bold text-[var(--color-text)]">{svc.shortTitle}</div>
                  <div className="mt-0.5 text-[11px] text-[var(--color-text-muted)] line-clamp-2">{svc.tagline}</div>
                </div>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowMoreServices((v) => !v)}
            className="text-xs font-bold text-[var(--color-primary)] hover:underline"
          >
            {showMoreServices
              ? t('Hide more services', 'और सेवाएँ छिपाएँ')
              : t('More services (water, GIS, surveillance…)', 'और सेवाएँ (वॉटर, GIS…)')}
          </button>
          {showMoreServices && (
            <div className="flex flex-wrap gap-2 pt-1">
              {extraServices.map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => {
                    setSelectedService(svc);
                    setDetails({});
                    setSitePhotos([]);
                    setSiteMeasurements({});
                  }}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors',
                    selectedService.id === svc.id
                      ? 'border-[#1697C4] bg-[var(--color-primary)] text-white'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-[#1697C4]'
                  )}
                >
                  {svc.shortTitle}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP: Location */}
      {step === 'location' && (
        <div className="space-y-4">
          <Input
            label={t('City', 'शहर')}
            value={locationCity}
            onChange={(e) => setLocationCity(e.target.value)}
            placeholder={t('e.g. Lucknow', 'जैसे लखनऊ')}
            leftIcon={<AppIcon name="location" size="sm" decorative />}
          />
          <Input
            label={t('PIN code (optional)', 'PIN कोड (वैकल्पिक)')}
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            placeholder="226010"
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--color-text)]">
              {t('Site address or landmark', 'साइट पता या लैंडमार्क')}
            </label>
            <textarea
              value={siteAddress}
              onChange={(e) => setSiteAddress(e.target.value)}
              rows={2}
              placeholder={t('e.g. Sultanpur Road, near SGPGI', 'जैसे सुल्तानपुर रोड')}
              className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-3 text-base sm:text-sm focus:border-[#1697C4] focus:outline-none focus:ring-1 focus:ring-[#1697C4]"
            />
          </div>

          <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]" aria-labelledby="service-evidence-title">
            <div className="border-b border-[var(--color-border)] bg-[var(--color-primary-subtle)] p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
                  <Ruler className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 id="service-evidence-title" className="text-sm font-extrabold text-[var(--color-text)]">
                    {language === 'hi' ? evidenceGuide.titleHi : evidenceGuide.titleEn}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                    {language === 'hi' ? evidenceGuide.descriptionHi : evidenceGuide.descriptionEn}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-4 sm:p-5">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-text-subtle)]">
                      {t('1. Add measurements', '1. माप जोड़ें')}
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                      {t('Optional — enter only what you can measure safely.', 'वैकल्पिक — जो सुरक्षित रूप से माप सकें वही भरें।')}
                    </p>
                  </div>
                  {measurementEntries.length > 0 && <Badge variant="success" size="sm">{measurementEntries.length} {t('added', 'जोड़े')}</Badge>}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {evidenceGuide.measurements.map((field) => (
                    <label key={field.key} className="block text-xs font-semibold text-[var(--color-text)]">
                      {language === 'hi' ? field.labelHi : field.labelEn}
                      <span className="mt-1 flex overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus-within:border-[var(--color-primary)] focus-within:ring-1 focus-within:ring-[var(--color-primary)]">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={siteMeasurements[field.key] || ''}
                          onChange={(event) => setSiteMeasurements((current) => ({ ...current, [field.key]: event.target.value.slice(0, 40) }))}
                          placeholder={field.placeholder}
                          className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-base font-normal outline-none sm:text-sm"
                        />
                        <span className="flex min-w-14 items-center justify-center border-l border-[var(--color-border)] px-2 text-[11px] font-bold text-[var(--color-text-muted)]">{field.unit}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-[var(--color-border)] pt-5">
                <div className="mb-3">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-text-subtle)]">
                    {t('2. Select angle & add photo', '2. एंगल चुनें और फोटो जोड़ें')}
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                    {t(`Up to ${MAX_SITE_PHOTOS} photos. JPG, PNG or WebP; files are compressed before upload.`, `अधिकतम ${MAX_SITE_PHOTOS} फोटो; अपलोड से पहले फोटो कंप्रेस होंगे।`)}
                  </p>
                </div>
                <label className="block text-xs font-semibold text-[var(--color-text)]" htmlFor="guided-shot-type">
                  {t('Photo angle / subject', 'फोटो एंगल / विषय')}
                </label>
                <select
                  id="guided-shot-type"
                  value={selectedShotType}
                  onChange={(event) => setSelectedShotType(event.target.value)}
                  className="mt-1 block min-h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-base focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] sm:text-sm"
                >
                  {evidenceGuide.shots.map((shot) => (
                    <option key={shot.id} value={shot.id}>{language === 'hi' ? shot.labelHi : shot.labelEn}</option>
                  ))}
                </select>
                {selectedShot && (
                  <p id="guided-shot-hint" className="mt-1.5 text-[11px] text-[var(--color-text-muted)]">
                    {language === 'hi' ? selectedShot.hintHi : selectedShot.hintEn}
                  </p>
                )}

                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <label
                    htmlFor="guided-site-photos"
                    className={cn(
                      'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition-colors',
                      sitePhotos.length >= MAX_SITE_PHOTOS || isPreparingPhotos
                        ? 'cursor-not-allowed border-[var(--color-border)] text-[var(--color-text-subtle)] opacity-60'
                        : 'border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)]'
                    )}
                  >
                    <ImagePlus className="h-4 w-4" aria-hidden="true" />
                    {isPreparingPhotos ? t('Preparing…', 'तैयार हो रहा है…') : t('Upload photos', 'फोटो अपलोड करें')}
                  </label>
                  <input
                    id="guided-site-photos"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={sitePhotos.length >= MAX_SITE_PHOTOS || isPreparingPhotos}
                    className="sr-only"
                    onChange={(event) => {
                      void handleSitePhotos(event.target.files, 'UPLOAD');
                      event.target.value = '';
                    }}
                  />

                  <label
                    htmlFor="guided-mobile-camera"
                    className={cn(
                      'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition-colors',
                      sitePhotos.length >= MAX_SITE_PHOTOS || isPreparingPhotos
                        ? 'cursor-not-allowed border-[var(--color-border)] text-[var(--color-text-subtle)] opacity-60'
                        : 'border-[var(--color-brand-brown)] text-[var(--color-brand-brown)] hover:bg-[#F7EFE7]'
                    )}
                  >
                    <Camera className="h-4 w-4" aria-hidden="true" />
                    {t('Mobile camera', 'मोबाइल कैमरा')}
                  </label>
                  <input
                    id="guided-mobile-camera"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    disabled={sitePhotos.length >= MAX_SITE_PHOTOS || isPreparingPhotos}
                    className="sr-only"
                    onChange={(event) => {
                      void handleSitePhotos(event.target.files, 'MOBILE_CAMERA');
                      event.target.value = '';
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setIsLiveCameraOpen(true)}
                    disabled={sitePhotos.length >= MAX_SITE_PHOTOS || isPreparingPhotos}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-bold text-white transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Camera className="h-4 w-4" aria-hidden="true" />
                    {t('Live capture', 'लाइव कैप्चर')}
                  </button>
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-[var(--color-text-subtle)]">
                  {t('Do not photograph people, documents, house numbers or private belongings unless necessary and permitted.', 'बिना ज़रूरत और अनुमति के लोगों, दस्तावेज़, घर नंबर या निजी सामान की फोटो न लें।')}
                </p>
              </div>

              <div className="border-t border-[var(--color-border)] pt-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-subtle)] text-[var(--color-primary)]">
                    <MapPinned className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[var(--color-text)]">{t('3. Exact location (optional)', '3. सटीक लोकेशन (वैकल्पिक)')}</p>
                    <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">{t('Attach GPS coordinates for faster site verification.', 'तेज़ सत्यापन के लिए GPS लोकेशन जोड़ें।')}</p>
                    {siteCoordinates ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <a href={`https://www.google.com/maps?q=${siteCoordinates.latitude},${siteCoordinates.longitude}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[var(--color-primary-subtle)] px-3 py-2 text-xs font-bold text-[var(--color-primary)] hover:underline">
                          <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
                          {t('View captured location', 'जुड़ी लोकेशन देखें')}
                        </a>
                        <button type="button" onClick={() => { setSiteCoordinates(null); setGeoStatus('idle'); setGeoMessage(null); }} className="min-h-11 rounded-lg px-2.5 py-2 text-xs font-bold text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]">{t('Remove', 'हटाएँ')}</button>
                      </div>
                    ) : (
                      <button type="button" onClick={captureSiteLocation} disabled={geoStatus === 'loading'} className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-[var(--color-primary)] px-3 py-2 text-xs font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-primary-subtle)] disabled:cursor-wait disabled:opacity-60">
                        {geoStatus === 'loading' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
                        {geoStatus === 'loading' ? t('Detecting…', 'खोज रहे हैं…') : t('Use current location', 'वर्तमान लोकेशन जोड़ें')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {sitePhotos.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label={t('Selected site photos', 'चुनी हुई साइट फोटो')}>
              {sitePhotos.map((photo) => (
                <div key={photo.id} className="group relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
                  <img src={photo.dataUrl} alt={photo.name} className="aspect-[4/3] w-full object-cover" />
                  <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                    <span className="min-w-0">
                      <span className="block truncate text-[10px] font-bold text-[var(--color-text)]">{photo.shotLabel || t('Site photo', 'साइट फोटो')}</span>
                      <span className="block truncate text-[9px] font-medium text-[var(--color-text-muted)]">{photo.sizeLabel} · {(photo.captureMethod || 'UPLOAD').replace(/_/g, ' ').toLowerCase()}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSitePhotos((current) => current.filter((item) => item.id !== photo.id))}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#B42318] hover:bg-[#FEF2F2]"
                      aria-label={t(`Remove ${photo.name}`, `${photo.name} हटाएँ`)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {photoError && <p role="alert" className="text-xs font-medium text-[#B42318]">{photoError}</p>}
          {geoMessage && (
            <p role="status" className={cn('text-xs font-medium', geoStatus === 'error' ? 'text-[#B42318]' : 'text-[var(--color-primary)]')}>
              {geoMessage}
            </p>
          )}
        </div>
      )}

      {/* STEP: Details */}
      {step === 'details' && <div className="space-y-4">{detailFields.map(renderField)}</div>}

      {/* STEP: Budget */}
      {step === 'budget' && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--color-text)]">
              {t('Approximate budget', 'अनुमानित बजट')}
            </label>
            <select
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-3 text-base sm:text-sm focus:border-[#1697C4] focus:outline-none focus:ring-1 focus:ring-[#1697C4]"
            >
              {BUDGET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {language === 'hi' ? opt.labelHi : opt.labelEn}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--color-text)]">
              {t('When do you want to start?', 'कब शुरू करना चाहते हैं?')}
            </label>
            <select
              value={targetTimeline}
              onChange={(e) => setTargetTimeline(e.target.value)}
              className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-3 text-base sm:text-sm focus:border-[#1697C4] focus:outline-none focus:ring-1 focus:ring-[#1697C4]"
            >
              {TIMELINE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {language === 'hi' ? opt.labelHi : opt.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* STEP: Contact */}
      {step === 'contact' && (
        <div className="space-y-4">
          {privateDiscussion && (
            <div className="flex items-start gap-2 rounded-xl border border-[#D9B38C] bg-[#FFF7ED] p-3 text-xs text-[#75401F]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>Your contact is collected only for BuildEcoGroup coordination. It is automatically hidden from the consultant workspace.</span>
            </div>
          )}
          {user && (
            <div className="flex items-center gap-2 rounded-xl border border-[#C6DEE8] bg-[#EAF4F8] p-3 text-xs text-[var(--color-brand-brown)]">
              <User className="h-4 w-4 shrink-0" />
              <span>
                {t('Submitting as', 'जमा कर रहे हैं')}: <strong>{user.fullName}</strong> ({user.role})
              </span>
            </div>
          )}
          {!user && (
            <p className="text-xs text-[var(--color-text-muted)]">
              {t('Already have an account?', 'पहले से खाता है?')}{' '}
              <Link to={ROUTES.LOGIN} className="font-bold text-[var(--color-primary)] hover:underline">
                {t('Login', 'लॉगिन')}
              </Link>{' '}
              {t('to link this case to your dashboard.', '— केस को डैशबोर्ड से जोड़ें।')}
            </p>
          )}
          <Input
            label={t('Full name', 'पूरा नाम')}
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
          <Input
            label={t('Email', 'ईमेल')}
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
          />
          <Input
            label={t('Phone (WhatsApp preferred)', 'फोन (WhatsApp पसंदीदा)')}
            type="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder="+91 98765 43210"
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--color-text)]">
              {t('Preferred contact', 'पसंदीदा संपर्क')}
            </label>
            <div className="flex flex-wrap gap-2">
              {(['WHATSAPP', 'CALL', 'EMAIL'] as const).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setPreferredContact(ch)}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-xs font-bold transition-colors',
                    preferredContact === ch
                      ? 'border-[#1697C4] bg-[var(--color-primary)] text-white'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]'
                  )}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-start gap-2 text-xs text-[var(--color-text-muted)] cursor-pointer">
            <input
              type="checkbox"
              checked={consentAccepted}
              onChange={(e) => setConsentAccepted(e.target.checked)}
              className="mt-0.5 rounded border-[var(--color-border)]"
            />
            <span>
              {t(
                privateDiscussion
                  ? 'I agree to be contacted by BuildEcoGroup coordinators. My phone and email will not be shared with the consultant.'
                  : 'I agree to be contacted by BuildEcoGroup coordinators about this requirement. Technical details may be collected later by the assigned expert.',
                'मैं इस आवश्यकता के बारे में BuildEcoGroup को संपर्क करने की सहमति देता/देती हूँ।'
              )}
            </span>
          </label>
        </div>
      )}

      {/* STEP: Review */}
      {step === 'review' && (
        <div className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm">
          <div>
            <span className="text-[10px] font-bold uppercase text-[var(--color-text-subtle)]">{t('Service', 'सेवा')}</span>
            <p className="font-bold text-[var(--color-text)]">{selectedService.title}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-[var(--color-text-subtle)]">{t('Location', 'स्थान')}</span>
            <p className="text-[var(--color-text)]">{siteAddress}, {locationCity}{pincode ? ` — ${pincode}` : ''}</p>
            {(siteCoordinates || sitePhotos.length > 0 || measurementEntries.length > 0) && (
              <p className="mt-1 text-xs font-medium text-[var(--color-primary)]">
                {[
                  siteCoordinates ? t('GPS location attached', 'GPS लोकेशन जुड़ी है') : null,
                  sitePhotos.length ? t(`${sitePhotos.length} site photo(s) attached`, `${sitePhotos.length} साइट फोटो जुड़ी हैं`) : null,
                  measurementEntries.length ? t(`${measurementEntries.length} measurement(s) added`, `${measurementEntries.length} माप जोड़े गए`) : null,
                ].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-[var(--color-text-subtle)]">{t('Details', 'विवरण')}</span>
            <ul className="mt-1 space-y-0.5 text-xs text-[var(--color-text-muted)]">
              {Object.entries(details).map(([k, v]) => (
                <li key={k}><span className="font-semibold">{k}:</span> {v}</li>
              ))}
            </ul>
          </div>
          {serviceNeedsBudgetStep(selectedService) && (
            <div>
              <span className="text-[10px] font-bold uppercase text-[var(--color-text-subtle)]">{t('Budget & timeline', 'बजट')}</span>
              <p className="text-[var(--color-text)]">{budgetRange} · {targetTimeline}</p>
            </div>
          )}
          <div>
            <span className="text-[10px] font-bold uppercase text-[var(--color-text-subtle)]">{t('Contact', 'संपर्क')}</span>
            <p className="text-[var(--color-text)]">{clientName} · {clientEmail} · {clientPhone}</p>
            {privateDiscussion && <p className="mt-1 text-xs font-semibold text-[var(--color-primary)]">Phone and email visible only to BuildEcoGroup coordination.</p>}
          </div>
          {submitError && (
            <div className="rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-2 text-xs text-[#DC2626]">{submitError}</div>
          )}
        </div>
      )}

      {/* STEP: Success */}
      {step === 'success' && caseReference && (
        <div className="space-y-6 text-center py-4" data-testid="wizard-success">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)]">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[var(--color-text)]">
              {t('Request created successfully', 'अनुरोध सफलतापूर्वक बनाया गया')}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {t('Your Case ID', 'आपका Case ID')}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <code className="rounded-xl bg-[#191C1A] px-4 py-2 text-lg font-mono font-bold text-[#A8D4E5]" data-testid="wizard-case-id">
                {caseReference}
              </code>
              <button
                type="button"
                onClick={copyCaseId}
                className="rounded-lg border border-[var(--color-border)] p-2 hover:bg-[var(--color-surface-muted)]"
                title="Copy"
              >
                {copiedId ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-3 text-xs text-[var(--color-text-muted)] max-w-md mx-auto">
              {t(
                'Your request now appears in My Requests. A coordinator will review it and assign a consultant.',
                'आपका अनुरोध My Requests में दिखेगा। कोऑर्डिनेटर समीक्षा करेंगे और सलाहकार नियुक्त करेंगे।'
              )}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to={`${ROUTES.DASHBOARD}?highlight=${encodeURIComponent(caseReference)}`}>
              <Button variant="primary" size="md" leftIcon={<Eye className="h-4 w-4" />}>
                {t('View My Request', 'मेरा अनुरोध देखें')}
              </Button>
            </Link>
          </div>
          <button
            type="button"
            onClick={() => {
              setStep('service');
              setCaseReference(null);
              setDetails({});
              setSiteAddress('');
              setSitePhotos([]);
              setSiteCoordinates(null);
              setPhotoError(null);
              setGeoStatus('idle');
              setGeoMessage(null);
            }}
            className="text-xs font-bold text-[var(--color-primary)] hover:underline"
          >
            {t('Submit another requirement', 'एक और आवश्यकता जमा करें')}
          </button>
        </div>
      )}

      {/* Sticky footer nav — mobile-first */}
      {step !== 'success' && (
        <div className="sticky bottom-16 lg:bottom-0 z-20 mt-8 flex gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 pt-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm -mx-4 px-4 sm:-mx-6 sm:px-6">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={goBack}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="flex-1 sm:flex-none"
          >
            {step === 'service' ? t('Cancel', 'रद्द') : t('Back', 'पीछे')}
          </Button>
          {step === 'review' ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none min-h-12"
              rightIcon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              data-testid="wizard-submit"
            >
              {isSubmitting ? t('Submitting…', 'जमा हो रहा…') : t('Submit Requirement', 'आवश्यकता जमा करें')}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={goNext}
              className="flex-1 sm:flex-none min-h-12"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              data-testid="wizard-next"
            >
              {t('Continue', 'आगे')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
